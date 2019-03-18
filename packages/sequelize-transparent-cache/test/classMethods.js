const t = require('tap')
const sequelize = require('./helpers/sequelize')

const User = sequelize.models.User
const Article = sequelize.models.Article
const Comment = sequelize.models.Comment
const cacheStore = User.cache().client().store

t.test('Class methods', async t => {
  await sequelize.sync()

  t.deepEqual(cacheStore, {}, 'Cache is empty on start')

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
  t.test('Create', async t => {
    t.deepEqual(
      cacheStore.User[1],
      user.get(),
      'User with default primary key cached after create'
    )
    t.deepEqual(
      cacheStore.Article[article.uuid],
      article.get(),
      'Entity with custom primary key cached after create'
    )
    t.deepEqual(
      cacheStore.Comment[`${comment.userId},${comment.articleUuid}`],
      comment.get(),
      'Entity with composite primary keys cached after create'
    )
    t.deepEqual(
      (await User.cache().findByPk(1)).get(),
      user.get(),
      'Cached user with primary key correctly loaded'
    )

    t.deepEqual(
      (await Article.cache().findByPk(article.uuid)).get(),
      article.get(),
      'Cached entity correctly loaded using custom primary key'
    )
  })

  t.test('Upsert', async t => {
    await User.cache().upsert({
      id: 1,
      name: 'Ivan'
    })

    // TODO: Fix this issue
    t.deepEqual(
      (await User.cache().findByPk(1)).get(),
      (await User.findByPk(1)).get(),
      'Timestamps synced after upsert',
      { skip: true }
    )

    await user.cache().reload()

    t.is(user.name, 'Ivan', 'User name was updated')

    t.deepEqual(
      cacheStore.User[1],
      user.get(),
      'User cached after upsert'
    )
  })

  t.test('findByPk', async t => {
    t.is(await User.cache().findByPk(2), null, 'Cache miss not causing any problem')

    delete cacheStore.User[1]
    // Deleted so first find goes directly to DB & and second one retrieves from cache with association
    t.is(
      (await User.cache().findByPk(1, { include: [{ model: Article, as: 'Articles' }] })).get().Articles[0].get().uuid,
      (await User.cache().findByPk(1, { include: [{ model: Article, as: 'Articles' }] })).get().Articles[0].get().uuid,
      'Retrieved user with Article association'
    )
  })

  t.test('manualCache -> findAll', async t => {
    const missingUsers = await User.manualCache('missingKey1').findAll({ where: { name: 'Not existent' } })

    t.same(
      missingUsers,
      [],
      'Cache miss not causing any problem'
    )

    const key = 'IvanUserCacheKey1'
    const getQuery = () => ({
      where: { name: 'Ivan' },
      include: [{ model: Article, as: 'Articles' }]
    })

    const [cacheMiss] = await User.manualCache(key).findAll(getQuery())
    const [cacheHit] = await User.manualCache(key).findAll(getQuery())
    const [dbValue] = await User.findAll(getQuery())

    t.is(
      cacheMiss.get().Articles[0].get().uuid,
      cacheHit.get().Articles[0].get().uuid,
      'Returned value is the same, not matter if cache hit or miss'
    )

    t.is(
      cacheHit.get().Articles[0].get().uuid,
      dbValue.get().Articles[0].get().uuid,
      'Returned value is the same, as in db'
    )
  })

  t.test('manualCache -> findOne', async t => {
    const missingUser = await User.manualCache('MissingKey2').findOne({ where: { name: 'Not existent' } })

    t.same(
      missingUser,
      null,
      'Cache miss not causing any problem'
    )

    const key = 'IvanUserCacheKey2'
    const getQuery = () => ({
      where: { name: 'Ivan' },
      include: [{ model: Article, as: 'Articles' }]
    })

    const cacheMiss = await User.manualCache(key).findOne(getQuery())
    const cacheHit = await User.manualCache(key).findOne(getQuery())
    const dbValue = await User.findOne(getQuery())

    t.is(
      cacheMiss.get().Articles[0].get().uuid,
      cacheHit.get().Articles[0].get().uuid,
      'Returned value is the same, not matter if cache hit or miss'
    )

    t.is(
      cacheHit.get().Articles[0].get().uuid,
      dbValue.get().Articles[0].get().uuid,
      'Returned value is the same, as in db'
    )
  })

  t.test('manualCache -> cache store', async t => {
    const key = 'ClearStoreUserCacheKey'
    const manualCacheStore = User.manualCache().client().store
    const manualTest = await User.manualCache(key).findOne({ where: { name: 'Ivan' } })
    t.deepEqual(
      manualCacheStore.User[key],
      manualTest.get(),
      'User cached after find and present in key using manualCache store'
    )
  })

  t.test('manualCache -> clear', async t => {
    const key = 'ClearUserCacheKey'
    const manualTest = await User.manualCache(key).findOne({ where: { name: 'Ivan' } })
    t.deepEqual(
      cacheStore.User[key],
      manualTest.get(),
      'User cached after find and present in key'
    )

    await User.manualCache(key).clear()
    t.notOk(
      cacheStore.User[key],
      'User was deleted from cache'
    )
  })
})
