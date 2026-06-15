const MemcachePlusAdaptor = require('..')

class MemcachePlusMock {
  constructor() {
    this.store = new Map()
  }

  async set(key, value, options) {
    this.store.set(key, { value, options })
    return 'OK'
  }

  async get(key) {
    return this.store.has(key) ? this.store.get(key).value : null
  }

  async delete(key) {
    this.store.delete(key)
  }
}

describe('Adaptor methods', () => {
  const data = { test: 1 }
  const key = ['complex', 'key']
  const namespacedKey = 'model:complex:key'

  let client
  let adaptor

  beforeEach(() => {
    client = new MemcachePlusMock()
    adaptor = new MemcachePlusAdaptor({ client, namespace: 'model', lifetime: 11 })
  })

  test('set', async () => {
    const set = await adaptor.set(key, data)
    expect(set).toEqual('OK')
  })

  test('uses set, namespace, and ttl', async () => {
    const ttl = 100
    const set = jest.spyOn(client, 'set')
    await adaptor.set(key, data, { ttl })
    expect(set).toHaveBeenCalledWith(namespacedKey, data, ttl)
  })

  test('uses set, namespace, and ttl of 0', async () => {
    const ttl = 0
    const set = jest.spyOn(client, 'set')
    await adaptor.set(key, data, { ttl })
    expect(set).toHaveBeenCalledWith(namespacedKey, data, ttl)
  })

  test('get', async () => {
    expect(await adaptor.get(['missing'])).toEqual(null)
    await adaptor.set(key, data)
    expect(await adaptor.get(key)).toEqual(data)
  })

  test('del', async () => {
    await adaptor.del(key)

    expect(await adaptor.get(key)).toEqual(null)
  })
})
