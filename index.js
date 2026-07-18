import { partials } from './lib/partials.js'

/**
 * Hamlet plugin template.
 *
 * Export a factory function that receives the options from
 * hamlet.config.js and returns:
 *
 *   - namespace: A unique plugin namespace. Hamlet uses it to
 *     prefix all exported partials and helpers automatically,
 *     so you only need to define short names here.
 *
 *   - partials: An object of Handlebars partials. Use short names
 *     without the namespace prefix (e.g. "card", not "Sample.card").
 *     Hamlet registers them as "<namespace>.<name>" automatically.
 *     Usage in templates: {{> Sample.card}}
 *
 *   - helpers: An object of Handlebars helpers. Use short camelCase
 *     names without the namespace prefix (e.g. "format", not "SampleFormat").
 *     Hamlet registers them as "<namespace><Name>" automatically.
 *     Usage in templates: {{SampleFormat value}}
 *
 * @return {{namespace: string, partials: object, helpers: object}}
 */
export default function hamletPlugin() {
  return {
    namespace: 'Sample',
    partials,
    helpers: {},
  }
}
