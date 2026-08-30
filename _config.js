import lume from 'lume/mod.ts'
import lightningCss from 'lume/plugins/lightningcss.ts'
import minifyHTML from 'lume/plugins/minify_html.ts'
import nunjucks from 'lume/plugins/nunjucks.ts'
import sourceMaps from 'lume/plugins/source_maps.ts'
import terser from 'lume/plugins/terser.ts'
import feed from 'lume/plugins/feed.ts'
import cache_busting from 'lume/middlewares/cache_busting.ts'

const isServeMode = Deno.args.includes('-s') || Deno.args.includes('--serve')
const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

function formatDate(value, style = 'long') {
    const date = value instanceof Date ? value : new Date(value)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    const weekday = weekdayNames[date.getUTCDay()]
    const month = monthNames[date.getUTCMonth()]
    const day = String(date.getUTCDate()).padStart(2, '0')
    const year = date.getUTCFullYear()

    if (style === 'compact') {
        return `${month} ${day} ${year}`
    }

    return `${weekday} ${month} ${day} ${year}`
}

const site = lume({
    src: './src',
    location: new URL('https://dominick.cc'),
    server: {
        page404: './404.html',
        middlewares: [cache_busting({ regex: /\/v[\d]+\//, replacement: '/' })],
    },
})

site.use(
    feed(() => {
        // Read the live site data at feed-generation time so toggling
        // meta.blog.enabled is picked up on every build/hot reload without
        // re-evaluating _config.js.
        const blogEnabled =
            site.source.data.get('/')?.meta?.blog?.enabled === true

        return {
            output: ['/rss.xml', '/atom.xml', '/feed.json'],
            // If the blog is disabled, use a query that matches nothing so the
            // feed still builds but is empty.
            query: blogEnabled ? 'type=blog-post' : 'type=disabled-blog',
            info: {
                title: 'Dominick',
                description: 'Notes, projects, and photo-heavy writeups from Dom.',
                published: new Date(),
                lang: 'en',
            },
            items: {
                title: '=title',
                description: '=description',
                published: '=date',
            },
        }
    })
)

site.use(nunjucks())
site.filter('formatDate', formatDate)

// Add CSS files
site.add(['.css'])

// Process and minify client-side scripts
site.add(['.js'])
site.use(
    terser({
        options: {
            module: false,
        },
    })
)

if (isServeMode) {
    site.use(sourceMaps())
}

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
