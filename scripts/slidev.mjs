import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const [sub, name, ...rest] = process.argv.slice(2)
if (!sub || !name) {
  console.error('usage: node scripts/slidev.mjs <dev|build|export> <name> [...args]')
  process.exit(1)
}

const file = name.includes('/') || name.endsWith('.md')
  ? name
  : join('slides', `${name}.md`)

if (!existsSync(file)) {
  console.error(`not found: ${file}`)
  process.exit(1)
}

const args = [sub, file, ...rest]
if (sub === 'dev') args.push('--open')

spawn('slidev', args, { stdio: 'inherit' }).on('exit', (code) => process.exit(code ?? 0))
