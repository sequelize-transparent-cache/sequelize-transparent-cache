const Memcached = require('memcached')
const memcached = new Memcached('localhost:11211')

// You need to find appropriate adaptor or create your own, see "Available adaptors" section below
const MemcachedAdaptor = require('sequelize-transparent-cache-memcached')
const memcachedAdaptor = new MemcachedAdaptor({
  client: memcached,
  namespace: 'model',
  lifetime: 60 * 60
})

const sequelizeCache = require('sequelize-transparent-cache')
const { classMethods, instanceMethods } = sequelizeCache(memcachedAdaptor)

const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  port: 3306,
  define: { // That way we register .cache() method for all models and instances in sequelize v3
    classMethods,
    instanceMethods
  }
})

// Register your models
const User = sequelize.import('./models/user')

sequelize.sync()
.then(() => {
  return User.cache().create({ // Create user in db and in cache
    id: 1,
    name: 'Daniel'
  })
})
.then(() => {
  return User.cache().findById(1) // Load user from cache
})
.then(user => {
  return user.cache().update({ // Update in db and cache
    name: 'Vikki'
  })
})
.then(() => process.exit())
