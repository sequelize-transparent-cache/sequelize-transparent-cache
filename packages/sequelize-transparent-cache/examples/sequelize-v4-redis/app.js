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
  return User.cache().findById(1) // Load user from cache
})
.then(user => {
  return user.cache().update({ // Update in db and cache
    name: 'Vikki'
  })
})
.then(() => process.exit())
