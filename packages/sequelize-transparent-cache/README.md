# sequelize-transparent-cache
Simple to use and universal cache layer for Sequelize.
* Abstract: does not depends on underlying database, or cache specific
* Transparent: objects returned from cache are regular Sequelize instances with all your methods
* Explicit: all calls to cache comes through `cache()` method
* Lightweight: zero additional dependencies

## Installation

```npm install --save sequelize-transparent-cache```

And if you will use it with [memcached](https://www.npmjs.com/package/memcached)

```npm install --save sequelize-transparent-cache-memcached```

## Example usage

```javascript
const Memcached = require('memcached')
const memcached = new Memcached('localhost:11211')

// You need to find appropriate adaptor or create your own
const MemcachedAdaptor = require('sequelize-transparent-cache-memcached')
const memcachedAdaptor = new MemcachedAdaptor({
  client: memcached,
  namespace: 'model',
  lifetime: 60 * 60
})

const sequelizeCache = require('sequelize-transparent-cache')
const {classMethods, instanceMethods} = sequelizeCache(memcachedAdaptor)

const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  port: 3306,
  define: {
    classMethods,
    instanceMethods
  }
})

// Register your models, connect to db
// ...

const User = sequelize.models.User

await User.cache().create({ // Create user in db and in cache
  id: 1,
  name: 'Daniel'
})

const user = await User.cache().findById(1) // Load user from cache

await user.cache().update({ // Update in db and cache
  name: 'Dmitry'
})

```

## Methods

Object returned by `cache()` call contains wrappers for **limited subset** of sequelize model or instance methods.

instance:
  * `save()`
  * `update()`
  * `destroy()`

model:
  * `create()`
  * `findById()`
  * `upsert()` - **EXPERIMENTAL**
  * `insertOrUpdate()` - **EXPERIMENTAL**

In addition, both objects will contain `client()` method to get  cache adaptor.