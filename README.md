# hamlet-plugin-template

Base template for creating Hamlet plugins.

## Usage

1. Rename the package in `package.json` (e.g. `@scope/hamlet-feature` or `hamlet-plugin-feature`).
2. Add your Handlebars partials as `.hbs` (or `.xml`, `.handlebars`) files inside `src/`.
3. Implement helpers and set the namespace in `index.js`.
4. Run `npm run build:partials` to generate `lib/partials.js` from your source files.
5. Run the tests.
6. Publish to npm.

## End-user installation

```bash
npm install hamlet-plugin-template
```

```js
// hamlet.config.js
import Sample from 'hamlet-plugin-template'

export default {
  plugins: [
    Sample(),
    // or with options:
    Sample({ myOption: true }),
  ],
}
```

Plugins are imported and invoked directly from `hamlet.config.js`, similar to Vite or Rollup plugins. Hamlet never resolves plugins by package name — it only consumes the object returned by the plugin factory.

## Project structure

```
├── src/
│   ├── card.hbs        ← your partial source files
│   └── hello.hbs
├── lib/
│   └── partials.js     ← auto-generated, do not edit
├── scripts/
│   └── build-partials.js
├── index.js
└── package.json
```

Source files in `src/` are compiled into `lib/partials.js` by `npm run build:partials`. This script runs automatically before publishing via the `prepublishOnly` hook.

## Plugin contract

A plugin must export a default factory function that receives the user's options and returns an object with the following shape:

```js
import { partials } from './lib/partials.js'

export default function hamletPlugin(options = {}) {
  return {
    namespace: 'Sample',
    partials,
    helpers: {},
  }
}
```

### namespace

Every plugin must define a unique `namespace`.

- It must start with a letter.
- It may contain only letters and digits.
- It is used to prefix all exported partials and helpers automatically — you only use short names inside the plugin.
- The namespace `hamlet` is reserved and cannot be used.

### partials

An object of Handlebars partials keyed by **short names** (without the namespace prefix). Hamlet registers them as `<namespace>.<name>` automatically.

Add `.hbs`, `.xml`, or `.handlebars` files to `src/` and run `npm run build:partials` to populate `lib/partials.js`. The file name becomes the partial key.

Example — `src/card.hbs`:

```hbs
<div{{#if className}} class="{{className}}"{{/if}}>
  {{#if title}}<h2>{{title}}</h2>{{/if}}
  {{#if description}}<p>{{description}}</p>{{/if}}
</div>
```

This becomes `partials.card`, registered by Hamlet as `Sample.card`:

```hbs
{{> Sample.card title="Hello"}}
```

### helpers

An object of Handlebars helpers keyed by **short camelCase names** (without the namespace prefix). Hamlet registers them as `<namespace><Name>` automatically.

Example:

```js
export default function hamletPlugin(options = {}) {
  return {
    namespace: 'Sample',
    helpers: {
      shout: value => value.toUpperCase(),
    },
  }
}
```

This registers the helper as `SampleShout`, usable in templates as:

```hbs
{{SampleShout "hello"}}
```

Helper names cannot contain dots because Handlebars interprets them as property paths.

## Name collisions

Hamlet follows a **first registered wins** policy.

If a plugin attempts to register a partial or helper whose name already exists (whether built-in to Hamlet, from another plugin, or from the user's project), the duplicate is silently skipped and a warning is printed.

## Using Hamlet features inside plugin partials

Plugin partials can freely use Hamlet's built-in helpers and partials:

```hbs
{{concat "Hello, " name}}

{{#switch value}}
  {{#case "post"}}...{{/case}}
  {{#default}}...{{/default}}
{{/switch}}

{{> hamlet.snippet}}
```

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run build:partials` | Generates `lib/partials.js` from files in `src/` |
| `npm test` | Runs the test suite |
| `npm run lint` | Lints the project |
| `npm run lint:fix` | Lints and auto-fixes |

`build:partials` also runs automatically via `prepublishOnly` before every `npm publish`.

## Tests

```bash
npm install
npm test
```

The test suite verifies that:

- The plugin exports a valid factory function.
- The returned object follows Hamlet's plugin contract.
- A valid, non-reserved namespace is exported.
- Partial and helper names are short (no namespace prefix) and follow Hamlet's naming rules.
- No computed full name collides with Hamlet's reserved partials or helpers.
- Partials are strings and compile without Handlebars syntax errors.
- Helpers are functions (not nested objects).
- No name is on Hamlet's blocked list (`__proto__`, `constructor`, `prototype`).

Feel free to extend the tests with plugin-specific behavior or option validation.

## Linting

This template uses the same ESLint configuration as Hamlet itself (`@antfu/eslint-config`).

```bash
npm run lint
npm run lint:fix
```
