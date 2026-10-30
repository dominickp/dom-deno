/**
 * Link decoders and handlers.
 *
 * Several destinations (the email address and the resume PDF) are never
 * written into the HTML as plain values: templates ship them base64 encoded and
 * they are decoded here on first interaction. Crawlers that only parse HTML or
 * that fetch every link they see therefore never discover them.
 */

/**
 * Decode a base64 token into a string, returning `''` when the value is
 * missing or malformed.
 */
export function decodeToken(value) {
    try {
        return atob(value || '')
    } catch (error) {
        return ''
    }
}

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

/** Wire up `a[data-contact]` links so the address is revealed on use. */
export function configureContactLinks() {
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

/**
 * Reveal a link whose destination ships base64-encoded in `data-link`.
 *
 * Templates never write the path into `href`, so crawlers that only parse HTML
 * (or fetch every link they see) do not discover it. The real href is written
 * on first hover/focus/tap, which is also when a human would click it.
 */
function revealEncodedLink(link) {
    if (link.dataset.revealed === 'true') {
        return
    }

    const target = decodeToken(link.dataset.link)

    if (!target) {
        return
    }

    link.href = target
    link.dataset.revealed = 'true'
}

/** Wire up `a[data-link]` links so the destination is revealed on use. */
export function configureEncodedLinks() {
    for (const link of document.querySelectorAll('a[data-link]')) {
        link.addEventListener('focus', function () {
            revealEncodedLink(link)
        })

        link.addEventListener('mouseenter', function () {
            revealEncodedLink(link)
        })

        link.addEventListener(
            'touchstart',
            function () {
                revealEncodedLink(link)
            },
            { passive: true }
        )

        link.addEventListener('click', function () {
            revealEncodedLink(link)
        })
    }
}
