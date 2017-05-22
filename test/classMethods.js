const t = require('tap')
const sequelize = require('./helpers/sequelize')

const User = sequelize.models.User
const cacheStore = User.cache().client().store

t.test('Instance methods', async t => {
  await sequelize.sync()

  t.deepEqual(cacheStore, {}, 'Cache is empty on start')

  const user = await User.cache().create({
    id: 1,
    name: 'Daniel'
  })

  t.test('Create', async t => {
    t.deepEqual(
      cacheStore.User[1],
      user.get(),
      'User cached afrer create'
    )

    t.deepEqual(
      (await User.cache().findById(1)).get(),
      user.get(),
      'Cached user correctly loaded'
    )
  })

  t.test('Upsert', async t => {
    await User.cache().upsert({
      id: 1,
      name: 'Ivan'
    })

    // TODO: Fix this issue
    t.deepEqual(
      (await User.cache().findById(1)).get(),
      (await User.findById(1)).get(),
      'Timestamps synced after upsert',
      {skip: true}
    )

    await user.cache().reload()

    t.is(user.name, 'Ivan', 'User name was updated')

    t.deepEqual(
      cacheStore.User[1],
      user.get(),
      'User cached afrer upsert'
    )
  })

  t.test('FindById', async t => {
    t.is(await User.cache().findById(2), null, 'Cache miss not causing any problem')
  })
})
