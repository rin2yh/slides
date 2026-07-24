import { readFileSync, readdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

// Generate the landing page (index.html) that lists every built slide deck.
//
// usage: node scripts/gen-index.mjs <out-root>
//   <out-root>  directory that already holds one subdir per built deck
//               (defaults to "dist")
//
// Titles / descriptions are pulled from each slide's YAML frontmatter so the
// list shows human-readable names instead of raw filenames.

const OUT_ROOT = process.argv[2] || 'dist'
const SLIDES_DIR = 'slides'

// Minimal frontmatter reader: grabs the block between the first pair of `---`
// lines and extracts a handful of top-level scalar keys. Enough for our needs;
// not a general YAML parser.
function readFrontmatter(file) {
  const text = readFileSync(file, 'utf8')
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return {}
  const out = {}
  let currentKey = null
  for (const raw of m[1].split('\n')) {
    // Block scalar continuation (e.g. `info: |` followed by indented lines).
    if (currentKey && /^\s+\S/.test(raw)) {
      out[currentKey] = (out[currentKey] ? out[currentKey] + ' ' : '') + raw.trim()
      continue
    }
    currentKey = null
    const km = raw.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!km) continue
    const [, key, value] = km
    const v = value.trim()
    if (v === '' || v === '|' || v === '>') {
      // Block scalar or empty; collect following indented lines.
      currentKey = key
      out[key] = ''
    } else {
      out[key] = stripQuotes(v)
    }
  }
  return out
}

function stripQuotes(s) {
  return s.replace(/^['"]|['"]$/g, '').trim()
}

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const decks = readdirSync(SLIDES_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const name = f.replace(/\.md$/, '')
    const fm = readFrontmatter(join(SLIDES_DIR, f))
    return {
      name,
      title: (fm.title || name).replace(/<br\s*\/?>/gi, ' '),
      desc: fm.info || fm.event || '',
    }
  })
  // Only list decks that were actually built.
  .filter((d) => existsSync(join(OUT_ROOT, d.name)))
  .sort((a, b) => a.title.localeCompare(b.title, 'ja'))

const cards = decks
  .map(
    (d) => `      <li>
        <a class="card" href="./${esc(d.name)}/">
          <span class="card-title">${esc(d.title)}</span>${
            d.desc ? `\n          <span class="card-desc">${esc(d.desc)}</span>` : ''
          }
          <span class="card-go" aria-hidden="true">スライドを開く →</span>
        </a>
      </li>`,
  )
  .join('\n')

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Slides</title>
<link rel="icon" href="./favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #fbfaf7;
    --text: #1b1f23;
    --text-2: #5a6066;
    --muted: #7d838a;
    --accent: #0a7c98;
    --accent-hover: #0a6076;
    --panel: #fff;
    --border: #e0dccf;
    --shadow: 0 1px 2px rgba(27, 31, 35, .04);
    --shadow-hover: 0 6px 20px rgba(10, 124, 152, .12);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #14181b;
      --text: #eceef0;
      --text-2: #aab0b6;
      --muted: #858b91;
      --accent: #3fb6d3;
      --accent-hover: #66c9e2;
      --panel: #1c2226;
      --border: #2c343a;
      --shadow: 0 1px 2px rgba(0, 0, 0, .3);
      --shadow-hover: 0 6px 20px rgba(0, 0, 0, .4);
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Noto Sans JP', system-ui, sans-serif;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 760px; margin: 0 auto; padding: 5rem 1.25rem 6rem; }
  header { margin-bottom: 2.5rem; }
  .eyebrow {
    font-size: .8rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 .5rem;
  }
  h1 {
    font-size: 2.4rem;
    font-weight: 900;
    letter-spacing: -.01em;
    margin: 0;
  }
  .lead { color: var(--text-2); margin: .5rem 0 0; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
  .card {
    display: block;
    padding: 1.25rem 1.4rem;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 14px;
    text-decoration: none;
    color: inherit;
    box-shadow: var(--shadow);
    transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
  }
  .card:hover, .card:focus-visible {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow: var(--shadow-hover);
    outline: none;
  }
  .card-title {
    display: block;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -.01em;
  }
  .card-desc {
    display: block;
    margin-top: .35rem;
    color: var(--text-2);
    font-size: .95rem;
  }
  .card-go {
    display: inline-block;
    margin-top: .75rem;
    color: var(--accent);
    font-size: .9rem;
    font-weight: 500;
  }
  .card:hover .card-go, .card:focus-visible .card-go { color: var(--accent-hover); }
  .empty { color: var(--muted); }
  footer { margin-top: 3rem; color: var(--muted); font-size: .85rem; }
  footer a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <p class="eyebrow">Presentations</p>
      <h1>Slides</h1>
      <p class="lead">Slidev で作成したスライド集です。</p>
    </header>
${decks.length ? `    <ul>\n${cards}\n    </ul>` : '    <p class="empty">まだスライドがありません。</p>'}
    <footer>Built with <a href="https://sli.dev/">Slidev</a></footer>
  </div>
</body>
</html>
`

writeFileSync(join(OUT_ROOT, 'index.html'), html)
console.log(`generated ${join(OUT_ROOT, 'index.html')} (${decks.length} deck${decks.length === 1 ? '' : 's'})`)

// Copy favicon / PWA assets next to the landing page so the icons referenced in
// its <head> resolve at the site root (/<repo>/). Each deck already bundles its
// own copy via Slidev's public dir; this covers the generated index page.
const ICON_SRC = join(SLIDES_DIR, 'public')
const ICON_FILES = [
  'favicon.ico',
  'favicon-32x32.png',
  'favicon-16x16.png',
  'apple-touch-icon.png',
]
let copied = 0
for (const f of ICON_FILES) {
  const src = join(ICON_SRC, f)
  if (existsSync(src)) {
    copyFileSync(src, join(OUT_ROOT, f))
    copied++
  }
}
console.log(`copied ${copied} favicon asset${copied === 1 ? '' : 's'} to ${OUT_ROOT}`)
