const Memcached = require('memcached')
const memcached = new Memcached('localhost:11211')

// You need to find appropriate adaptor or create your own, see "Available adaptors" section below
const MemcachedAdaptor = require('../../packages/sequelize-transparent-cache-memcached')
const memcachedAdaptor = new MemcachedAdaptor({
  client: memcached,
  namespace: 'model',
  lifetime: 60 * 60
})

const sequelizeCache = require('../../packages/sequelize-transparent-cache')
const { withCache } = sequelizeCache(memcachedAdaptor)

const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'user', 'password', {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306
})

// Register your models
const User = withCache(sequelize.import('./models/user'))

async function start () {
  await sequelize.sync()

  // Create user in db and in cache
  await User.cache().create({
    id: 1,
    name: 'Daniel'
  })

  // Load user from cache
  const user = await User.cache().findByPk(1)

  // Update in db and cache
  await user.cache().update({
    name: 'Vikki'
  })

  // Cache result of arbitrary query - requires cache key
  await User.cache('dan-users').findAll({
    where: {
      name: {
        [Sequelize.Op.like]: 'Dan'
      }
    }
  })

  process.exit()
}

start()
