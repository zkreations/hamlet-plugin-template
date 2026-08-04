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

const PARTIAL_NAME_PATTERN = /^[A-Z][A-Z0-9]*(?:[_-][A-Z][A-Z0-9]*)*$/i
const HELPER_NAME_PATTERN = /^[A-Z][A-Z0-9]*(?:[-_][A-Z][A-Z0-9]*)*$/i
const BLOCKED_NAMES = new Set(['__proto__', 'constructor', 'prototype'])

it('plugin exports a function (factory)', () => {
  assert.equal(typeof plugin, 'function', 'default export must be a function that returns { partials, helpers }')
})

it('plugin() returns an object with partials/helpers/context', () => {
  const result = plugin({})
  assert.equal(typeof result, 'object')
  assert.ok(result.partials === undefined || typeof result.partials === 'object')
  assert.ok(result.helpers === undefined || typeof result.helpers === 'object')
  assert.ok(result.context === undefined || typeof result.context === 'object')
})

it('namespace is not reserved (hamlet is not allowed)', () => {
  const { namespace } = plugin({})

  assert.ok(
    namespace.toLowerCase() !== 'hamlet',
    `The namespace "hamlet" is reserved by hamlet-builder and cannot be used by plugins`,
  )
})

it('plugin exports a valid namespace', () => {
  const { namespace } = plugin({})

  assert.equal(typeof namespace, 'string', 'Plugin must export a string "namespace"')
  assert.match(
    namespace,
    /^[A-Z][A-Z0-9]*$/i,
    'Namespace must start with a letter and contain only letters and digits',
  )
})

it('partial short names do not include the namespace prefix', () => {
  const { namespace, partials = {} } = plugin({})

  for (const name of Object.keys(partials)) {
    assert.ok(
      !name.startsWith(`${namespace}.`),
      `Partial "${name}" must be a short name without the namespace prefix. `
      + `Hamlet registers it as "${namespace}.${name}" automatically.`,
    )
  }
})

it('helper short names do not include the namespace prefix', () => {
  const { namespace, helpers = {} } = plugin({})
  const prefixRe = new RegExp(`^${namespace}[A-Z]`, 'i')

  for (const name of Object.keys(helpers)) {
    assert.ok(
      !prefixRe.test(name),
      `Helper "${name}" must be a short name without the namespace prefix. `
      + `Hamlet registers it as "${namespace}${name.charAt(0).toUpperCase()}${name.slice(1)}" automatically.`,
    )
  }
})

it('partial short names match hamlet\'s naming policy', () => {
  const { partials = {} } = plugin({})

  for (const name of Object.keys(partials)) {
    assert.ok(
      PARTIAL_NAME_PATTERN.test(name),
      `Partial "${name}" does not match hamlet's allowed name pattern `
      + '(letter start, letters/digits, optional "-" or "_" separators). '
      + 'Dots are not allowed in short names — the namespace separator is added automatically.',
    )
  }
})

it('helper short names match hamlet\'s naming policy (no dots allowed)', () => {
  const { helpers = {} } = plugin({})

  for (const name of Object.keys(helpers)) {
    assert.ok(
      HELPER_NAME_PATTERN.test(name),
      `Helper "${name}" does not match hamlet's allowed name pattern, or contains a dot. `
      + 'Use camelCase or dashes for multi-word helper names (e.g. "formatDate").',
    )
  }
})

it('the computed full partial names do not collide with reserved hamlet names', () => {
  const { namespace, partials = {} } = plugin({})

  for (const name of Object.keys(partials)) {
    const fullName = `${namespace}.${name}`
    assert.ok(
      !fullName.startsWith('hamlet.'),
      `Partial "${name}" would be registered as "${fullName}", which collides with a built-in hamlet partial`,
    )
  }
})

it('the computed full helper names do not collide with reserved hamlet helpers', () => {
  const { namespace, helpers = {} } = plugin({})

  for (const name of Object.keys(helpers)) {
    const fullName = `${namespace}${name.charAt(0).toUpperCase()}${name.slice(1)}`
    assert.ok(
      !RESERVED_HELPERS.has(fullName),
      `Helper "${name}" would be registered as "${fullName}", which collides with a built-in hamlet helper`,
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
      + 'call nested helpers this way.',
    )
  }
})

it('partial and helper short names are not on hamlet\'s blocked list', () => {
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

it('context, if present, is a plain object (not null, not an array)', () => {
  const { context } = plugin({})

  if (!('context' in plugin({})))
    return

  assert.ok(
    context !== null && typeof context === 'object' && !Array.isArray(context),
    `context must be a plain object if defined (got ${
      context === null ? 'null' : Array.isArray(context) ? 'array' : typeof context})`,
  )
})
