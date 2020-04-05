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
const child = sequelize.import('./models/child')
const grand = sequelize.import('./models/grand')
const parent = sequelize.import('./models/parent')

child.associate(parent)
parent.associate(child, grand)

const Child = withCache(child)
const Parent = withCache(parent)
const Grand = withCache(grand)

async function start () {
  await sequelize.sync()

  const commonId = 14
  // Create user in db and in cache
  await Parent.cache().create({
    id: commonId,
    name: 'Parent_DAN'
  })

  await Child.cache().create({
    id: commonId,
    name: 'Daniel',
    parentId: commonId
  })
  await Child.cache().create({
    id: commonId + 50,
    name: 'Daniel2',
    parentId: commonId
  })

  await Grand.cache().create({
    id: commonId,
    name: 'grand_DAN',
    parentId: commonId
  })

  // Cache result of arbitrary query - requires cache key

  // 1:1 ->  user -> parent -> grand
  let val = await Child.cache('dan-user29').findAll({
    include: [{
      model: Parent,
      include: [{ model: Grand }]
    }],
    where: { id: commonId }
  })
  console.log(val)

  // 1:N -> parent -> users + grand -> (users) -> (parent) -> (users) -> parent (depth = 5)
  val = await Parent.cache('dan-Parent3').findAll({
    include: [{
      model: Child,
      include: [{ model: Parent }]
    }]
  })
  console.log('Logging', val)
  process.exit()
}

start()
