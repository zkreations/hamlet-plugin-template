# hamlet-plugin-template

Base template for creating Hamlet plugins.

## Usage

1. Rename the package in `package.json` (e.g. `@scope/hamlet-feature` or `hamlet-plugin-feature`).
2. Implement your plugin in `index.js`.
3. Run the tests.
4. Publish to npm.

## End-user installation

```bash
npm install hamlet-plugin-template
```

```js
// hamlet.config.js
import myPlugin from 'hamlet-plugin-template'

export default {
  plugins: [
    myPlugin(),
    // or with options:
    myPlugin({ myOption: true }),
  ],
}
```

Plugins are imported and invoked directly from `hamlet.config.js`, similar to Vite or Rollup plugins. Hamlet never resolves plugins by package name—it only consumes the object returned by the plugin factory.

## Plugin contract

A plugin must export a default factory function that receives the user's options and returns an object with the following shape:

```js
export default function hamletPlugin(options = {}) {
  return {
    namespace: 'MyPlugin',
    partials: {},
    helpers: {},
  }
}
```

### namespace

Every plugin must define a unique `namespace`.

* It must start with a letter.
* It may contain only letters and digits.
* It is used to namespace all exported partials and helpers, preventing collisions with other plugins and the user's own project.

### partials

An object containing Handlebars partials.

Every partial name must be prefixed with `<namespace>.`.

Example:

```js
export default function hamletPlugin(options = {}) {
  return {
    namespace: 'MyPlugin',
    partials: {
      'MyPlugin.card': '<div>...</div>',
    }
  }
}
```

### helpers

An object containing Handlebars helpers.

Every helper name must be prefixed with the namespace followed by an uppercase letter.

Example:

```js
export default function hamletPlugin(options = {}) {
  return {
    namespace: 'MyPlugin',
    helpers: {
      MyPluginFormat: value => value.toUpperCase(),
    }
  }
}
```

Helper names cannot contain dots because Handlebars interprets them as property paths rather than helper names.

## Name collisions

Hamlet follows a **first registered wins** policy.

If a plugin attempts to register a partial or helper whose name already exists (whether provided by Hamlet, another plugin, or the user's project), the duplicate is ignored and a warning is printed.

## Using Hamlet features inside plugin partials

Plugin partials can freely use Hamlet's built-in helpers and partials.

For example:

```hbs
{{concat "Hello, " name}}

{{#switch value}}
  ...
{{/switch}}

{{> hamlet.snippet}}
```

## Tests

Before publishing:

```bash
npm install
npm test
```

The test suite verifies that:

* The plugin exports a valid factory function.
* The returned object follows Hamlet's plugin contract.
* A valid namespace is exported.
* Partial and helper names follow Hamlet's naming rules.
* Exported names use the plugin namespace.
* No exported name collides with Hamlet's reserved names.
* Partials compile successfully.
* Helpers are valid functions.

Feel free to extend the tests with plugin-specific behavior or option validation.

## Linting

This template uses the same ESLint configuration as Hamlet itself.

```bash
npm run lint
npm run lint:fix
```
