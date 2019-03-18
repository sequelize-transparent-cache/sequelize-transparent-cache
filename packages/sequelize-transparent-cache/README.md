# sequelize-transparent-cache

[![Build Status](https://travis-ci.org/DanielHreben/sequelize-transparent-cache.svg?branch=master)](https://travis-ci.org/DanielHreben/sequelize-transparent-cache)
[![Coverage Status](https://codecov.io/gh/DanielHreben/sequelize-transparent-cache/branch/master/graph/badge.svg)](https://codecov.io/gh/DanielHreben/sequelize-transparent-cache)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Climate](https://codeclimate.com/github/DanielHreben/sequelize-transparent-cache/badges/gpa.svg)](https://codeclimate.com/github/DanielHreben/sequelize-transparent-cache)
[![npm version](https://badge.fury.io/js/sequelize-transparent-cache.svg)](https://badge.fury.io/js/sequelize-transparent-cache)
[![Dependency Status](https://david-dm.org/DanielHreben/sequelize-transparent-cache.svg)](https://www.versioneye.com/user/projects/5922c858da94de003b9f63af)
[![Greenkeeper badge](https://badges.greenkeeper.io/DanielHreben/sequelize-transparent-cache.svg)](https://greenkeeper.io/)

Simple to use and universal cache layer for Sequelize.
* Abstract: does not depends on underlying database, or cache specific
* Transparent: objects returned from cache are regular Sequelize instances with all your methods
* Explicit: all calls to cache comes through `cache()` method
* Lightweight: zero additional dependencies

## Installation

Install sequelize-transparent-cache itself:

```npm install --save sequelize-transparent-cache```

Find and install appropriate adaptor for your cache system, see "Available adaptors" section below.
In this example we will use [ioredis](https://www.npmjs.com/package/ioredis)

```npm install --save sequelize-transparent-cache-ioredis```

## Example usage
```javascript
const Redis = require('ioredis')
const redis = new Redis()

const RedisAdaptor = require('sequelize-transparent-cache-ioredis')
const redisAdaptor = new RedisAdaptor({
  client: redis,
  namespace: 'model',
  lifetime: 60 * 60
})

const sequelizeCache = require('sequelize-transparent-cache')
const { withCache } = sequelizeCache(redisAdaptor)

const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'user', 'password', {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306
})

// Register and wrap your models:
// withCache() will add cache() methods to all models and instances in sequelize v4
const User = withCache(sequelize.import('./models/user'))

sequelize.sync()
.then(() => {
  return User.cache().create({ // Create user in db and in cache
    id: 1,
    name: 'Daniel'
  })
})
.then(() => {
  return User.cache().findByPk(1) // Load user from cache
})
.then(user => {
  return user.cache().update({ // Update in db and cache
    name: 'Vikki'
  })
})

```

Look for all examples applications in `examples` folder.
* [Usage with memcached](https://github.com/DanielHreben/sequelize-transparent-cache/blob/master/examples/memcached-mysql)
* [Usage with ioredis](https://github.com/DanielHreben/sequelize-transparent-cache/blob/master/examples/redis-mysql)


## Methods

Object returned by `cache()` call contains wrappers for **limited subset** of sequelize model or instance methods.

Instance:
  * [`save()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#instance-method-save)
  * [`update()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-update)
  * [`destroy()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#instance-method-destroy)
  * [`reload()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#instance-method-reload)

Model:
  * [`create()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-create)
  * [`findByPk()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-findByPk)
  * [`upsert()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-upsert) - **EXPERIMENTAL**
  * [`insertOrUpdate()`](http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-upsert) - **EXPERIMENTAL**

In addition, both objects will contain `client()` method to get cache adaptor.

## Available adaptors

* [memcached](https://www.npmjs.com/package/sequelize-transparent-cache-memcached)
* [memcache-plus](https://www.npmjs.com/package/sequelize-transparent-cache-memcache-plus)
* [ioredis](https://www.npmjs.com/package/sequelize-transparent-cache-ioredis)
* [variable](https://www.npmjs.com/package/sequelize-transparent-cache-variable)

You can easy write your own adaptor. Each adatper must implement 3 methods:

* `get(path: Array): Promise<value>`
* `set(path: Array, value: Object): Promise`
* `del(path: Array): Promise`

Checkout existed adaptors for reference implementation.
