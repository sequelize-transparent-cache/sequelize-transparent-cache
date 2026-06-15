const cache = require('..')

describe('parseOptions', () => {
  test('string customKey (legacy API)', () => {
    expect(cache.parseOptions('myKey')).toEqual({ customKey: 'myKey', opts: undefined })
  })

  test('undefined', () => {
    expect(cache.parseOptions(undefined)).toEqual({ customKey: undefined, opts: undefined })
  })

  test('null is treated as a key, not an object', () => {
    // guards against typeof null === 'object'
    expect(cache.parseOptions(null)).toEqual({ customKey: null, opts: undefined })
  })

  test('object splits customKey from the rest', () => {
    expect(cache.parseOptions({ customKey: 'myKey', ttl: 30 })).toEqual({
      customKey: 'myKey',
      opts: { ttl: 30 },
    })
  })

  test('object with only opts leaves customKey undefined', () => {
    expect(cache.parseOptions({ ttl: 30 })).toEqual({ customKey: undefined, opts: { ttl: 30 } })
  })

  test('empty object', () => {
    expect(cache.parseOptions({})).toEqual({ customKey: undefined, opts: {} })
  })
})

describe('Options flow', () => {
  test('saveAll passes opts (ttl) through, stripped of customKey', async () => {
    const set = jest.fn().mockResolvedValue()
    const client = { set }

    await cache.saveAll(client, { name: 'User' }, [], { customKey: 'active', ttl: 60 })

    expect(set).toHaveBeenCalledWith(['User', 'active'], [], { ttl: 60 })
  })

  test('legacy string key passes no opts', async () => {
    const set = jest.fn().mockResolvedValue()
    await cache.saveAll({ set }, { name: 'User' }, [], 'active')
    expect(set).toHaveBeenCalledWith(['User', 'active'], [], undefined)
  })
})
