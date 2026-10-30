/**
 * Per-page DOM and rendering for the resume viewer.
 *
 * One "entry" object owns everything belonging to a single PDF page: the
 * visible canvas, the unfiltered photo overlay, the text and annotation layers,
 * and the offscreen staging canvas used while rendering.
 */

import { collectImageRects, updateResumeImageOverlay } from './image-overlay.js'

/**
 * Render one PDF page onto its canvas, refresh the selectable text layer and
 * position the annotation (link) layer.
 *
 * The canvas is drawn at device-pixel resolution for crisp text, while the
 * text and annotation layers stay in CSS pixels: PDF.js sizes their content
 * with `calc(... * var(--scale-factor))`, so a resize only needs a new scale
 * factor plus a canvas repaint.
 *
 * The page is rendered into a detached staging canvas and only copied to the
 * visible one once the photo overlay is composed. Painting straight to the
 * visible canvas would show a frame or two of the page with dark mode applied
 * but the (unfiltered) photo overlay still empty, which flashes the photo in
 * inverted colors before it settles.
 */
export async function renderPdfPage(entry, cssWidth, pixelRatio) {
    const baseViewport = entry.page.getViewport({ scale: 1 })
    const cssViewport = entry.page.getViewport({
        scale: cssWidth / baseViewport.width,
    })
    const deviceViewport = entry.page.getViewport({
        scale: cssViewport.scale * pixelRatio,
    })
    const staging = entry.staging
    const stagingContext = staging.getContext('2d', { alpha: false })

    entry.frame.style.setProperty('--scale-factor', String(cssViewport.scale))
    staging.width = Math.floor(deviceViewport.width)
    staging.height = Math.floor(deviceViewport.height)

    await entry.page.render({
        canvasContext: stagingContext,
        viewport: deviceViewport,
    }).promise

    updateResumeImageOverlay(entry, deviceViewport)

    // Both canvases now hold the finished page, so reveal them together: the
    // browser paints at most once at the end of this task, which is what keeps
    // the swap atomic.
    const canvas = entry.canvas
    const context = canvas.getContext('2d', { alpha: false })

    canvas.width = staging.width
    canvas.height = staging.height
    context.drawImage(staging, 0, 0)

    const { pdfjs } = entry

    if (pdfjs.TextLayer) {
        if (entry.textLayer) {
            entry.textLayer.update({ viewport: cssViewport })
        } else {
            entry.textLayer = new pdfjs.TextLayer({
                textContentSource: entry.page.streamTextContent({
                    includeMarkedContent: true,
                }),
                container: entry.textLayerEl,
                viewport: cssViewport,
            })
            await entry.textLayer.render()
        }
    }

    if (entry.annotationLayer) {
        entry.annotationLayer.update({ viewport: cssViewport })
    }
}

/**
 * Build the DOM for one page and return the entry `renderPdfPage` expects.
 *
 * The entry is added to `pagesEl` immediately so the card reserves its final
 * shape before the page is painted.
 */
export async function createResumePage({
    pdf,
    pdfjs,
    pageNumber,
    pageCount,
    linkService,
    pagesEl,
}) {
    const page = await pdf.getPage(pageNumber)
    const frame = document.createElement('div')
    const canvas = document.createElement('canvas')
    const imageLayer = document.createElement('canvas')
    const textLayerEl = document.createElement('div')
    const annotationLayerEl = document.createElement('div')

    frame.className = 'resume-page'
    frame.dataset.page = String(pageNumber)

    // Reserve the page's real shape before it is painted, so the card does not
    // jump in height once the canvas is sized.
    const baseViewport = page.getViewport({ scale: 1 })
    frame.style.aspectRatio = `${baseViewport.width} / ${baseViewport.height}`

    canvas.className = 'resume-canvas'
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', `Resume page ${pageNumber} of ${pageCount}`)

    // Decorative: the photos are already described by the page itself.
    imageLayer.className = 'resume-image-layer'
    imageLayer.setAttribute('aria-hidden', 'true')

    textLayerEl.className = 'resume-text-layer'
    annotationLayerEl.className = 'resume-annotation-layer'

    frame.append(canvas, imageLayer, textLayerEl, annotationLayerEl)
    pagesEl.append(frame)

    const entry = {
        page,
        canvas,
        // Offscreen buffer the page is rendered into; see renderPdfPage.
        staging: document.createElement('canvas'),
        imageLayer,
        frame,
        textLayerEl,
        annotationLayerEl,
        imageRects: [],
        textLayer: null,
        annotationLayer: null,
        pdfjs,
    }

    entry.imageRects = await collectImageRects(page, pdfjs)

    // Annotations (hyperlinks, mostly) do not depend on the render scale:
    // PDF.js positions them in percentages, so they survive a resize.
    if (pdfjs.AnnotationLayer) {
        const annotations = await page.getAnnotations({ intent: 'display' })

        if (annotations.length) {
            const annotationLayer = new pdfjs.AnnotationLayer({
                div: annotationLayerEl,
                page,
                viewport: baseViewport,
            })

            await annotationLayer.render({
                annotations,
                linkService,
                renderForms: false,
            })

            entry.annotationLayer = annotationLayer
        } else {
            annotationLayerEl.hidden = true
        }
    }

    return entry
}
