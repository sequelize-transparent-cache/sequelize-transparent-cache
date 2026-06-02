const { connect } = require('@nats-io/transport-node')
const { jetstream } = require('@nats-io/jetstream')
const { Kvm } = require('@nats-io/kv')

// connect to the default server 127.0.0.1:4222

async function start() {
  nc = await connect()

  const js = jetstream(nc)
  let kvm
  try {
    kvm = await new Kvm(js).create('bucket', { ttl: 60_000 })
  } catch (error) {}

  // You need to find appropriate adaptor or create your own, see "Available adaptors" section below
  const NatsAdaptor = require('../../packages/sequelize-transparent-cache-nats')
  const natsAdaptor = new NatsAdaptor({
    client: kvm,
    namespace: 'example',
  })

  const sequelizeCache = require('../../packages/sequelize-transparent-cache')
  const { withCache } = sequelizeCache(natsAdaptor)

  const { Sequelize, DataTypes } = require('sequelize')
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: console.log,
  })

  // Register your models
  // const User = withCache(sequelize.import('./models/user'))

  const User = withCache(
    sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }),
  )
  await sequelize.sync()

  // Create user in db and in cache
  try {
    await User.cache().create({
      name: 'Daniel',
    })
  } catch (error) {
    console.error('create: ', error)
  }

  // Load user from cache
  await User.cache().findByPk(1)
  await User.cache().findByPk(1)
  await User.cache().findByPk(1)
  await User.cache().findByPk(1)

  try {
    await User.cache().create({
      name: 'Daniel',
    })
    await User.cache().create({
      name: 'Daniel1',
    })
    await User.cache().create({
      name: 'Danieli2',
    })
    await User.cache().create({
      name: 'Danieli3',
    })
    await User.cache().create({
      name: 'Danieli4',
    })
  } catch (error) {
    console.error('create: ', error)
  }

  // Cache result of arbitrary query - requires cache key
  try {
    const findall = await User.cache('find-dan').findAll({
      where: {
        name: {
          [Sequelize.Op.like]: 'Dan%',
        },
      },
    })
    console.log('findall:', findall)
  } catch (error) {
    console.error('findAll: ', error)
  }

  // Update in db and cache
  try {
    const user = await User.cache().create({
      name: 'Dene',
    })
    await user.cache().update({
      id: user.id,
      name: 'Vikki',
    })
  } catch (error) {
    console.error('update: ', error)
  }
  kvm.destroy()
  process.exit()
}

start()
