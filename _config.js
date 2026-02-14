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
// NOTE: Preserve script tag attributes to maintain Cloudflare beacon SRI integrity validation
// Cloudflare injects a beacon script with SRI hash - if minification modifies the script tag
// structure/attributes, the hash validation fails and the script is blocked by the browser
site.use(
    minifyHTML({
        options: {
            keep_spaces_between_attributes: true,
            keep_ssi_data_attributes: true,
            preserve_entities: true,
            remove_empty_attributes: false,
        },
    })
)

export default site
