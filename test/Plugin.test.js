import assert from 'node:assert/strict'
import Handlebars from 'handlebars'
import { it } from 'vitest'
import plugin from '../index.js'

// Reserved names exposed natively by hamlet.
const RESERVED_HELPERS = new Set([
  'asset',
  'currentYear',
  'helperMissing',
  'blockHelperMissing',
  'switch',
  'case',
  'default',
  'eq',
  'ne',
  'lt',
  'gt',
  'and',
  'or',
  'not',
  'concat',
  'includes',
  'capitalize',
  'first',
  'last',
])

const isHamletReserved = name => name.startsWith('hamlet.')

const PARTIAL_NAME_PATTERN = /^[A-Z][A-Z0-9]*(?:[._-][A-Z][A-Z0-9]*)*$/i
const HELPER_NAME_PATTERN = /^[A-Z][A-Z0-9]*(?:[-_][A-Z][A-Z0-9]*)*$/i
const BLOCKED_NAMES = new Set(['__proto__', 'constructor', 'prototype'])

it('plugin exports a function (factory)', () => {
  assert.equal(typeof plugin, 'function', 'default export must be a function that returns { partials, helpers }')
})

it('plugin() returns an object with partials/helpers', () => {
  const result = plugin({})
  assert.equal(typeof result, 'object')
  assert.ok(result.partials === undefined || typeof result.partials === 'object')
  assert.ok(result.helpers === undefined || typeof result.helpers === 'object')
})

it('partials do not collide with reserved hamlet names', () => {
  const { partials = {} } = plugin({})

  for (const name of Object.keys(partials)) {
    assert.ok(
      !isHamletReserved(name),
      `Partial "${name}" collides with a built-in hamlet partial`,
    )
  }
})

it('helpers do not collide with reserved hamlet helpers', () => {
  const { helpers = {} } = plugin({})

  for (const name of Object.keys(helpers)) {
    assert.ok(
      !RESERVED_HELPERS.has(name),
      `Helper "${name}" collides with a built-in hamlet helper ("${name}" is reserved)`,
    )
  }
})

it('partial names match hamlet\'s naming policy (dots allowed)', () => {
  const { partials = {} } = plugin({})

  for (const name of Object.keys(partials)) {
    assert.ok(
      PARTIAL_NAME_PATTERN.test(name),
      `Partial "${name}" does not match hamlet's allowed name pattern `
      + '(letter start, letters/digits, optional ".", "-" or "_" separators)',
    )
  }
})

it('helper names match hamlet\'s naming policy (no dots allowed)', () => {
  const { helpers = {} } = plugin({})

  for (const name of Object.keys(helpers)) {
    assert.ok(
      HELPER_NAME_PATTERN.test(name),
      `Helper "${name}" does not match hamlet's allowed name pattern, or contains a dot. `
      + 'Helpers cannot be dot-namespaced: Handlebars parses "{{a.b}}" as a property path '
      + 'on the data context, never as a helper name — a dotted helper registers without '
      + 'error but is unreachable from any template (use camelCase or dashes instead).',
    )
  }
})

it('helpers are not nested objects (a common attempt at dot-namespacing)', () => {
  const { helpers = {} } = plugin({})

  for (const [name, value] of Object.entries(helpers)) {
    assert.ok(
      typeof value === 'function',
      `Helper "${name}" is not a function (got ${typeof value}). If this is an attempt to `
      + 'namespace helpers like { myPlugin: { shout: fn } }, note that Handlebars cannot '
      + 'call nested helpers this way — "{{myPlugin.shout}}" looks up a property path, '
      + 'not a nested helper, and would fail with "Missing helper" at render time.',
    )
  }
})

it('partial and helper names are not on hamlet\'s blocked list', () => {
  const { partials = {}, helpers = {} } = plugin({})

  for (const name of [...Object.keys(partials), ...Object.keys(helpers)]) {
    assert.ok(
      !BLOCKED_NAMES.has(name),
      `"${name}" is a blocked name (${[...BLOCKED_NAMES].join(', ')}) and will always be rejected by hamlet`,
    )
  }
})

it('partials are valid strings and compile without syntax errors', () => {
  const { partials = {} } = plugin({})

  for (const [name, template] of Object.entries(partials)) {
    assert.equal(typeof template, 'string', `Partial "${name}" must be a string`)
    assert.doesNotThrow(
      () => Handlebars.compile(template),
      `Partial "${name}" has a Handlebars syntax error`,
    )
  }
})

it('helpers are functions', () => {
  const { helpers = {} } = plugin({})

  for (const [name, fn] of Object.entries(helpers)) {
    assert.equal(typeof fn, 'function', `Helper "${name}" must be a function`)
  }
})

it('plugin namespaces its exported names', () => {
  const { namespace, partials = {}, helpers = {} } = plugin({})

  assert.equal(
    typeof namespace,
    'string',
    'Plugin must export a string "namespace"',
  )

  assert.match(
    namespace,
    /^[A-Z][A-Z0-9]*$/i,
    'Namespace must start with a letter and contain only letters and digits',
  )

  for (const name of Object.keys(partials)) {
    assert.ok(
      name.startsWith(`${namespace}.`),
      `Partial "${name}" must be prefixed with "${namespace}."`,
    )
  }

  for (const name of Object.keys(helpers)) {
    assert.ok(
      new RegExp(`^${namespace}[A-Z]`).test(name),
      `Helper "${name}" must be prefixed with "${namespace}" followed by an uppercase letter (e.g. "${namespace}Format")`,
    )
  }
})
