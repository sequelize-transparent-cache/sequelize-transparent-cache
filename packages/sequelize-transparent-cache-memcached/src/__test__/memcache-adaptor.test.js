const Memcached = require('memcached')
const MemcacheAdaptor = require('..')

describe('No error handler', () => {
  const memcached = new Memcached()
  const memcachedAdaptor = new MemcacheAdaptor({
    client: memcached,
    namespace: 'model',
    lifetime: 60 * 60
  })

  describe('Adaptor methods', () => {
    const data = { test: 1 }
    const key = ['complex', 'key']

    test('set', async () => {
      expect(await memcachedAdaptor.set(key, data)).toEqual(undefined)
    })

    test('get', async () => {
      expect(await memcachedAdaptor.get(['missing'])).toBeUndefined()
      expect(await memcachedAdaptor.get(key)).toEqual(data)
    })

    test('del', async () => {
      await memcachedAdaptor.del(key)

      expect(await memcachedAdaptor.get(key)).toBeUndefined()
    })
  })
})

describe('With error handler', () => {
  describe('Adaptor methods', () => {
    const data = { test: 1 }
    const key = ['complex', 'key']
    const mockedMemcached = {
      set (key, value, lifetime, callback) {
        setImmediate(() => callback(new Error('mock set error')))
      },
      get (key, callback) {
        setImmediate(() => callback(new Error('mock get error')))
      },
      del (key, callback) {
        setImmediate(() => callback(new Error('mock del error')))
      }
    }
    const noData = 'no-data-stub'
    let memcachedAdaptor

    beforeEach(() => {
      memcachedAdaptor = new MemcacheAdaptor({
        client: mockedMemcached,
        namespace: 'model',
        lifetime: 60 * 60,
        errorHandler: jest.fn().mockReturnValue(noData)
      })
    })

    test('set', async () => {
      expect(await memcachedAdaptor.set(key, data)).toEqual(noData)
      expect(memcachedAdaptor.errorHandler.mock.calls.length).toEqual(1)
      expect(memcachedAdaptor.errorHandler.mock.calls[0][0]).toBeDefined()
      expect(memcachedAdaptor.errorHandler.mock.calls[0][1]).toBe('set')
      expect(memcachedAdaptor.errorHandler.mock.calls[0][2]).toBe('model:complex:key')
    })

    test('get', async () => {
      expect(await memcachedAdaptor.get(key)).toEqual(noData)
      expect(memcachedAdaptor.errorHandler.mock.calls.length).toEqual(1)
      expect(memcachedAdaptor.errorHandler.mock.calls[0][0]).toBeDefined()
      expect(memcachedAdaptor.errorHandler.mock.calls[0][1]).toBe('get')
      expect(memcachedAdaptor.errorHandler.mock.calls[0][2]).toBe('model:complex:key')
    })

    test('del', async () => {
      expect(await memcachedAdaptor.del(key)).toEqual(noData)

      expect(memcachedAdaptor.errorHandler.mock.calls.length).toEqual(1)
      expect(memcachedAdaptor.errorHandler.mock.calls[0][0]).toBeDefined()
      expect(memcachedAdaptor.errorHandler.mock.calls[0][1]).toBe('del')
      expect(memcachedAdaptor.errorHandler.mock.calls[0][2]).toBe('model:complex:key')
    })
  })
})
