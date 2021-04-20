# json-schema-resolver

[![CI](https://github.com/Eomm/json-schema-resolver/workflows/ci/badge.svg)](https://github.com/Eomm/json-schema-resolver/actions?query=workflow%3Aci)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

Resolve all `$refs` in your [JSON schema](https://json-schema.org/specification.html)!  
This module will resolve the `$ref` keyword against the `externalSchemas` you will provide.
If a reference is missing, it will not throw any error.

The `$ref` will be modified to point to a local reference `#/definitions/<generated key>`.
Moreover, the `definitions` keyword will be decorated with the external schemas to get only
one JSON schema resolved as output.

## Install

```sh
npm install json-schema-resolver
```

This plugin support Node.js >= 10

## Usage: resolve one schema against external schemas

```js
const RefResolver = require('json-schema-resolver')

const ref = RefResolver({
  clone: true // Clone the input schema without changing it. Default: false
})

const inputSchema = {
  $id: 'http://example.com/SimplePerson',
  type: 'object',
  properties: {
    name: { type: 'string' },
    address: { $ref: 'relativeAddress#' },
    houses: { type: 'array', items: { $ref: 'relativeAddress#' } }
  }
}

const addresSchema = {
  $id: 'relativeAddress', // Note: prefer always absolute URI like: http://mysite.com
  type: 'object',
  properties: {
    zip: { type: 'string' },
    city: { type: 'string' }
  }
}

const singleSchema = ref.resolve(inputSchema, { externalSchemas: [addresSchema] })
// mySchema is untouched thanks to clone:true
```

`singleSchema` will be like:

```json
{
  "$id": "http://example.com/SimplePerson",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "address": {
      "$ref": "#/definitions/def-0"
    },
    "houses": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/def-0"
      }
    }
  },
  "definitions": {
    "def-0": {
      "$id": "relativeAddress",
      "type": "object",
      "properties": {
        "zip": {
          "type": "string"
        },
        "city": {
          "type": "string"
        }
      }
    }
  }
}
```

## Usage: resolve multiple schemas against external shared schemas

When you have multiple schemas to resolve against a collection of shared schema you need to use this
module with little changes.

This is needed to have all the same definitions path (`#/definitions/<generated key>`) across all the
root schemas

```js
const ref = RefResolver({
  clone: true, // Clone the input schema without changing it. Default: false
  applicationUri: 'my-application.org', // You need to provide an unique URI to resolve relative `$id`s
  externalSchemas: [addresSchema] // The schemas provided at the creation of the resolver, will be used evvery time `.resolve` will be called
})

const inputSchema = {
  $id: 'http://example.com/SimplePerson',
  type: 'object',
  properties: {
    name: { type: 'string' },
    address: { $ref: 'relativeAddress#' },
    houses: { type: 'array', items: { $ref: 'relativeAddress#' } }
  }
}

// the resolved schema DOES NOT have definitions added
const singleSchema = ref.resolve(inputSchema)
const anotherResolvedSchema = ref.resolve(input_2_Schema)

// to get the definition you need only to call:
const sharedDefinitions = ref.definitions()
```

## Debug

To debug this module, simply set:

```bash
export DEBUG=json-schema-resolver
```

## License

Licensed under [MIT](./LICENSE).
