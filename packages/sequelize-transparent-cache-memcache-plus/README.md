# sequelize-transparent-cache-memcache-plus

[memcache-plus](https://www.npmjs.com/package/memcache-plus) adaptor for [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache).

Stores sequelize objects in memcached using memcache-plus client.

## Example usage

```javascript
const MemcachePlus = require('memcache-plus')
const memcachePlus = new MemcachePlus()

const MemcachePlusAdaptor = require('sequelize-transparent-cache-memcache-plus')
const memcachePlusAdaptor = new MemcachePlusAdaptor({
  client: memcachePlus,
  namespace: 'model', // optional
  lifetime: 60 * 60   // optional
})

```

## Constructor arguments

| Param       | Type             | Required | Description                                                                     |
|-------------|------------------|----------|---------------------------------------------------------------------------------|
| `client`    | memcache-plus instance | yes      | Configured [memcache-plus instance](http://memcache-plus.com/initialization.html) |
| `namespace` | string           | no       | Prefix for all keys                                                             |
| `lifetime`  | integer          | no       | Keys lifetime, seconds                                                          |

## Storing format
Each object stored as single JSON string.
Namespace delimeter is ":".

| Key                                  | Value           |
|--------------------------------------|-----------------|
| `<namespace>:<modelName>:<objectId>` | `{JSON string}` |

For more info see [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache)