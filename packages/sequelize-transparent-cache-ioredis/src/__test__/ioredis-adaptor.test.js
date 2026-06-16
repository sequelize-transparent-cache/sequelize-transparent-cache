const IORedisAdaptor = require('..')

class IORedisMock {
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

  async del(key) {
    this.store.delete(key)
  }
}

describe('IORedisAdaptor', () => {
  const key = ['User', '1']
  const namespacedKey = 'model:User:1'
  const data = { id: 1, name: 'Dan' }
  const expectedTTL = ['EX', 11]

  let client
  let adaptor

  beforeEach(() => {
    client = new IORedisMock()
    adaptor = new IORedisAdaptor({ client, namespace: 'model', lifetime: 11 })
  })

  describe('set', () => {
    test('uses set and namespace but not ttl given', async () => {
      const set = jest.spyOn(client, 'set')
      await adaptor.set(key, data)
      expect(set).toHaveBeenCalledWith(namespacedKey, JSON.stringify(data), expectedTTL)
    })
    test('uses set, namespace, and ttl', async () => {
      const ttl = 100
      const expectedTTL = ['EX', ttl]
      const set = jest.spyOn(client, 'set')
      await adaptor.set(key, data, { ttl })
      expect(set).toHaveBeenCalledWith(namespacedKey, JSON.stringify(data), expectedTTL)
    })
  })
  describe('get', () => {
    test('returns null for a missing key', async () => {
      expect(await adaptor.get(['User', 'missing'])).toBeNull()
    })
    test('returns the correct value for a stored key', async () => {
      await adaptor.set(key, data)
      expect(await adaptor.get(key)).toEqual(data)
    })
    test('returns null for purged / deleted entries', async () => {
      await adaptor.set(key, data)
      await adaptor.del(key)
      expect(await adaptor.get(key)).toBeNull()
    })
  })
  test('del purges the namespaced key', async () => {
    const del = jest.spyOn(client, 'del')
    await adaptor.del(key)
    expect(del).toHaveBeenCalledWith(namespacedKey)
  })

  test('omits the prefix when no namespace is configured', async () => {
    const set = jest.spyOn(client, 'set')
    await new IORedisAdaptor({ client }).set(key, data)
    expect(set).toHaveBeenCalledWith('User:1', JSON.stringify(data), [])
  })
})
