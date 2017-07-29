# sequelize-transparent-cache-memcached

[memcached](https://www.npmjs.com/package/memcached) adaptor for [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache).

Stores sequelize objects in memcached.

## Example usage

```javascript
const Memcached = require('memcached')
const memcached = new Memcached('localhost:11211')

const MemcachedAdaptor = require('sequelize-transparent-cache-memcached')
const memcachedAdaptor = new MemcachedAdaptor({
  client: memcached,
  namespace: 'model', // optional
  lifetime: 60 * 60
})
```

## Constructor arguments

| Param       | Type             | Required | Description                                                                     |
|-------------|------------------|----------|---------------------------------------------------------------------------------|
| `client`    | memcached instance | yes      | Configured [memcached instance](https://www.npmjs.com/package/memcached#setting-up-the-client) |
| `namespace` | string           | no       | Prefix for all keys                                                             |
| `lifetime`  | integer          | yes       | Keys lifetime, seconds                                                          |

## Storing format
Each object stored as single JSON string.
Namespace delimeter is ":".

| Key                                  | Value           |
|--------------------------------------|-----------------|
| `<namespace>:<modelName>:<objectId>` | `{JSON string}` |

For more info see [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache)