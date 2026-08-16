import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { globSync } from 'glob'

const srcDir = path.join(process.cwd(), 'src')
const files = globSync(`${srcDir}/**/*.@(hbs|handlebars|xml)`)

const { default: pluginFactory } = await import(
  pathToFileURL(path.join(process.cwd(), 'index.js')).href,
)

const { namespace } = pluginFactory({})

if (!namespace || typeof namespace !== 'string') {
  console.error('Could not read a valid namespace from index.js')
  process.exit(1)
}

const partials = {}

files.forEach((file) => {
  const ext = path.extname(file)
  const name = path.basename(file, ext)
  const raw = fs.readFileSync(file, 'utf8').trim()

  const content = raw.replaceAll('{{_self.', `{{${namespace}.`)

  partials[name] = `${content}\n`
})

const output = `// This file is auto-generated. Do not edit it manually.\nexport const partials = ${JSON.stringify(partials, null, 2)}\n`

fs.mkdirSync('lib', { recursive: true })
fs.writeFileSync('lib/partials.js', output)
console.warn(`lib/partials.js generated successfully (namespace: "${namespace}")`)
