# dominick.cc

Dom's personal site, live at [dominick.cc](https://dominick.cc)

This website is a static site generated with Lume on Deno. The animations were made with Anime.js. Changes to the GitHub repo trigger GitHub Actions to automatically deploy to Deno Deploy, where it is hosted at the edge.

## Tech Stack

- **Lume** v3.2.1 - Static site generator
- **Deno** v2.x - Runtime
- **Nunjucks** - Templating engine
- **Anime.js** - Animation library
- **LightningCSS** - CSS processing
- Custom middleware for CLI-friendly output (try `curl dominick.cc`)

## Prerequisites

Install [Deno](https://deno.land/#installation) if you haven't already.

## Development

### Build the site

`deno task build`

### Start the local development server

`deno task lume --serve`

Visit `http://localhost:3000` to view the site with live reloading.

### Build and serve production-like

`deno task build-serve`

This builds the site and starts the production server with all middlewares (cache busting, 404 handling, CLI support).

## Deployment

The site is automatically deployed to Deno Deploy via GitHub Actions on every push to main.
