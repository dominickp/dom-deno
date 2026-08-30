function revealContactLink(link) {
    if (link.dataset.revealed === 'true') {
        return
    }

    const email = atob(link.dataset.contact || '')
    const subject = atob(link.dataset.subj || '')
    const emailLabel = link.querySelector('[data-contact-email]')

    link.href = `mailto:${email}?subject=${subject}`
    link.dataset.revealed = 'true'
    link.classList.add('is-revealed')

    if (emailLabel) {
        emailLabel.textContent = email
    }
}

function configureContactLinks() {
    for (const link of document.querySelectorAll('a[data-contact]')) {
        link.addEventListener('focus', function () {
            revealContactLink(link)
        })

        link.addEventListener('mouseenter', function () {
            revealContactLink(link)
        })

        link.addEventListener('click', function (event) {
            if (link.dataset.revealed !== 'true') {
                revealContactLink(link)
                event.preventDefault()
            }
        })
    }
}

function configureResumeLinks() {
    for (const link of document.querySelectorAll('a[data-resume-link]')) {
        link.addEventListener('focus', function () {
            link.href = atob(link.dataset.link || '')
        })

        link.addEventListener('mouseenter', function () {
            link.href = atob(link.dataset.link || '')
        })
    }
}

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
        let lightness =
            (useColorful ? 0.12 : 0.05) + Math.random() * 0.18
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

