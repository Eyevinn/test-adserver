# @fastifyjs/forwarded

Parse HTTP X-Forwarded-For header.

Updated version of the great https://github.com/jshttp/forwarded.
Implements https://github.com/jshttp/forwarded/pull/9.

## Installation

```sh
$ npm install @fastifyjs/forwarded
```

## API

```js
var forwarded = require('@fastifyjs/forwarded')
```

### forwarded(req)

```js
var addresses = forwarded(req)
```

Parse the `X-Forwarded-For` header from the request. Returns an array
of the addresses, including the socket address for the `req`, in reverse
order (i.e. index `0` is the socket address and the last index is the
furthest address, typically the end-user).

## Testing

```sh
$ npm test
```

## License

[MIT](LICENSE)
