/**
 * Random accent theme for the page background.
 *
 * Every load picks a new accent colour and uses it both for the page background
 * gradient and for the `--accent-rgb` custom property consumed by the
 * stylesheet (selection colour, hover states, focus rings).
 *
 * The colour is constrained so white text stays readable on top of it, even
 * after the photographic backdrop brightens it.
 */

function hueToRgb(p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
}

function hslToRgb(h, s, l) {
    if (s === 0) {
        return [l, l, l]
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    return [
        hueToRgb(p, q, h + 1 / 3),
        hueToRgb(p, q, h),
        hueToRgb(p, q, h - 1 / 3),
    ]
}

function srgbToLinear(channel) {
    return channel <= 0.04045
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4)
}

function relativeLuminance(rgb) {
    return (
        0.2126 * srgbToLinear(rgb[0]) +
        0.7152 * srgbToLinear(rgb[1]) +
        0.0722 * srgbToLinear(rgb[2])
    )
}

function randomReadableColor() {
    // White text (luminance ~1.0) vs background: to reach WCAG AAA (7:1)
    // we need background relative luminance <= ~0.10. We tighten below that
    // because the page also blends a 20%-alpha photo underneath the accent
    // gradient, which brightens the *effective* background and eats contrast.
    const maxLuminance = 0.06

    // Mix two families of tones: lively muted hues most of the time, and
    // deeper, near-gray dark mixes the rest — matching the quieter variety the
    // old channel-capped algorithm used to produce.
    const attempts = 16

    for (let attempt = 0; attempt < attempts; attempt++) {
        const hue = Math.random()
        const useColorful = Math.random() < 0.6
        const saturation = useColorful
            ? 0.25 + Math.random() * 0.3
            : 0.02 + Math.random() * 0.2
        let lightness = (useColorful ? 0.12 : 0.05) + Math.random() * 0.18
        let rgb = hslToRgb(hue, saturation, lightness)
        let rgb01 = rgb.map(function (channel) {
            return Math.round(channel * 255) / 255
        })

        // Scale lightness down until the color clears the contrast bar.
        for (
            let pass = 0;
            pass < 6 && relativeLuminance(rgb01) > maxLuminance;
            pass++
        ) {
            lightness *= 0.85
            rgb = hslToRgb(hue, saturation, lightness)
            rgb01 = rgb.map(function (channel) {
                return Math.round(channel * 255) / 255
            })
        }

        if (relativeLuminance(rgb01) <= maxLuminance) {
            return rgb.map(function (channel) {
                return Math.round(channel * 255)
            })
        }
    }

    return [0, 0, 0]
}

/** Pick an accent colour and paint the page background with it. */
export function applyBackgroundTheme() {
    const [red, green, blue] = randomReadableColor()
    const html = document.documentElement
    const isBlogPost = document.body.classList.contains('page-blog-post')
    const isResume = document.body.classList.contains('page-resume')
    const accentRgb = `${red}, ${green}, ${blue}`
    const backgroundColor = `rgba(${red}, ${green}, ${blue}, 0.8)`

    let backgroundImage = "url('/static/dom.webp')"
    let backgroundPosition = '0 35%'
    let backgroundSize = 'cover'

    // Document-reading pages trade the photo backdrop for a quiet surface so
    // the rendered PDF stays the sharpest thing on screen.
    if (isBlogPost || isResume) {
        backgroundImage = 'none'
    }

    html.style.backgroundImage = `linear-gradient(rgba(${accentRgb}, 0.8), rgba(${accentRgb}, 0.8)), ${backgroundImage}`
    html.style.backgroundColor = backgroundColor
    html.style.backgroundPosition = backgroundPosition
    html.style.backgroundSize = backgroundSize
    html.style.setProperty('--accent-rgb', accentRgb)

    const stylesheet = document.styleSheets[0]
    if (stylesheet && 'insertRule' in stylesheet) {
        stylesheet.insertRule(
            `::selection { background: rgb(${accentRgb}); }`,
            0
        )
    }
}
