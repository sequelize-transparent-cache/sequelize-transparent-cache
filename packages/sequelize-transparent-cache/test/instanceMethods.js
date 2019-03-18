const t = require('tap')
const sequelize = require('./helpers/sequelize')

const User = sequelize.models.User
const cacheStore = User.cache().client().store

t.test('Instance methods', async t => {
  await sequelize.sync()

  t.deepEqual(cacheStore, {}, 'Cache is empty on start')

  const user = User.build({
    id: 1,
    name: 'Daniel'
  })

  t.test('Create', async t => {
    await user.cache().save()

    t.deepEqual(
      cacheStore.User[1],
      user.get(),
      'User cached after create'
    )

    t.deepEqual(
      (await User.cache().findByPk(1)).get(),
      user.get(),
      'Cached user correctly loaded'
    )
  })

  t.test('Update', async t => {
    await user.cache().update({
      name: 'Dmitry'
    })

    t.is(user.name, 'Dmitry', 'User name was updated')

    t.deepEqual(
      cacheStore.User[1],
      user.get(),
      'User cached after upsert'
    )
  })
  t.test('Clear', async t => {
    t.deepEqual(
      (await User.cache().findByPk(1)).get(),
      user.get(),
      'Cached user correctly loaded'
    )
    await user.cache().clear()

    t.notOk(
      cacheStore.User[1],
      'User was deleted from cache'
    )
  })

  t.test('Destroy', async t => {
    await user.cache().destroy()

    t.notOk(
      cacheStore.User[1],
      'User was deleted from cache'
    )

    t.notOk(
      await User.findByPk(1),
      'User was deleted from db'
    )
  })
})
