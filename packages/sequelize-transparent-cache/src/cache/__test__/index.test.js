const { parseOptions } = require('..')

describe('parseOptions', () => {
  test('string customKey (legacy API)', () => {
    expect(parseOptions('myKey')).toEqual({ customKey: 'myKey', opts: undefined })
  })

  test('undefined', () => {
    expect(parseOptions(undefined)).toEqual({ customKey: undefined, opts: undefined })
  })

  test('null is treated as a key, not an object', () => {
    // guards against typeof null === 'object'
    expect(parseOptions(null)).toEqual({ customKey: null, opts: undefined })
  })

  test('object splits customKey from the rest', () => {
    expect(parseOptions({ customKey: 'myKey', ttl: 30 })).toEqual({
      customKey: 'myKey',
      opts: { ttl: 30 },
    })
  })

  test('object with only opts leaves customKey undefined', () => {
    expect(parseOptions({ ttl: 30 })).toEqual({ customKey: undefined, opts: { ttl: 30 } })
  })

  test('empty object', () => {
    expect(parseOptions({})).toEqual({ customKey: undefined, opts: {} })
  })
})
