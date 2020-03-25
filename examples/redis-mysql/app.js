const Redis = require('ioredis')
const redis = new Redis()

const RedisAdaptor = require('../../packages/sequelize-transparent-cache-ioredis')
const redisAdaptor = new RedisAdaptor({
  client: redis,
  namespace: 'model',
  lifetime: 60 * 60
})

const sequelizeCache = require('../../packages/sequelize-transparent-cache')
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

async function start () {
  await sequelize.sync({ force: true })

  // Create user in db and in cache
  await User.cache().create({
    id: 1,
    name: 'Daniel'
  })

  // Load user from cache
  const user = await User.cache().findByPk(1)
  console.log(user)
  // Update in db and cache
  await user.cache().update({
    name: 'Vikki'
  })

  // Cache result of arbitrary query - requires cache key
  await User.cache('dan-user').findAll({
    where: {
      name: {
        [Sequelize.Op.like]: 'Dan'
      }
    }
  })

  process.exit()
}

start()