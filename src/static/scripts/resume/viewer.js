/**
 * Resume viewer.
 *
 * The PDF path is never written into the HTML: templates ship it base64
 * encoded, and it is decoded here at runtime. PDF.js itself is self-hosted
 * (published from the `pdfjs-dist` npm dependency), so no third party ever sees
 * the request either.
 *
 * Everything no-ops when the current page has no viewer markup.
 */

import { decodeToken } from '../links.js'
import { createResumeLinkService } from './link-service.js'
import { createResumePage, renderPdfPage } from './page.js'

function setResumeLinkHrefs(path) {
    for (const link of document.querySelectorAll('[data-resume-pdf]')) {
        link.href = path
    }
}

function showResumeStatus(statusEl, message) {
    statusEl.textContent = message
    statusEl.hidden = false
}

async function loadPdfjs(viewer, statusEl) {
    const { pdfjsLib, pdfjsWorker } = viewer.dataset

    try {
        const pdfjs = await import(pdfjsLib)
        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker
        return pdfjs
    } catch (error) {
        showResumeStatus(
            statusEl,
            'The PDF viewer failed to load. Please try reloading the page.'
        )
        viewer.setAttribute('aria-busy', 'false')
        return null
    }
}

async function loadDocument(pdfjs, viewer, statusEl, pdfPath) {
    try {
        return await pdfjs.getDocument({
            url: pdfPath,
            standardFontDataUrl: viewer.dataset.pdfjsFonts,
        }).promise
    } catch (error) {
        showResumeStatus(
            statusEl,
            'The resume could not be loaded. Please try reloading the page.'
        )
        viewer.setAttribute('aria-busy', 'false')
        return null
    }
}

export async function configureResumeViewer() {
    const viewer = document.querySelector('[data-resume-viewer]')

    if (!viewer) {
        return
    }

    const pdfPath = decodeToken(viewer.dataset.resumePdf)

    if (!pdfPath) {
        return
    }

    setResumeLinkHrefs(pdfPath)

    const pagesEl = viewer.querySelector('[data-resume-pages]')
    const statusEl = viewer.querySelector('[data-resume-status]')

    // Rendered pages, kept so a resize can re-render at the new width.
    const rendered = []
    let renderToken = 0
    let lastWidth = 0

    function pixelRatio() {
        return Math.min(window.devicePixelRatio || 1, 2)
    }

    function measureWidth() {
        const width = pagesEl.clientWidth || viewer.clientWidth
        return Math.max(width, 280)
    }

    async function renderAll() {
        const width = measureWidth()
        const token = ++renderToken

        lastWidth = width

        for (const entry of rendered) {
            if (token !== renderToken) {
                return
            }

            try {
                await renderPdfPage(entry, width, pixelRatio())
            } catch (error) {
                showResumeStatus(
                    statusEl,
                    'This page of the PDF could not be displayed.'
                )
            }
        }

        if (token === renderToken) {
            statusEl.hidden = true
            viewer.dataset.ready = 'true'
            viewer.setAttribute('aria-busy', 'false')
        }
    }

    const pdfjs = await loadPdfjs(viewer, statusEl)

    if (!pdfjs) {
        return
    }

    const pdf = await loadDocument(pdfjs, viewer, statusEl, pdfPath)

    if (!pdf) {
        return
    }

    const linkService = createResumeLinkService(pdfjs, pdf, pagesEl)

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        rendered.push(
            await createResumePage({
                pdf,
                pdfjs,
                pageNumber,
                pageCount: pdf.numPages,
                linkService,
                pagesEl,
            })
        )
    }

    await renderAll()

    // Re-render when the available width actually changes (window resize,
    // mobile orientation change, or the user zooming in).
    let resizeTimer

    function scheduleRender(force) {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(function () {
            const width = measureWidth()

            if (force || Math.abs(width - lastWidth) > 4) {
                renderAll()
            }
        }, 200)
    }

    window.addEventListener('resize', function () {
        scheduleRender(false)
    })

    if ('ResizeObserver' in window) {
        const widthObserver = new ResizeObserver(function () {
            scheduleRender(false)
        })
        widthObserver.observe(pagesEl)
    }
}
