const sequelize = require('./sequelize')

const { User } = sequelize.models
const cacheStore = User.cache().client().store

beforeAll(() => sequelize.sync())

describe('Instance methods', () => {
  // Cache is empty on start
  expect(cacheStore).toEqual({})

  const user = User.build({
    id: 1,
    name: 'Daniel'
  })

  test('Create', async () => {
    await user.cache().save()

    // User cached after create
    expect(cacheStore.User[1]).toEqual(
      user.get()
    )

    // Cached user correctly loaded
    expect((await User.cache().findByPk(1)).get()).toEqual(
      user.get()
    )
  })

  test('Update', async () => {
    await user.cache().update({
      name: 'Dmitry'
    })

    // User name was updated
    expect(user.name).toBe('Dmitry')

    // User cached after upsert
    expect(cacheStore.User[1]).toEqual(
      user.get()
    )
  })

  test('Clear', async () => {
    // Cached user correctly loaded
    expect((await User.cache().findByPk(1)).get()).toEqual(
      user.get()
    )
    await user.cache().clear()

    expect(cacheStore.User[1]).toBeUndefined()
  })

  test('Destroy', async () => {
    await user.cache().destroy()

    expect(cacheStore.User[1]).toBeUndefined()
    expect(await User.findByPk(1)).toBeNull()
  })
})
