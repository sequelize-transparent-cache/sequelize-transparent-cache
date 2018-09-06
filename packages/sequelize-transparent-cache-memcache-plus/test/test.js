const t = require('tap')

const MemcachePlus = require('memcache-plus')
const memcachePlus = new MemcachePlus()

const MemcachePlusAdaptor = require('../MemcachedPlusAdaptor')
const memcachePlusAdaptor = new MemcachePlusAdaptor({
  client: memcachePlus,
  namespace: 'model',
  lifetime: 60 * 60
})

t.test('Adaptor methods', async t => {
  const data = { test: 1 }
  const key = ['complex', 'key']

  t.test('set', async () => {
    await memcachePlusAdaptor.set(key, data)
    t.pass('Successfully set some data')
  })

  t.test('get', async () => {
    t.deepEqual(
      await memcachePlusAdaptor.get(key),
      data,
      'Data from cache is the same'
    )
  })

  t.test('del', async () => {
    await memcachePlusAdaptor.del(key)

    t.notOk(
      await memcachePlusAdaptor.get(key),
      'Data removed from cache'
    )
  })

  t.teardown(() => memcachePlus.disconnect())
  t.autoend(true)
})
