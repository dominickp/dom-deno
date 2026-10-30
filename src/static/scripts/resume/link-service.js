/**
 * Link handling for PDF annotations.
 *
 * `AnnotationLayer` only needs a handful of methods from a link service. This
 * implementation keeps everything in-page (no PDF.js `PDFLinkService`, which is
 * built for the full viewer UI) and sanitizes URLs before turning them into
 * anchors.
 */
export function createResumeLinkService(pdfjs, pdf, pagesEl) {
    function pageIndexForDestination(destination) {
        if (!Array.isArray(destination) || !destination.length) {
            return Promise.resolve(null)
        }

        return Promise.resolve(pdf.getPageIndex(destination[0])).catch(
            function () {
                return null
            }
        )
    }

    return {
        externalLinkTarget: 2,
        externalLinkRel: 'noopener noreferrer nofollow',

        getDestinationHash() {
            return '#'
        },

        getAnchorUrl(hash) {
            return hash || '#'
        },

        goToDestination(destination) {
            pageIndexForDestination(destination).then(function (index) {
                const target =
                    typeof index === 'number' && pagesEl.children[index + 1]

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    })
                }
            })
        },

        // Named actions, OCG toggles and attachments are not used by a
        // resume, but AnnotationLayer calls into them defensively.
        executeNamedAction() {},
        executeSetOCGState() {},

        addLinkAttributes(link, url, newWindow = false) {
            const parsed = pdfjs.createValidAbsoluteUrl(url, null, {
                addDefaultProtocol: true,
            })

            if (!parsed) {
                // Never render an unsafe or malformed href.
                link.href = '#'
                link.addEventListener('click', function (event) {
                    event.preventDefault()
                })
                return
            }

            const isWeb =
                parsed.protocol === 'http:' || parsed.protocol === 'https:'

            // `tel:` and `mailto:` must stay in the current tab so the
            // browser/handler treats them as protocol links.
            if (isWeb) {
                link.href = parsed.href
                link.title = parsed.href
                link.rel = this.externalLinkRel

                if (newWindow || this.externalLinkTarget === 2) {
                    link.target = '_blank'
                }

                return
            }

            link.href = parsed.href
            link.title = parsed.href
        },
    }
}
