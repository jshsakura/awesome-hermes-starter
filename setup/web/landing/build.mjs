// Builds the Pages landing page.
//
// The compose block is read out of docs/deploy.md rather than kept here, so
// the site and the install guide cannot drift apart — there is one copy of the
// YAML in the repo and this pulls it at build time.

import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../../..')
const out = resolve(here, '../demo-dist')

const guide = readFileSync(resolve(repo, 'docs/deploy.md'), 'utf8')
const match = guide.match(/```yaml\n([\s\S]*?)```/)
if (!match) throw new Error('docs/deploy.md 에서 compose 블록을 찾지 못했다')
const yaml = match[1].trimEnd()

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Mark the three things a reader has to edit, and dim the comments so the
// structure is visible at a glance in sixty lines of YAML.
const highlighted = escape(yaml)
  .split('\n')
  .map((line) => {
    const hash = line.indexOf('#')
    if (hash !== -1 && !line.slice(0, hash).includes('"')) {
      return `${mark(line.slice(0, hash))}<span class="cmt">${line.slice(hash)}</span>`
    }
    return mark(line)
  })
  .join('\n')

function mark(s) {
  return s
    .replace(/\/CHANGE\/ME/g, '<span class="hl">/CHANGE/ME</span>')
    .replace(/CHANGE_ME_[A-Z]+/g, (m) => `<span class="hl">${m}</span>`)
    .replace(/(HERMES_[UG]ID=)(\d+)/g, (_, k, v) => `${k}<span class="hl">${v}</span>`)
}

mkdirSync(out, { recursive: true })
const template = readFileSync(resolve(here, 'index.template.html'), 'utf8')
writeFileSync(resolve(out, 'index.html'), template.replace('__COMPOSE__', highlighted))
copyFileSync(resolve(here, 'landing.css'), resolve(out, 'landing.css'))
copyFileSync(resolve(repo, 'docs/favicon.svg'), resolve(out, 'favicon.svg'))

console.log(`landing: ${yaml.split('\n').length}줄 compose 를 docs/deploy.md 에서 가져와 넣었다`)
