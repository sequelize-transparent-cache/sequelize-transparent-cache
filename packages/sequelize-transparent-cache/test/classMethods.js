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
      (await User.cache().findById(1)).get(),
      user.get(),
      'Cached user with primary key correctly loaded'
    )

    t.deepEqual(
      (await Article.cache().findById(article.uuid)).get(),
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
      (await User.cache().findById(1)).get(),
      (await User.findById(1)).get(),
      'Timestamps synced after upsert',
      { skip: true }
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

    delete cacheStore.User[1]
    // Deleted so first find goes directly to DB & and second one retrieves from cache with association
    t.is(
      (await User.cache().findById(1, { include: [{ model: Article, as: 'Articles' }] })).get().Articles[0].get().uuid,
      (await User.cache().findById(1, { include: [{ model: Article, as: 'Articles' }] })).get().Articles[0].get().uuid,
      'Retrieved user with Article association'
    )
  })

  t.test('manualCache -> find', async t => {
    t.is(await User.manualCache('sasas').find({ where: { name: 'Not existent' } }), null, 'Cache miss not causing any problem')

    const key = 'IvanUserCacheKey'
    const manualTest = await User.manualCache(key).find({ where: { name: 'Ivan' }, include: [{ model: Article, as: 'Articles' }] })
    t.is(
      manualTest.get().Articles[0].get().uuid,
      (await User.cache().findById(1, { include: [{ model: Article, as: 'Articles' }] })).get().Articles[0].get().uuid,
      'Retrieved User with Article association using find method'
    )

    delete cacheStore.User[key]
    const secondManualTest = await User.manualCache(key).find({ where: { name: 'Ivan' }, include: [{ model: Article, as: 'Articles' }] })
    const thirdManualTest = await User.manualCache(key).find({ where: { name: 'Ivan' }, include: [{ model: Article, as: 'Articles' }] })
    t.is(
      secondManualTest.get().Articles[0].get().uuid,
      thirdManualTest.get().Articles[0].get().uuid,
      'Retrieved User with Article association from DB and cache'
    )
  })

  t.test('manualCache -> cache store', async t => {
    const key = 'ClearStoreUserCacheKey'
    const manualCacheStore = User.manualCache().client().store
    const manualTest = await User.manualCache(key).find({ where: { name: 'Ivan' } })
    t.deepEqual(
      manualCacheStore.User[key],
      manualTest.get(),
      'User cached afrer find and present in key using manualCache store'
    )
  })

  t.test('manualCache -> clear', async t => {
    const key = 'ClearUserCacheKey'
    const manualTest = await User.manualCache(key).find({ where: { name: 'Ivan' } })
    t.deepEqual(
      cacheStore.User[key],
      manualTest.get(),
      'User cached afrer find and present in key'
    )

    await User.manualCache(key).clear()
    t.notOk(
      cacheStore.User[key],
      'User was deleted from cache'
    )
  })
})
