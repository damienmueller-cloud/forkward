// Post-build: bake per-route <head> SEO tags + JSON-LD into static HTML for GitHub Pages.
import fs from 'node:fs'
const seo = JSON.parse(fs.readFileSync('src/data/seo.json', 'utf8'))
const faq = JSON.parse(fs.readFileSync('src/data/faq.json', 'utf8'))
const base = fs.readFileSync('dist/index.html', 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const site = seo.site
const org = { '@type': 'Organization', '@id': `${site}/#org`, name: 'Forkward', url: `${site}/`, logo: `${site}/logo.png` }
const website = { '@type': 'WebSite', '@id': `${site}/#website`, name: 'Forkward', url: `${site}/`, inLanguage: 'en-AU', publisher: { '@id': `${site}/#org` } }
const app = { '@type': 'WebApplication', '@id': `${site}/#app`, name: 'Forkward', url: `${site}/`, applicationCategory: 'HealthApplication', applicationSubCategory: 'Food & recipes', operatingSystem: 'Any (web browser)', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' }, description: seo.routes['/'].description, publisher: { '@id': `${site}/#org` } }
const faqLd = { '@type': 'FAQPage', '@id': `${site}/#faq`, mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
for (const [path, m] of Object.entries(seo.routes)) {
  const url = path === '/' ? `${site}/` : `${site}${path}/`
  const img = `${site}/${m.image}`
  const graph = [website, org, app, ...(path === '/' ? [faqLd] : [])]
  const head = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Forkward" />`,
    `<meta property="og:locale" content="en_AU" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
  let html = base.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta\s+name="description"[\s\S]*?\/>/, '')
  html = html.replace('</head>', `    ${head}\n  </head>`)
  const out = path === '/' ? 'dist/index.html' : `dist${path}/index.html`
  fs.mkdirSync(out.replace(/\/index\.html$/, ''), { recursive: true })
  fs.writeFileSync(out, html)
  if (path === '/') fs.writeFileSync('dist/404.html', html)
}
console.log('SEO pages written:', Object.keys(seo.routes).join(' '))
