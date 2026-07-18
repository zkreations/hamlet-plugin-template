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
 *     without the namespace prefix (e.g. "card", not "MyPlugin.card").
 *     Hamlet registers them as "<namespace>.<name>" automatically.
 *     Usage in templates: {{> MyPlugin.card}}
 *
 *   - helpers: An object of Handlebars helpers. Use short camelCase
 *     names without the namespace prefix (e.g. "format", not "MyPluginFormat").
 *     Hamlet registers them as "<namespace><Name>" automatically.
 *     Usage in templates: {{MyPluginFormat value}}
 *
 * @param {object} options - Options from hamlet.config.js.
 * @return {{namespace: string, partials: object, helpers: object}}
 */
export default function hamletPlugin(options = {}) {
  const { greeting = 'Hello World' } = options

  return {
    namespace: 'MyPlugin',

    partials: {
      // Registered as "MyPlugin.hello" {{> MyPlugin.hello}}
      hello: `MyPlugin says: {{MyPluginShout greeting}}`,
    },
    helpers: {
      // Registered as "MyPluginShout" {{MyPluginShout "Hello World"}}
      shout: text => `${text ?? greeting}!`.toUpperCase(),
    },
  }
}
