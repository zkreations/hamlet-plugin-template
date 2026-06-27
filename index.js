/**
 * Hamlet plugin template.
 *
 * Export a factory function that receives the options from
 * hamlet.config.js and returns:
 *
 *   - namespace: A unique plugin namespace. All exported partials and
 *     helpers must use this namespace to avoid collisions.
 *
 *   - partials: An object of Handlebars partials. Every partial name
 *     must be prefixed with "<namespace>." (e.g. "myPlugin.card").
 *
 *   - helpers: An object of Handlebars helpers. Every helper name must
 *     be prefixed with the namespace (e.g. "myPluginFormat"). Dots are
 *     not allowed because Handlebars interprets them as property paths.
 *
 * The example below exports one partial and one helper. Replace them
 * with your own implementation, or start with empty { partials, helpers }
 * objects while keeping the namespace consistent.
 *
 * @param {object} options - Options from hamlet.config.js.
 * @return {{namespace: string, partials: object, helpers: object}}
 */
export default function hamletPlugin(options = {}) {
  const { greeting = 'Hello World' } = options

  return {
    namespace: 'MyPlugin',

    partials: {
      // Usage in a .hbs file: {{> myPlugin.hello}}
      'myPlugin.hello': `MyPlugin says: {{myPluginShout greeting}}`,
    },
    helpers: {
      // Usage in a .hbs file: {{myPluginShout "Hello World"}}
      myPluginShout: text => `${text ?? greeting}!`.toUpperCase(),
    },
  }
}
