/**
 * Site entry point.
 *
 * Every feature lives in its own module next to this file and no-ops when its
 * markup is not present, so each page only pays for the code it uses.
 */

import { applyBackgroundTheme } from './background-theme.js'
import { initializeBlogPostToc } from './blog-toc.js'
import { configureContactLinks, configureEncodedLinks } from './links.js'
import { configureResumeViewer } from './resume/viewer.js'
import { initializeVisualizations } from './visualizations.js'

function initialize() {
    configureContactLinks()
    configureEncodedLinks()
    applyBackgroundTheme()
    initializeVisualizations()
    initializeBlogPostToc()

    // Resume page only: renders the PDF client side. Its dark mode is handled
    // entirely in CSS via `prefers-color-scheme`.
    configureResumeViewer()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize)
} else {
    initialize()
}
