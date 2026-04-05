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

### Editor support

This repo expects `.njk` files to open in a Nunjucks-aware language mode. The workspace recommends a Nunjucks extension in [.vscode/extensions.json](.vscode/extensions.json) and associates `*.njk` in [.vscode/settings.json](.vscode/settings.json).

### Build the site

`deno task build`

### Start the local development server

`deno task serve`

Visit `http://localhost:3000` to view the site with live reloading.

When running the local server, Lume emits JavaScript source maps for easier browser debugging. Production builds created with `deno task build` do not include source maps in `_site/`.

### Source structure

- `src/index.njk` and `src/not-found.njk` are page entrypoints.
- `src/_data/` contains structured site data such as metadata and grouped link lists.
- `src/_includes/` contains shared layout templates.
- `src/_components/` contains reusable visual/template fragments.
- `src/static/` contains copied client assets, including extracted browser scripts under `src/static/scripts/`.

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions on every push to main.

The published site includes a top-level `404.html` for GitHub Pages-compatible not found handling. Configure the `dominick.cc` custom domain in the repository's GitHub Pages settings.

`_site/` is generated build output. Treat it as disposable and make source changes under `src/`.
