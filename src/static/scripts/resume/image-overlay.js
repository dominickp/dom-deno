/**
 * Dark mode for the rendered document.
 *
 * Re-rendering the PDF in different colours would mean shipping a second copy
 * of every page, so the canvas is inverted with a CSS filter instead. That
 * would invert embedded photos too, which looks wrong, so the rectangles
 * PDF.js paints images into are collected up front and copied out of the
 * canvas into an unfiltered overlay stacked on top of it.
 */

/**
 * Collect the PDF-space rectangles of the images painted on one page.
 *
 * `getOperatorList` returns the page's drawing operations in order, and images
 * are painted into the unit square of the current transform, so tracking
 * `transform` / `save` / `restore` (plus form XObject begin and end, which
 * apply and restore a matrix the same way) gives each image's placement.
 */
export async function collectImageRects(page, pdfjs) {
    const ops = pdfjs.OPS
    let opList

    try {
        opList = await page.getOperatorList()
    } catch (error) {
        return []
    }

    // Image masks are stencils (logos, icons) rather than photographs, and
    // their "colors" come from the fill, so they should keep following the
    // inverted canvas.
    const imageOps = [
        ops.paintImageXObject,
        ops.paintInlineImageXObject,
        ops.paintJpegXObject,
    ].filter(function (value) {
        return typeof value === 'number'
    })

    const rects = []
    const stack = []
    let transform = [1, 0, 0, 1, 0, 0]

    for (let index = 0; index < opList.fnArray.length; index++) {
        const fn = opList.fnArray[index]
        const args = opList.argsArray[index]

        if (fn === ops.save) {
            stack.push(transform)
            continue
        }

        if (fn === ops.restore) {
            transform = stack.pop() || [1, 0, 0, 1, 0, 0]
            continue
        }

        if (fn === ops.transform) {
            transform = pdfjs.Util.transform(transform, args)
            continue
        }

        if (fn === ops.paintFormXObjectBegin) {
            stack.push(transform)
            transform = pdfjs.Util.transform(transform, args[0])
            continue
        }

        if (fn === ops.paintFormXObjectEnd) {
            transform = stack.pop() || [1, 0, 0, 1, 0, 0]
            continue
        }

        if (imageOps.indexOf(fn) === -1) {
            continue
        }

        const [a, b, c, d, e, f] = transform
        const corners = [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
        ].map(function (point) {
            return [
                a * point[0] + c * point[1] + e,
                b * point[0] + d * point[1] + f,
            ]
        })
        const xs = corners.map(function (point) {
            return point[0]
        })
        const ys = corners.map(function (point) {
            return point[1]
        })

        rects.push([
            Math.min.apply(null, xs),
            Math.min.apply(null, ys),
            Math.max.apply(null, xs),
            Math.max.apply(null, ys),
        ])
    }

    return rects
}

/**
 * Copy one region of the rendered page into the overlay, dropping the page
 * background around the photo.
 *
 * Photos in the PDF are rectangular bitmaps: a headshot is a white square with
 * a circular crop painted on top. Copying the pixels verbatim would drag that
 * white square into dark mode, where it reads as a bright box.
 *
 * Only background is removed: near-white pixels are flood filled inwards from
 * the edges of the region, so white *inside* the photo (teeth, a white shirt)
 * is untouched. The alpha ramps with luminance instead of switching at a hard
 * threshold, which keeps anti-aliased crop edges from showing a fringe.
 */
function copyImageRegion(source, context, region) {
    const { left, top, width, height } = region
    // `getImageData` lives on the 2D context, not on the canvas element, and
    // reuses the context already created for rendering.
    const sourceContext = source.getContext('2d')
    const image = sourceContext.getImageData(left, top, width, height)
    const pixels = image.data

    const OPAQUE_AT = 0.97
    const TRANSPARENT_AT = 0.88
    const luminance = new Float32Array(width * height)

    for (let index = 0; index < pixels.length; index += 4) {
        luminance[index / 4] =
            (0.2126 * pixels[index] +
                0.7152 * pixels[index + 1] +
                0.0722 * pixels[index + 2]) /
            255
    }

    function isBackground(pixelIndex) {
        return luminance[pixelIndex] >= TRANSPARENT_AT
    }

    // Flood fill the background starting from every pixel on the border.
    const background = new Uint8Array(width * height)
    const queue = []

    function enqueue(x, y) {
        const pixelIndex = y * width + x

        if (background[pixelIndex] || !isBackground(pixelIndex)) {
            return
        }

        background[pixelIndex] = 1
        queue.push(pixelIndex)
    }

    for (let x = 0; x < width; x++) {
        enqueue(x, 0)
        enqueue(x, height - 1)
    }

    for (let y = 0; y < height; y++) {
        enqueue(0, y)
        enqueue(width - 1, y)
    }

    while (queue.length) {
        const pixelIndex = queue.pop()
        const x = pixelIndex % width
        const y = (pixelIndex - x) / width

        if (x > 0) enqueue(x - 1, y)
        if (x < width - 1) enqueue(x + 1, y)
        if (y > 0) enqueue(x, y - 1)
        if (y < height - 1) enqueue(x, y + 1)
    }

    for (let pixelIndex = 0; pixelIndex < background.length; pixelIndex++) {
        if (!background[pixelIndex]) {
            continue
        }

        const value = luminance[pixelIndex]
        const fade =
            value >= OPAQUE_AT
                ? 0
                : (OPAQUE_AT - value) / (OPAQUE_AT - TRANSPARENT_AT)

        pixels[pixelIndex * 4 + 3] = Math.round(
            pixels[pixelIndex * 4 + 3] * Math.min(1, Math.max(0, fade))
        )
    }

    // `putImageData` replaces pixels instead of compositing over them, which
    // is what makes the removed background stay transparent.
    context.putImageData(image, left, top)
}

/**
 * Copy the image areas of a freshly rendered page into the unfiltered overlay.
 *
 * The staging canvas already holds the rendered pixels; the CSS filter is
 * applied at paint time on the visible canvas, so copying from the staging
 * canvas gives the original colors. Reading pixels back requires a
 * same-origin canvas, which holds here: the PDF and the viewer are both served
 * from this site.
 */
export function updateResumeImageOverlay(entry, viewport) {
    const overlay = entry.imageLayer
    const source = entry.staging

    if (!overlay || !source.width || !source.height) {
        return
    }

    overlay.width = source.width
    overlay.height = source.height

    const context = overlay.getContext('2d')

    context.clearRect(0, 0, overlay.width, overlay.height)

    for (const rect of entry.imageRects || []) {
        const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(rect)
        const left = Math.max(0, Math.floor(Math.min(x1, x2)))
        const top = Math.max(0, Math.floor(Math.min(y1, y2)))
        const right = Math.min(source.width, Math.ceil(Math.max(x1, x2)))
        const bottom = Math.min(source.height, Math.ceil(Math.max(y1, y2)))
        const width = right - left
        const height = bottom - top

        if (width <= 0 || height <= 0) {
            continue
        }

        // Pad by a pixel so anti-aliased image edges do not show a seam. The
        // padding is white page, so it fades out with the background anyway.
        const pad = 1
        const sourceX = Math.max(0, left - pad)
        const sourceY = Math.max(0, top - pad)

        copyImageRegion(source, context, {
            left: sourceX,
            top: sourceY,
            width: Math.min(source.width - sourceX, width + pad * 2),
            height: Math.min(source.height - sourceY, height + pad * 2),
        })
    }
}
