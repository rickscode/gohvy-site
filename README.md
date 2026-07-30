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

## Writing for search (keyword playbook)

Goal: page 1 for "heavy duty training", "heavy duty training app" and
the Mike Mentzer query cluster. Every new Insights article must follow
these rules.

Primary phrases (each article targets exactly ONE):
- heavy duty training / heavy duty training app
- mike mentzer workout / mike mentzer routine / mentzer heavy duty program
- high-intensity training / HIT workout
Secondary phrases (sprinkle where natural):
one set to failure, training to failure, HIT workout app, workout
tracker, 3 day workout split, progressive overload, Mentzer HIT,
recovery, deload.

Per-article rules:
1. The primary phrase appears in the title, the description front
   matter, and the first paragraph (first 100 words).
2. 900+ words. Thin posts (under 500) do not rank in this niche.
3. Link to at least 2 other pages on the site (other articles or /).
   Internal links use root-relative paths: `[text](/insights/slug)`.
4. Mentioning Mike Mentzer by name is encouraged (editorial reference
   to a public figure; competitors all do it).
5. H2s (`##`) carry question-style or keyword phrasing where it reads
   naturally ("What is...", "Why...").
6. Keep the GOHVY voice: plain, confident, no hype. The keyword rules
   bend to readability, never the other way round.

Current article -> primary keyword map:
- what-is-heavy-duty-training: heavy duty training
- mike-mentzer-heavy-duty-workout: mike mentzer workout
- heavy-duty-training-app: heavy duty training app
- three-day-split: 3 day workout split
- one-set-to-failure: one set to failure
- meet-milo: (brand)

After publishing: sitemap.xml regenerates on build; resubmit in Google
Search Console only after large batches, single posts get crawled from
the sitemap automatically.
