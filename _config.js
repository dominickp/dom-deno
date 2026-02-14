import lume from 'lume/mod.ts'
import lightningCss from 'lume/plugins/lightningcss.ts'
import minifyHTML from 'lume/plugins/minify_html.ts'
import nunjucks from 'lume/plugins/nunjucks.ts'
import cache_busting from 'lume/middlewares/cache_busting.ts'
import serveCLI from './serveCLI.ts'

const site = lume({
    src: './src',
    server: {
        page404: './not-found/index.html',
        middlewares: [
            cache_busting({ regex: /\/v[\d]+\//, replacement: '/' }),
            serveCLI(),
        ],
    },
})

site.use(nunjucks())

// Add CSS files
site.add(['.css'])

// Minify CSS
site.use(lightningCss({ extensions: ['.css'] }))

// Copy in anime.min.js
site.copy(['.min.js'])

// Add static files
site.add('static')

// Copy robots.txt
site.copy('./robots.txt')

// Minify HTML
site.use(minifyHTML({ options: { keep_spaces_between_attributes: true } }))

export default site
