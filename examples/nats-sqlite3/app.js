const { connect } = require('@nats-io/transport-node')
const { jetstream } = require('@nats-io/jetstream')
const { Kvm } = require('@nats-io/kv')

// connect to the default server 127.0.0.1:4222

async function start() {
  nc = await connect()

  const js = jetstream(nc)
  let kvm
  try {
    // The NATS documentation is slightly wonky, this is the static create()
    // which creates the bucket in the KV.
    // - ttl is the max_age, in effect the all of bucket TTL.
    // - markerTTL is used to enable per-Key TTL
    kvm = await new Kvm(js).create('bucket', { ttl: 60_000, markerTTL: 10_000 })
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

  // Load user from cache, there should be no queries
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
  } catch (error) {
    console.error('create: ', error)
  }

  // Cache result of arbitrary query - requires cache key
  try {
    await User.cache('findall.find-dan').findAll({
      where: {
        name: {
          [Sequelize.Op.like]: 'Dan%',
        },
      },
    })
  } catch (error) {
    console.error('findAll: ', error)
  }

  // Cache result of arbitrary query - requires cache key
  // Include a TTL which must be string
  try {
    await User.cache('findall.find-dan-with-ttl', '30s').findAll({
      where: {
        name: {
          [Sequelize.Op.like]: 'Dan%',
        },
      },
    })
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
