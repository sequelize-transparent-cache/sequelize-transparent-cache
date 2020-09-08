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
  lifetime: 60 * 60,
  errorHandler: (error, operation, cacheKey) => { // optional
    console.warn(`Memcached error on attempt to ${operation} ${cacheKey}`, error)
  } 
})
```

## Constructor arguments

| Param          | Type               | Required | Description                                                                     |
|----------------|--------------------|----------|---------------------------------------------------------------------------------|
| `client`       | memcached instance | yes      | Configured [memcached instance](https://www.npmjs.com/package/memcached#setting-up-the-client) |
| `namespace`    | string             | no       | Prefix for all keys                                                             |
| `lifetime`     | integer            | yes      | Keys lifetime, seconds                                                          |
| `errorHandler` | function           | no       |  Global error handler function. It takes `error` thrown, string `operation` (`set`/`get`/`del`), string `cacheKey` |

#### Using global error handler
If `errorHandler` function is specified in constructor parameters, it becomes responsible for handling errors thrown 
by Memcached. It's handy if you want Memcached errors to be swallowed inside the adapter instead of interrupting 
external caller code.
* Handler is invoked on errors instead of rejecting a resulting Promise. 
* The value returned by error handler is used as an operation result to resolve resulting Promise. 
* If error handler throws an error, it's propagated to the caller code with no additional interception. It may be used 
to forcely rethrow the original error.

## Storing format
Each object stored as single JSON string.
Namespace delimeter is ":".

| Key                                  | Value           |
|--------------------------------------|-----------------|
| `<namespace>:<modelName>:<objectId>` | `{JSON string}` |

For more info see [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache)
