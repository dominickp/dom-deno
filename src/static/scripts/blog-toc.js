/**
 * Table of contents for blog posts.
 *
 * Builds the link list from the article's own `h2`/`h3` headings, generates
 * stable ids for headings that do not ship one, and highlights the section
 * currently in view.
 */

function slugifyHeading(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

export function initializeBlogPostToc() {
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
