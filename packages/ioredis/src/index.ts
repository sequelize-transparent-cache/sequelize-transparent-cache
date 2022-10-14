import type { Redis } from 'ioredis'
import type { Adaptor } from '@sequelize-transparent-cache/core'
import type { Model } from 'sequelize'

export class IORedisAdaptor {
  client: Redis
  lifetime: number
  namespace?: string

  constructor({ client, namespace, lifetime }: { client: Redis; lifetime: number; namespace?: string }) {
    this.client = client
    this.namespace = namespace
    this.lifetime = lifetime
  }

  // TODO: Doesn't support Buffers
  _withNamespace(key: string[]) {
    console.log('_withNamespace')
    const namespace = this.namespace
    const keyWithNamespace = namespace ? [namespace, ...key] : key

    return keyWithNamespace.join(':')
  }

  set(key: string[], value: unknown) {
    console.log('IORedis set', value)
    const options = this.lifetime ? ['EX', this.lifetime] : []

    // @ts-expect-error FIXME options is wrong
    return this.client.set(this._withNamespace(key), JSON.stringify(value), options)
  }

  async get(key: string[]) {
    console.log('IORedis key', key)
    const data = await this.client.get(this._withNamespace(key))
    console.log('IORedis data', data)
    if (!data) {
      return data
    }

    return JSON.parse(data, (_, value) => {
      return value && value.type === 'Buffer' ? Buffer.from(value.data) : value
    })
  }

  del(key: string[]) {
    return this.client.del(this._withNamespace(key))
  }
}

export default IORedisAdaptor
