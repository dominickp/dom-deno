import lume from 'lume/mod.ts'

const site = lume({
    src: './src',
    server: {
        page404: './not-found/index.html',
    },
})

// Copy all files from the "/static/" directory
site.copy('static')

export default site
