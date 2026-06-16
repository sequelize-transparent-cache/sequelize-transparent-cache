const { connect } = require('@nats-io/transport-node')
const { jetstream } = require('@nats-io/jetstream')
const { Kvm } = require('@nats-io/kv')

// connect to the default server 127.0.0.1:4222

async function start() {
  const nc = await connect()

  const js = jetstream(nc)
  let kvm
  try {
    // The NATS documentation is slightly wonky, this is the static create()
    // which creates the bucket in the KV.
    // - ttl: is the bucket max_age, in effect the all of bucket TTL. If this is shorter
    //   than the per-Key TTL then this applies first.
    // - markerTTL is used to enable per-Key TTL it controls how long the tombstone DEL
    //   marker is left on the Key.
    // kvm = await new Kvm(js).create('bucket', { ttl: 60_000, markerTTL: 10_000 })
    kvm = await new Kvm(js).create('bucket', { markerTTL: 10_000 })
  } catch (error) {
    console.error(error)
  }

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

    // Load user from cache, there should be no queries
    await User.cache().findByPk(1)
    await User.cache().findByPk(1)
    await User.cache().findByPk(1)
    await User.cache().findByPk(1)

    await User.cache().create({
      name: 'Daniel',
    })
    await User.cache().create({
      name: 'Daniel1',
    })

    // Cache result of arbitrary query - requires cache key
    await User.cache('findall.find-dan').findAll({
      where: {
        name: {
          [Sequelize.Op.like]: 'Dan%',
        },
      },
    })

    // Cache result of arbitrary query - requires cache key
    // Include a TTL which must be string
    await User.cache('findall.find-dan-with-ttl', { ttl: '30s' }).findAll({
      where: {
        name: {
          [Sequelize.Op.like]: 'Dan%',
        },
      },
    })

    // Update in db and cache
    const user = await User.cache().create({
      name: 'Dene',
    })
    await user.cache().update({
      id: user.id,
      name: 'Vikki',
    })
    kvm.destroy()
    process.exit()
  } catch (error) {
    console.error('create: ', error)
  }
}

start()
