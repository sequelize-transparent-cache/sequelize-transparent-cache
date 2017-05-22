# sequelize-transparent-cache

[![Build Status](https://travis-ci.org/SDSWanderer/sequelize-transparent-cache.svg?branch=master)](https://travis-ci.org/SDSWanderer/sequelize-transparent-cache)
[![Coverage Status](https://coveralls.io/repos/github/SDSWanderer/sequelize-transparent-cache/badge.svg?branch=master)](https://coveralls.io/github/SDSWanderer/sequelize-transparent-cache?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Climate](https://codeclimate.com/github/SDSWanderer/sequelize-transparent-cache/badges/gpa.svg)](https://codeclimate.com/github/codeclimate/codeclimate)
[![npm version](https://badge.fury.io/js/sequelize-transparent-cache.svg)](https://badge.fury.io/js/sequelize-transparent-cache)
[![Dependency Status](https://www.versioneye.com/user/projects/5922c858da94de003b9f63af/badge.svg?style=flat)](https://www.versioneye.com/user/projects/5922c858da94de003b9f63af)

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