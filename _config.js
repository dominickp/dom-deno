import lume from 'lume/mod.ts'
import lightningCss from 'lume/plugins/lightningcss.ts'
import minifyHTML from 'lume/plugins/minify_html.ts'
import cache_busting from 'https://deno.land/x/lume@v1.18.4/middlewares/cache_busting.ts'
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

// Minify CSS
site.use(lightningCss({ extensions: ['.css'] }))

// Copy in anime.min.js
site.copy(['.min.js'])

// Grab all other static files
site.copyRemainingFiles((path) => path.startsWith('/static/'))

// Copy robots.txt
site.copy('./robots.txt')

// Minify HTML
site.use(minifyHTML({ options: { keep_spaces_between_attributes: true } }))

export default site
