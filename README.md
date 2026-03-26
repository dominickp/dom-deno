# dominick.cc 

Dom's personal site, live at [dominick.cc](https://dominick.cc)

This website is a static site generated with Lume on Deno. The animations were made with Anime.js. Changes to the GitHub repo trigger GitHub Actions to automatically deploy to GitHub Pages.

## Tech Stack

- **Lume** v3.2.1 - Static site generator
- **Deno** v2.x - Runtime
- **Nunjucks** - Templating engine
- **Anime.js** - Animation library
- **LightningCSS** - CSS processing

## Prerequisites

Install [Deno](https://deno.land/#installation) if you haven't already.

## Development

### Build the site

`deno task build`

### Start the local development server

`deno task serve`

Visit `http://localhost:3000` to view the site with live reloading.

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions on every push to main.

The published site includes a top-level `404.html` for GitHub Pages-compatible not found handling. Configure the `dominick.cc` custom domain in the repository's GitHub Pages settings.
