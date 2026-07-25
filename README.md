# GOHVY Landing Site

Marketing and content site for [GOHVY](https://gohvy.com), the
high-intensity training app. The app itself lives at
[app.gohvy.com](https://app.gohvy.com) (separate repo).

## Stack

Static HTML with a small Node build step. No framework.

- `index.html`, `privacy.html`, `terms.html` - hand-written pages.
- `insights-src/*.md` - Insights articles as markdown with front
  matter (`title`, `date`, `description`).
- `build.js` - renders articles to `_site/insights/<slug>.html` using
  the shared brand styling (sourced from the `<style>` block in
  `terms.html`), generates the Insights listing page and
  `sitemap.xml`, and copies all static files into `_site/`.
- `admin/` - Decap CMS. Editors sign in with GitHub at
  [gohvy.com/admin](https://gohvy.com/admin) and publish articles as
  commits to this repo.

## Develop

```
npm install
node build.js
```

Output lands in `_site/`. Open `_site/index.html` directly or serve
the folder with any static server.

## Deploy

Netlify builds on every push to `main`: `npm run build` publishes
`_site`. There is no manual deploy step - merge to `main` and it is
live within a minute or two.

## Writing an article

Either use the CMS at gohvy.com/admin, or add a markdown file to
`insights-src/` with the front matter fields above and push. The
build adds the article page, the listing entry, Open Graph tags,
Article JSON-LD, and a sitemap entry automatically.
