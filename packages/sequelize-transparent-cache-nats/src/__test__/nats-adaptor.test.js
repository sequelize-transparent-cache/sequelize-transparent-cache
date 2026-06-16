const NatsAdaptor = require('..')

function jetStreamError(message) {
  const error = new Error(message)
  error.name = 'JetStreamApiError'
  return error
}

// Minimal in-memory stand-in for a @nats-io/kv Bucket.
class FakeKvBucket {
  constructor() {
    this.store = new Map()
  }

  // put: upsert, returns the new revision
  async put(key, value) {
    this.store.set(key, { value, operation: 'PUT' })
    return this.store.size
  }

  // create: fails if a live value already exists, succeeds over a tombstone
  async create(key, value, ttl) {
    const existing = this.store.get(key)
    if (existing && existing.operation === 'PUT') {
      throw jetStreamError('wrong last sequence: 1')
    }
    this.store.set(key, { value, operation: 'PUT', ttl })
    return this.store.size
  }

  // get: null on miss, otherwise an entry exposing operation + json()
  async get(key) {
    const entry = this.store.get(key)
    if (!entry) return null
    return { operation: entry.operation, json: () => JSON.parse(entry.value) }
  }

  // purge: leaves a PURGE tombstone
  async purge(key) {
    this.store.set(key, { value: null, operation: 'PURGE' })
  }
}

describe('NatsAdaptor', () => {
  const key = ['User', '1']
  const namespacedKey = 'model.User.1'
  const data = { id: 1, name: 'Dan' }

  let client
  let adaptor

  beforeEach(() => {
    client = new FakeKvBucket()
    adaptor = new NatsAdaptor({ client, namespace: 'model' })
  })

  describe('set', () => {
    test('uses put and namespaces the key when no ttl is given', async () => {
      const put = jest.spyOn(client, 'put')
      await adaptor.set(key, data)
      expect(put).toHaveBeenCalledWith(namespacedKey, JSON.stringify(data))
    })

    test('use put if options.ttl is not a string', async () => {
      const put = jest.spyOn(client, 'put')
      await adaptor.set(key, data, { ttl: 30 })
      expect(put).toHaveBeenCalledWith(namespacedKey, JSON.stringify(data))
    })

    test('uses create and forwards the ttl when one is given', async () => {
      const create = jest.spyOn(client, 'create')
      await adaptor.set(key, data, { ttl: '30s' })
      expect(create).toHaveBeenCalledWith(namespacedKey, JSON.stringify(data), '30s')
    })

    test('swallows "wrong last sequence" conflicts on create', async () => {
      await adaptor.set(key, data, { ttl: '30s' })
      await expect(adaptor.set(key, data, { ttl: '30s' })).resolves.toBeUndefined()
    })

    test('rethrows unexpected create errors', async () => {
      jest.spyOn(client, 'create').mockRejectedValue(jetStreamError('boom'))
      await expect(adaptor.set(key, data, { ttl: '30s' })).rejects.toThrow('boom')
    })
  })

  describe('get', () => {
    test('returns null for a missing key', async () => {
      expect(await adaptor.get(['User', 'missing'])).toBeNull()
    })

    test('returns the parsed value for a stored key', async () => {
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
    const purge = jest.spyOn(client, 'purge')
    await adaptor.del(key)
    expect(purge).toHaveBeenCalledWith(namespacedKey)
  })

  test('omits the prefix when no namespace is configured', async () => {
    const put = jest.spyOn(client, 'put')
    await new NatsAdaptor({ client }).set(key, data)
    expect(put).toHaveBeenCalledWith('User.1', JSON.stringify(data))
  })
})
