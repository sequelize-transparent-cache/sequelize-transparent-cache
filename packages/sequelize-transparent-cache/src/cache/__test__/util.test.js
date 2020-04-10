const sequelize = require('./sequelize')

const { User, Article, Group } = sequelize.models

beforeAll(() => sequelize.sync())
afterEach(() => (sequelize.sync({ force: true })))

describe('Recursive include tests', () => {
  test('Nested include depth == 1', async () => {
    // get all users of a group
    const group = await Group.cache().create({
      id: 1,
      name: 'Crazy Bloggers'
    })

    const user1 = await User.cache().create({
      id: 1,
      name: 'Bob'
    })

    const user2 = await User.cache().create({
      id: 2,
      name: 'Alice'
    })

    await group.setGroupUsers([user1, user2])
    await group.cache().save()

    // From DB
    const GroupFromDB = await Group.cache('CrazyBloggers').findAll({
      include: [{
        model: User,
        as: 'groupUsers'
      }],
      where: { id: 1 }
    })

    // From cache
    const cachedGroup = await Group.cache('CrazyBloggers').findAll({
      include: [{
        model: User,
        as: 'groupUsers'
      }],
      where: { id: 1 }
    })
    // comparing length at depth == 0
    expect(cachedGroup.length).toEqual(GroupFromDB.length)
    // comparing dataValues at depth == 0
    expect(cachedGroup[0].dataValues.id).toEqual(GroupFromDB[0].dataValues.id)
    expect(cachedGroup[0].dataValues.name).toEqual(GroupFromDB[0].dataValues.name)
    // comparing length at depth == 1
    expect(cachedGroup[0].groupUsers.length).toEqual(GroupFromDB[0].groupUsers.length)
    // comparing dataValues at depth == 1
    expect(cachedGroup[0].groupUsers[0].dataValues.id).toEqual(GroupFromDB[0].groupUsers[0].dataValues.id)
    expect(cachedGroup[0].groupUsers[0].dataValues.name).toEqual(GroupFromDB[0].groupUsers[0].dataValues.name)
  })

  test('Nested include depth == 2', async () => {
    // get all the aricles written by all users in a group
    const group = await Group.cache().create({
      id: 1,
      name: 'Crazy Bloggers'
    })

    const user1 = await User.cache().create({
      id: 1,
      name: 'Bob'
    })

    const article = await Article.cache().create({
      uuid: '2086c06e-9dd9-4ee3-84b9-9e415dfd9c4c',
      title: 'New article'
    })
    await user1.setArticles([article])
    await user1.cache().save()

    const user2 = await User.cache().create({
      id: 2,
      name: 'Alice'
    })

    await group.setGroupUsers([user1, user2])
    await group.cache().save()

    // Crazy Bloggers has Bob and Alice.
    // Bob has written one article. Alice has written none

    // From DB
    console.log('fromDB')
    const GroupFromDB = await Group.cache('CrazyBloggers2').findAll({
      include: [{
        model: User,
        as: 'groupUsers',
        include: [{
          model: Article,
          as: 'Articles'
        }]
      }],
      where: { id: 1 }
    })

    // From cache
    const cachedGroup = await Group.cache('CrazyBloggers2').findAll({
      include: [{
        model: User,
        as: 'groupUsers',
        include: [{
          model: Article,
          as: 'Articles'
        }]
      }],
      where: { id: 1 }
    })

    // comparing length at depth == 0
    expect(cachedGroup.length).toEqual(GroupFromDB.length)
    // comparing dataValues at depth == 0 i.e. "Crazy Bloggers"
    expect(cachedGroup[0].dataValues.id).toEqual(GroupFromDB[0].dataValues.id)
    expect(cachedGroup[0].dataValues.name).toEqual(GroupFromDB[0].dataValues.name)
    // comparing length at depth == 1
    expect(cachedGroup[0].groupUsers.length).toEqual(GroupFromDB[0].groupUsers.length)
    // comparing dataValues at depth == 1
    // Bob is present
    expect(cachedGroup[0].groupUsers[0].dataValues.id).toEqual(GroupFromDB[0].groupUsers[0].dataValues.id)
    expect(cachedGroup[0].groupUsers[0].dataValues.name).toEqual(GroupFromDB[0].groupUsers[0].dataValues.name)
    // Alice is present
    expect(cachedGroup[0].groupUsers[1].dataValues.id).toEqual(GroupFromDB[0].groupUsers[1].dataValues.id)
    expect(cachedGroup[0].groupUsers[1].dataValues.name).toEqual(GroupFromDB[0].groupUsers[1].dataValues.name)
    // Bob has an article
    expect(cachedGroup[0].groupUsers[0].Articles.length).toEqual(GroupFromDB[0].groupUsers[0].Articles.length)
    expect(cachedGroup[0].groupUsers[0].Articles[0].dataValues.id).toEqual(GroupFromDB[0].groupUsers[0].Articles[0].dataValues.id)
    expect(cachedGroup[0].groupUsers[0].Articles[0].dataValues.name).toEqual(GroupFromDB[0].groupUsers[0].Articles[0].dataValues.name)
    // Alice has no article
    expect(cachedGroup[0].groupUsers[1].Articles).toEqual([])
  })
})