function applyBackgroundTheme() {
    const [red, green, blue] = randomReadableColor()
    const html = document.documentElement
    const isBlogPost = document.body.classList.contains('page-blog-post')
    const defaultAccentRgb = `${red}, ${green}, ${blue}`
    const defaultBackgroundColor = `rgba(${red}, ${green}, ${blue}, 0.8)`
    const defaultBackgroundImage = "url('/static/dom.webp')"
    const defaultBackgroundPosition = '0 35%'
    const defaultBackgroundSize = 'cover'

    let accentRgb = defaultAccentRgb
    let backgroundColor = defaultBackgroundColor
    let backgroundImage = defaultBackgroundImage
    let backgroundPosition = defaultBackgroundPosition
    let backgroundSize = defaultBackgroundSize

    if (isBlogPost) {
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

function initializeDomLogoVisualization() {
    if (typeof anime === 'undefined' || !document.querySelector('#dom-logo')) {
        return
    }

    const startDelay = 500
    const drawDuration = 11500
    const tracerDelay = 50

    anime.set('#dom-logo .dom-logo-main', {
        opacity: 1,
        strokeDasharray: 0,
        strokeDashoffset: 0,
    })

    anime.set('#dom-logo .dom-logo-tracer', {
        opacity: 0,
    })

    const tracerAnimation = anime({
        targets: '#dom-logo .dom-logo-tracer',
        strokeDashoffset: [anime.setDashoffset, 0],
        opacity: [0, 1, 0],
        easing: 'linear',
        duration: drawDuration,
        delay: function (_, index) {
            return tracerDelay + index * 250
        },
        direction: 'normal',
        loop: true,
        autoplay: false,
    })

    setTimeout(function () {
        tracerAnimation.play()
    }, startDelay)
}

function initializePanelVisualization() {
    if (typeof anime === 'undefined') {
        return
    }

    const wrapper = document.querySelector('#itg-viz-wrapper')
    if (!wrapper) {
        return
    }

    const timeline = anime.timeline({
        easing: 'linear',
        duration: 1000,
        loop: true,
        endDelay: 3000,
    })

    function hit(lane, at) {
        timeline.add(
            {
                targets: `#itg-viz-wrapper .panel#${lane}`,
                fill: 'rgba(255,255,255,0.9)',
                scale: 1.08,
                duration: 120,
                easing: 'easeOutQuad',
            },
            at
        )

        timeline.add(
            {
                targets: `#itg-viz-wrapper .panel#${lane}`,
                fill: 'rgba(255,255,255,0.2)',
                scale: 1,
                duration: 260,
                easing: 'easeOutQuad',
            },
            at + 120
        )

        timeline.add(
            {
                targets: `#itg-viz-wrapper .hit-ring[data-lane="${lane}"]`,
                opacity: [0, 0.8, 0],
                scale: [0.6, 1.6],
                duration: 300,
                easing: 'easeOutQuad',
            },
            at
        )
    }

    hit('left', 250)
    hit('up', 500)
    hit('down', 750)
    hit('right', 1000)
    hit('left', 1600)
    hit('up', 1850)
    hit('right', 2100)
    hit('down', 2350)
}

function initializePipelineVisualization() {
    if (
        typeof anime === 'undefined' ||
        !document.querySelector('#pipeline-viz')
    ) {
        return
    }

    anime({
        targets: '#pipeline-viz .process-b1',
        width: [0, 116],
        easing: 'easeInOutSine',
        duration: 2000,
        direction: 'alternate',
        loop: true,
    })

    anime({
        targets: '#pipeline-viz .process-b2',
        width: [0, 116],
        easing: 'easeInOutSine',
        duration: 2400,
        direction: 'alternate',
        loop: true,
        delay: 1300,
    })

    anime({
        targets: '#pipeline-viz .lag-a2',
        height: [0, 16, 16, 0],
        y: [102, 86, 86, 102],
        easing: 'easeInOutSine',
        duration: 12000,
        loop: true,
        delay: 3000,
    })

    anime({
        targets: '#pipeline-viz .lag-a2',
        fill: [
            'rgba(255,255,255,0.05)',
            'rgba(255,180,80,0.6)',
            'rgba(255,100,60,0.7)',
            'rgba(255,255,255,0.05)',
        ],
        easing: 'easeInOutSine',
        duration: 12000,
        loop: true,
        delay: 3000,
    })

    anime({
        targets: '#pipeline-viz .lag-b3',
        height: [0, 16, 0],
        y: [254, 238, 254],
        easing: 'easeInOutSine',
        duration: 8000,
        loop: true,
        delay: 6000,
    })

    anime({
        targets: '#pipeline-viz .lag-b3',
        fill: [
            'rgba(255,255,255,0.05)',
            'rgba(255,180,80,0.5)',
            'rgba(255,255,255,0.05)',
        ],
        easing: 'easeInOutSine',
        duration: 8000,
        loop: true,
        delay: 6000,
    })
}

function initializeCloudVisualization() {
    if (
        typeof anime === 'undefined' ||
        !document.querySelector('.staggering-axis-grid-demo .el')
    ) {
        return
    }

    anime({
        targets: '.staggering-axis-grid-demo .el',
        loop: true,
        scale: [
            {
                value: 0.1,
                easing: 'easeOutSine',
                duration: 500,
            },
            {
                value: 1,
                easing: 'easeInOutQuad',
                duration: 1200,
            },
            {
                value: 1,
                easing: 'easeInOutQuad',
                duration: 3200,
            },
        ],
        delay: anime.stagger(200, {
            grid: [10, 10],
            from: 'center',
        }),
    })
}

function slugifyHeading(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

function initializeBlogPostToc() {
    const article = document.querySelector('[data-blog-post]')
    const toc = document.querySelector('[data-blog-toc]')
    const tocContainer = document.querySelector('[data-blog-toc-container]')

    if (!article || !toc || !tocContainer) {
        return
    }

    const headings = Array.from(article.querySelectorAll('h2, h3'))
    if (!headings.length) {
        return
    }

    const usedIds = new Set(
        Array.from(document.querySelectorAll('[id]'), function (element) {
            return element.id
        })
    )

    for (const heading of headings) {
        if (!heading.id) {
            const baseId =
                slugifyHeading(heading.textContent || '') || 'section'
            let nextId = baseId
            let suffix = 2

            while (usedIds.has(nextId)) {
                nextId = `${baseId}-${suffix}`
                suffix += 1
            }

            heading.id = nextId
        }

        usedIds.add(heading.id)

        const link = document.createElement('a')
        link.href = `#${heading.id}`
        link.textContent = heading.textContent || ''

        if (heading.tagName === 'H3') {
            link.classList.add('is-subsection')
        }

        toc.appendChild(link)
    }

    tocContainer.hidden = false

    const tocLinks = Array.from(toc.querySelectorAll('a'))
    const observer = new IntersectionObserver(
        function (entries) {
            const visibleEntry = entries
                .filter(function (entry) {
                    return entry.isIntersecting
                })
                .sort(function (left, right) {
                    return (
                        left.boundingClientRect.top -
                        right.boundingClientRect.top
                    )
                })[0]

            if (!visibleEntry) {
                return
            }

            for (const link of tocLinks) {
                link.classList.toggle(
                    'is-active',
                    link.getAttribute('href') === `#${visibleEntry.target.id}`
                )
            }
        },
        {
            rootMargin: '0px 0px -70% 0px',
            threshold: [0, 1],
        }
    )

    for (const heading of headings) {
        observer.observe(heading)
    }
}

document.addEventListener('DOMContentLoaded', function () {
    configureResumeLinks()
    configureContactLinks()
    applyBackgroundTheme()
    initializeDomLogoVisualization()
    initializePanelVisualization()
    initializePipelineVisualization()
    initializeCloudVisualization()
    initializeBlogPostToc()
})
