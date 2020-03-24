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
const user = sequelize.import('./models/user')
const grand = sequelize.import('./models/grand')
const parent = sequelize.import('./models/parent')

user.associate(parent)
parent.associate(user, grand)
grand.associate(parent)

const User = withCache(user)
const Parent = withCache(parent)
const Grand = withCache(grand)

async function start () {
  await sequelize.sync()

  // Create user in db and in cache
  // await User.cache().create({
  //   id: 3,
  //   name: 'Daniel'
  // })
  // await Parent.cache().create({
  //   id: 3,
  //   name: 'Parent_DAN',
  //   userId: 3
  // })
  // await Grand.cache().create({
  //   id: 3,
  //   name: 'grand_DAN',
  //   parentId: 3
  // })

  // Load user from cache
  // const user = await User.cache().findByPk(1)
  // console.log(user)
  // const parent = await Parent.cache().findByPk(1)
  // const grand = await Grand.cache().findByPk(1)
  // console.log(parent)
  // await User.cache('Daniel').clear()
  // const user2 = await User.cache().findByPk(11)
  // console.log("SSSS", user2)

  // Update in db and cache
  // await user.cache().update({
  //   name: 'Vikki'
  // })

  // Cache result of arbitrary query - requires cache key
  const val = await Grand.cache('dan-user21').findAll({
    include: [{
      model: Parent,
      include: [{ model: User, required: true }],
    }],
    where: { id: 3 }
  })

  console.log('value', val[0].Parent)
  process.exit()
}

start()
