import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const name = process.argv[2]
if (!name) {
  console.error('usage: npm run new -- <name>')
  process.exit(1)
}

const src = 'slides/template.md'
const dest = join('slides', name.endsWith('.md') ? name : `${name}.md`)

if (existsSync(dest)) {
  console.error(`already exists: ${dest}`)
  process.exit(1)
}

copyFileSync(src, dest)
console.log(`created: ${dest}`)
console.log(`next: npm run dev ${dest}`)
