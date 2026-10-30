// Resume data shared by the homepage link and the /resume/ viewer.
//
// The PDF lives at a stable, unlisted path and is disallowed in robots.txt.
// Templates only ever receive the base64-encoded form so the raw file path
// never appears in the rendered HTML: client-side code decodes it at runtime.

const pdfPath = '/static/dominick_peluso_resume.pdf'
const pagePath = '/resume/'

export default {
    /** Encoded, not rendered directly: only the JS decodes it */
    pdfToken: btoa(pdfPath),
    /** Encoded viewer page path, revealed on hover/focus/click */
    pageToken: btoa(pagePath),
    downloadName: 'Dominick-Peluso-Resume.pdf',
    libraryPath: '/static/vendor/pdfjs/build/pdf.min.mjs',
    workerPath: '/static/vendor/pdfjs/build/pdf.worker.min.mjs',
    standardFontsPath: '/static/vendor/pdfjs/standard_fonts/',
}
