// GOHVY site build: copies static pages into _site, renders the
// Insights markdown articles (insights-src/*.md, edited via the Decap
// dashboard at /admin) into brand-styled pages, and generates the
// Insights listing plus sitemap.xml.
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const SITE = 'https://gohvy.com';
const OUT = '_site';
const SRC = 'insights-src';

// ---------- helpers ----------
function parseFrontMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] =
      line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: match[2] };
}

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// Reuse the brand styling from terms.html so there is one source of truth.
const termsHtml = fs.readFileSync('terms.html', 'utf8');
const styleBlock = termsHtml.match(/<style>[\s\S]*?<\/style>/)[0];

const fontLinks = `  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />`;

const favicon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23000000'/><text y='.9em' font-size='85' font-family='Arial Black,sans-serif' font-weight='900' fill='%23f5a623' x='10'>G</text></svg>" />`;

const nav = `  <nav>
    <a class="nav-logo" href="/">GO<span>HVY</span></a>
    <div style="display:flex;align-items:center;gap:1.6rem;">
      <a href="/insights/" style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--text);text-decoration:none;">Insights</a>
      <a href="https://app.gohvy.com" style="display:inline-block;padding:0.55rem 1.4rem;background:var(--amber);color:var(--black);font-family:'Inter',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">Start Training</a>
    </div>
  </nav>`;

const footer = `  <footer>
    <div class="footer-logo">GOHVY</div>
    <p class="footer-copy">© 2026 GOHVY. All rights reserved. gohvy.com · <a href="/" style="color: var(--muted);">Home</a> · <a href="/insights/" style="color: var(--muted);">Insights</a> · <a href="/privacy" style="color: var(--muted);">Privacy</a> · <a href="/terms" style="color: var(--muted);">Terms</a></p>
  </footer>`;

const ctaBox = `    <div class="summary" style="margin-top:3rem;">
      <strong>Put it into practice.</strong> GOHVY runs this protocol for you —
      one set to failure, automatic progression, enforced recovery. Three
      sessions a week, free to train.
      <a href="https://app.gohvy.com">Start training at app.gohvy.com</a>.
    </div>`;

function page({ title, description, canonical, eyebrow, h1, dateLine, bodyHtml, jsonLd, ogType = 'article' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${favicon}
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="GOHVY" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE}/images/og-card.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${SITE}/images/og-card.png" />
${fontLinks}
${jsonLd ? `  <script type="application/ld+json">${jsonLd}</script>` : ''}
  ${styleBlock}
</head>
<body>

${nav}

  <main>
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${esc(h1)}</h1>
    ${dateLine ? `<p class="updated">${esc(dateLine)}</p>` : ''}
${bodyHtml}
  </main>

${footer}
</body>
</html>
`;
}

// ---------- build ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'insights'), { recursive: true });

// Static passthrough (files + admin/, images/ if present).
const statics = ['index.html', 'privacy.html', 'terms.html', 'robots.txt',
  'google8bd4edf88f4c53d3.html'];
for (const file of statics) {
  if (fs.existsSync(file)) fs.copyFileSync(file, path.join(OUT, file));
}
for (const dir of ['admin', 'images']) {
  if (fs.existsSync(dir)) fs.cpSync(dir, path.join(OUT, dir), { recursive: true });
}

// Articles.
const articles = [];
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).sort()) {
  const { data, body } = parseFrontMatter(fs.readFileSync(path.join(SRC, file), 'utf8'));
  const slug = path.basename(file, '.md');
  const url = `${SITE}/insights/${slug}`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    datePublished: data.date,
    dateModified: data.updated || data.date,
    image: `${SITE}/images/og-card.png`,
    author: { '@type': 'Organization', name: 'GOHVY' },
    publisher: { '@type': 'Organization', name: 'GOHVY', url: SITE },
    mainEntityOfPage: url,
  });
  const html = page({
    title: `${data.title} — GOHVY Insights`,
    description: data.description,
    canonical: url,
    eyebrow: 'Insights',
    h1: data.title,
    dateLine: formatDate(data.date).toUpperCase(),
    bodyHtml: marked.parse(body) + '\n' + ctaBox,
    jsonLd,
  });
  fs.writeFileSync(path.join(OUT, 'insights', `${slug}.html`), html);
  articles.push({ slug, url, ...data });
}
articles.sort((a, b) => (a.date < b.date ? 1 : -1));

// Listing.
const cards = articles.map((a) => `    <a class="summary" style="display:block;text-decoration:none;color:var(--text);" href="/insights/${a.slug}">
      <p class="eyebrow" style="margin-bottom:0.4rem;">${esc(formatDate(a.date))}</p>
      <strong style="font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.05em;font-weight:400;">${esc(a.title)}</strong>
      <p style="margin:0.5rem 0 0;">${esc(a.description)}</p>
    </a>`).join('\n');
fs.writeFileSync(path.join(OUT, 'insights', 'index.html'), page({
  title: 'GOHVY Insights — High-Intensity Training, Explained',
  description: 'No-nonsense articles on high-intensity training: one set to failure, recovery, and progression that actually builds mass.',
  canonical: `${SITE}/insights/`,
  eyebrow: 'The Knowledge Base',
  h1: 'Insights',
  dateLine: null,
  bodyHtml: cards,
  ogType: 'website',
  jsonLd: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'GOHVY Insights',
    url: `${SITE}/insights/`,
    isPartOf: { '@type': 'WebSite', name: 'GOHVY', url: SITE },
    hasPart: articles.map((a) => ({
      '@type': 'Article', headline: a.title, url: a.url,
    })),
  }),
}));

// Sitemap.
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, lastmod: today },
  { loc: `${SITE}/insights/`, lastmod: today },
  ...articles.map((a) => ({ loc: a.url, lastmod: (a.updated || a.date).slice(0, 10) })),
  { loc: `${SITE}/privacy`, lastmod: today },
  { loc: `${SITE}/terms`, lastmod: today },
];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') + '\n</urlset>\n');

console.log(`Built ${articles.length} articles -> ${OUT}/`);
