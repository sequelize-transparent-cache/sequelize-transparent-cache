const t = require('tap')
const sequelize = require('./helpers/sequelize')

const User = sequelize.models.User
const Person = sequelize.models.Person
const cacheStore = User.cache().client().store

t.test('Instance methods', async t => {
  await sequelize.sync()

  t.deepEqual(cacheStore, {}, 'Cache is empty on start')

  const user = await User.cache().create({
    id: 1,
    name: 'Daniel'
  })

  const mike = await Person.cache().create({
    name: 'Mike'
  })

  const alex = await Person.cache().create({
    name: 'Alex'
  })

  t.test('Create', async t => {
    t.deepEqual(
      cacheStore.User[1],
      user.get(),
      'User with primary key cached after create'
    )
    console.log(cacheStore)
    t.deepEqual(
      cacheStore.Person[1],
      mike.get(),
      'Entity without primary key cached after create using autoincrement id'
    )
    t.deepEqual(
      cacheStore.Person[2],
      alex.get(),
      'Entity without primary key cached after create using autoincrement id'
    )
    t.deepEqual(
      (await User.cache().findById(1)).get(),
      user.get(),
      'Cached user with primary key correctly loaded'
    )

    t.deepEqual(
      (await Person.cache().findById(1)).get(),
      mike.get(),
      'Cached entity without primary key correctly loaded using auto increment id'
    )
    t.deepEqual(
      (await Person.cache().findById(2)).get(),
      alex.get(),
      'Cached entity without primary key correctly loaded using auto increment id'
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
