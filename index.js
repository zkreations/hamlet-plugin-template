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
 *   - context: An optional plain object with data to expose to all
 *     Handlebars templates. Hamlet merges it under the plugin namespace,
 *     so there are no collisions with the global context or other plugins.
 *     Usage in templates: {{Sample.myValue}}
 *
 *     Inside plugin partials, use the alias {{_self.key}} instead of
 *     hardcoding the namespace. build-partials.js replaces _self with
 *     the real namespace at build time, so renaming the namespace only
 *     requires a change here — not in every partial file.
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
 * @return {{namespace: string, partials: object, helpers: object, context: object}}
 */
export default function hamletPlugin() {
  return {
    namespace: 'Sample',
    context: {},
    partials,
    helpers: {},
  }
}
