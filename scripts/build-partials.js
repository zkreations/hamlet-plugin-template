import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { globSync } from 'glob'

const srcDir = path.join(process.cwd(), 'src')
const files = globSync(`${srcDir}/**/*.@(hbs|handlebars|xml)`)

const partials = {}

files.forEach((file) => {
  const ext = path.extname(file)
  const name = path.basename(file, ext)
  partials[name] = `${fs.readFileSync(file, 'utf8').trim()}\n`
})

const content = `// This file is auto-generated. Do not edit it manually.\nexport const partials = ${JSON.stringify(partials, null, 2)}\n`
fs.mkdirSync('lib', { recursive: true })
fs.writeFileSync('lib/partials.js', content)
console.warn('lib/partials.js generated successfully')
