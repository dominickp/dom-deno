import Server from 'lume/core/server.ts'
import cache_busting from 'lume/middlewares/cache_busting.ts'
import not_found from 'lume/middlewares/not_found.ts'
import www from 'lume/middlewares/www.ts'
import serveCLI from './serveCLI.ts'

const server = new Server({
    port: 8000,
    root: `${Deno.cwd()}/_site`,
})

server.use(cache_busting({ regex: /\/v[\d]+\//, replacement: '/' }))

server.use(
    not_found({
        root: `${Deno.cwd()}/_site`,
        page404: './not-found/index.html',
        directoryIndex: false,
    })
)

server.use(
    www({
        add: false, // false to remove, true to add it.
    })
)

server.use(serveCLI())

server.start()

console.log('Listening on http://localhost:8000')
