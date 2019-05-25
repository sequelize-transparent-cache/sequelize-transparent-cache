const MemcachePlus = require('memcache-plus')
const memcachePlus = new MemcachePlus()

const MemcachePlusAdaptor = require('..')
const memcachePlusAdaptor = new MemcachePlusAdaptor({
  client: memcachePlus,
  namespace: 'model',
  lifetime: 60 * 60
})

afterAll(() => memcachePlus.disconnect())

describe('Adaptor methods', () => {
  const data = { test: 1 }
  const key = ['complex', 'key']

  test('set', async () => {
    await memcachePlusAdaptor.set(key, data)
  })

  test('get', async () => {
    expect(await memcachePlusAdaptor.get(key)).toEqual(data)
  })

  test('del', async () => {
    await memcachePlusAdaptor.del(key)

    expect(await memcachePlusAdaptor.get(key)).toBe(null)
  })
})
