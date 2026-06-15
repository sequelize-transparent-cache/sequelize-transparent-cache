class IORedisAdaptor {
  constructor({ client, namespace, lifetime = 0 }) {
    this.client = client
    this.namespace = namespace
    this.lifetime = lifetime
  }

  _withNamespace(key) {
    const namespace = this.namespace
    const keyWithNamespace = namespace ? [namespace, ...key] : key

    return keyWithNamespace.join(':')
  }

  set(key, value, options) {
    const ttl = options && options.ttl > 0 ? options.ttl : this.lifetime
    const opts = ttl > 0 ? ['EX', ttl] : []

    return this.client.set(this._withNamespace(key), JSON.stringify(value), opts)
  }

  get(key) {
    return this.client.get(this._withNamespace(key)).then((data) => {
      if (!data) {
        return data
      }

      return JSON.parse(data, (key, value) => {
        return value && value.type === 'Buffer' ? Buffer.from(value.data) : value
      })
    })
  }

  del(key) {
    return this.client.del(this._withNamespace(key))
  }
}

module.exports = IORedisAdaptor
