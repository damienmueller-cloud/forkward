// Post-build: static index.html per guide route with meta + Article JSON-LD (GitHub Pages deep links).
import fs from 'node:fs'
const { guides, updated } = JSON.parse(fs.readFileSync('src/data/guides.json', 'utf8'))
const site = 'https://damienmueller-cloud.github.io/forkward'
const base = fs.readFileSync('dist/index.html', 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const strip = (h) => h
  .replace(/<title>[\s\S]*?<\/title>/g, '')
  .replace(/<meta\s+(name|property)="(description|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '')
  .replace(/<link rel="canonical"[^>]*>/g, '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
const org = { '@type': 'Organization', '@id': `${site}/#org`, name: 'Forkward', url: `${site}/`, logo: `${site}/logo.png` }
function page(path, title, description, ld) {
  const url = `${site}${path}`
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="Forkward" />`,
    `<meta property="og:locale" content="en_AU" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${site}/logo.png" />`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
  const out = `dist${path}/index.html`
  fs.mkdirSync(`dist${path}`, { recursive: true })
  fs.writeFileSync(out, strip(base).replace('</head>', `    ${head}\n  </head>`))
}
page('/guides', 'Healthy eating guides | Forkward', 'Practical, plain-English guides for cooking and eating well in Australia. Not medical advice.', {
  '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Forkward guides', url: `${site}/guides`, inLanguage: 'en-AU',
  hasPart: guides.map((g) => ({ '@type': 'Article', headline: g.title, url: `${site}/guides/${g.slug}` })),
})
for (const g of guides) {
  page(`/guides/${g.slug}`, `${g.title} | Forkward`, g.description, {
    '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description,
    url: `${site}/guides/${g.slug}`, mainEntityOfPage: `${site}/guides/${g.slug}`, inLanguage: 'en-AU',
    datePublished: updated, dateModified: updated, image: `${site}/logo.png`, author: org, publisher: org,
  })
}
console.log('Guide pages written:', guides.length + 1)
