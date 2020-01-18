import {sequelize, User, Article, Comment, Group} from './test-model'

describe('Class methods', () => {
  beforeAll(() => sequelize.sync())

  const cacheStore = User.cache().client().store

  test('Cache is empty on start', () => {
    expect(cacheStore).toEqual({})
  })

  test('Create', async () => {
    const user = await User.cache().create({
      id: 1,
      name: 'Daniel'
    })

    const article = await Article.cache().create({
      uuid: '2086c06e-9dd9-4ee3-84b9-9e415dfd9c4c',
      title: 'New article'
    })
    await user.setArticles([article])
    await user.cache().save()

    const comment = await Comment.cache().create({
      userId: user.id,
      articleUuid: article.uuid,
      body: 'New comment'
    })

    const group = await Group.cache().create({
      id: 1,
      name: 'Group of wonderful people'
    })

    await group.setGroupUsers([user])
    await group.cache().save()

    // User with default primary key cached after create
    expect(cacheStore.User[1]).toEqual(
      JSON.stringify(user)
    )

    // Entity with custom primary key cached after create
    expect(cacheStore.Article[article.uuid]).toEqual(
      JSON.stringify(article)
    )

    // Entity with composite primary keys cached after create
    expect(cacheStore.Comment[`${comment.userId},${comment.articleUuid}`]).toEqual(
      JSON.stringify(comment)
    )

    // Cached user with primary key correctly loaded
    expect((await User.cache().findByPk(1)).get()).toEqual(
      user.get()
    )

    // Cached entity correctly loaded using custom primary key
    expect((await Article.cache().findByPk(article.uuid)).get()).toEqual(
      article.get()
    )

    expect((await Group.cache().findByPk(1)).get()).toEqual(
      group.get()
    )
  })

  test('Upsert', async () => {
    const user = await User.cache().findByPk(1)

    await User.cache().upsert({
      id: 1,
      name: 'Ivan'
    })

    // Timestamps synced after upsert
    expect((await User.cache().findByPk(1)).get()).toEqual(
      (await User.findByPk(1)).get()
    )

    await user.cache().reload()

    // User name was updated
    expect(user.name).toBe('Ivan')

    // User cached after upsert
    expect(cacheStore.User[1]).toEqual(
      JSON.stringify(user) // TODO fix loading superfluous data
    )

    const group = await Group.cache().findByPk(1)

    await Group.cache().upsert({
      id: 1,
      name: 'Group of best people'
    })

    expect((await Group.cache().findByPk(1)).get()).toEqual(
      (await Group.findByPk(1)).get()
    )

    await group.cache().reload()
    expect(group.name).toBe('Group of best people')
  })

  test('findByPk', async () => {
    expect(await User.cache().findByPk(2)).toBeNull() // Cache miss not causing any problem

    delete cacheStore.User[1]
    // Deleted so first find goes directly to DB & and second one retrieves from cache with association

    const getQuery = async () => {
      const user = await User.cache().findByPk(1, { include: [{ model: Article, as: 'Articles' }] })
      const articles = user.Articles[0].get()
      return articles
    }

    // Retrieved user with Article association
    expect(await getQuery()).toEqual(
      await getQuery()
    )

    const getGroupQuery = async () => {
      const group = await Group.cache().findByPk(1, { include: [{ model: User, as: 'groupUsers' }] })
      return group.get().groupUsers[0].get().name
    }
    expect(await getGroupQuery()).toBe(
      await getGroupQuery()
    )
  })

  test('cache -> findAll', async () => {
    const missingUsers = await User.cache('missingKey1').findAll({ where: { name: 'Not existent' } })

    // Cache miss not causing any problem
    expect(missingUsers).toEqual(
      []
    )

    const key = 'IvanUserCacheKey1'
    const getQuery = () => ({
      where: { name: 'Ivan' },
      include: [{ model: Article, as: 'Articles' }]
    })

    const [cacheMiss] = await User.cache(key).findAll(getQuery())
    const [cacheHit] = await User.cache(key).findAll(getQuery())
    const [dbValue] = await User.findAll(getQuery())

    // Returned value is the same, not matter if cache hit or miss
    expect(cacheMiss.get().Articles[0].get()).toEqual(
      cacheHit.get().Articles[0].get()
    )

    // 'Returned value is the same, as in db'
    expect(cacheHit.get().Articles[0].get()).toEqual(
      dbValue.get().Articles[0].get()
    )
  })

  test('cache -> findOne', async () => {
    const missingUser = await User.cache('MissingKey2').findOne({ where: { name: 'Not existent' } })

    expect(missingUser).toBeNull() // Cache miss not causing any problem

    const key = 'IvanUserCacheKey2'
    const getQuery = () => ({
      where: { name: 'Ivan' },
      include: [{ model: Article, as: 'Articles' }]
    })

    const cacheMiss = await User.cache(key).findOne(getQuery())
    const cacheHit = await User.cache(key).findOne(getQuery())
    const dbValue = await User.findOne(getQuery())

    // Returned value is the same, not matter if cache hit or miss
    expect(cacheMiss.get().Articles[0].get().uuid).toBe(
      cacheHit.get().Articles[0].get().uuid
    )

    // Returned value is the same, as in db
    expect(cacheHit.get().Articles[0].get().uuid).toBe(
      dbValue.get().Articles[0].get().uuid
    )
  })

  test('cache -> cache store', async () => {
    const key = 'ClearStoreUserCacheKey'

    const cachedUser = await User.cache(key).findOne({ where: { name: 'Ivan' } })
    const userFromDb = await User.findOne({ where: { name: 'Ivan' } })

    // User cached after find and present in key using cache store
    expect(userFromDb.get()).toEqual(
      cachedUser.get()
    )
  })

  test('cache -> clear', async () => {
    const key = 'ClearUserCacheKey'

    const cachedUser = await User.cache(key).findOne({ where: { name: 'Ivan' } })
    const userFromDb = await User.findOne({ where: { name: 'Ivan' } })

    // User cached after find and present in key
    expect(userFromDb.get()).toEqual(
      cachedUser.get()
    )

    await User.cache(key).clear()
    expect(cacheStore.User[key]).toBeUndefined() // User was deleted from cache
  })
})
