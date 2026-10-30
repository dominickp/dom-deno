/**
 * Homepage SVG visualizations, animated with anime.js.
 *
 * anime.js is loaded as a classic script in the layout, so it is available as
 * the `anime` global. Every initializer no-ops when its markup (or anime.js
 * itself) is absent, which is what lets all of them run on every page.
 */

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

/** Start every homepage animation that has matching markup on this page. */
export function initializeVisualizations() {
    initializeDomLogoVisualization()
    initializePanelVisualization()
    initializePipelineVisualization()
    initializeCloudVisualization()
}
