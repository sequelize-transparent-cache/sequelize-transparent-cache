import { ioredis } from '../src/lib/ioredis'

describe('ioredis', () => {
  it('should work', () => {
    expect(ioredis()).toEqual('ioredis')
  })
})
