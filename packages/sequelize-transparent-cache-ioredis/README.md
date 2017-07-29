# sequelize-transparent-cache-ioredis

[ioredis](https://www.npmjs.com/package/ioredis) adaptor for [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache).

Stores sequelize objects in redis using ioredis client.

## Example usage

```javascript
const Redis = require('ioredis')
const redis = new Redis()

const RedisAdaptor = require('sequelize-transparent-cache-ioredis')
const redisAdaptor = new RedisAdaptor({
  client: redis,
  namespace: 'model', // optional
  lifetime: 60 * 60   // optional
})

```

## Constructor arguments

| Param       | Type             | Required | Description                                                                     |
|-------------|------------------|----------|---------------------------------------------------------------------------------|
| `client`    | ioredis instance | yes      | Configured [ioredis instance](https://github.com/luin/ioredis#connect-to-redis) |
| `namespace` | string           | no       | Prefix for all keys                                                             |
| `lifetime`  | integer          | no       | Keys lifetime, seconds                                                          |

## Storing format
Each object stored as single JSON string.
Namespace delimeter is ":".

| Key                                  | Value           |
|--------------------------------------|-----------------|
| `<namespace>:<modelName>:<objectId>` | `{JSON string}` |

For more info see [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache)