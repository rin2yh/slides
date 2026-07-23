import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-chromium'

// Generate the OG image (og-image.png) for the landing page (index.html).
//
// usage: node scripts/gen-og.mjs <out-root>
//   <out-root>  directory the landing page is written to (defaults to "dist")
//
// The individual decks get their card image from Slidev's `ogImage: auto`
// (a Playwright screenshot of the first slide). The landing page has no slide
// to screenshot, so we render a small branded card here — same colours and
// fonts as index.html — at the 1200x630 the OGP/Twitter card spec expects.

const OUT_ROOT = process.argv[2] || 'dist'
const WIDTH = 1200
const HEIGHT = 630

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 96px 100px;
    background: #fbfaf7;
    color: #1b1f23;
    font-family: 'Noto Sans JP', system-ui, sans-serif;
    border-left: 16px solid #0a7c98;
  }
  .eyebrow {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #0a7c98;
    margin-bottom: 20px;
  }
  h1 {
    font-size: 132px;
    font-weight: 900;
    letter-spacing: -.02em;
    line-height: 1;
  }
  .lead {
    font-size: 40px;
    font-weight: 500;
    color: #5a6066;
    margin-top: 36px;
  }
  .footer {
    margin-top: auto;
    font-size: 24px;
    color: #7d838a;
  }
</style>
</head>
<body>
  <div class="eyebrow">Presentations</div>
  <h1>Slides</h1>
  <p class="lead">Slidev で作成したスライド集です。</p>
  <div class="footer">Built with Slidev</div>
</body>
</html>`

mkdirSync(OUT_ROOT, { recursive: true })

// Honour an explicit executable path when set (e.g. a sandbox that ships a
// pre-installed Chromium of a different version than the pinned package).
const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || undefined
const browser = await chromium.launch({ executablePath })
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  await page.setContent(html, { waitUntil: 'networkidle' })
  // Wait for the web fonts so Japanese glyphs aren't rendered as tofu.
  await page.evaluate(() => document.fonts.ready)
  const out = join(OUT_ROOT, 'og-image.png')
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } })
  console.log(`generated ${out} (${WIDTH}x${HEIGHT})`)
} finally {
  await browser.close()
}
