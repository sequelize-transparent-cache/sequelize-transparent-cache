class NatsAdaptor {
  constructor({ client, namespace }) {
    this.client = client // A NATS kv client
    this.namespace = namespace
  }

  _withNamespace(key) {
    const namespace = this.namespace
    const keyWithNamespace = namespace ? [namespace, ...key] : key

    return keyWithNamespace.join('.')
  }

  set(key, value, ttl = undefined) {
    try {
      if (ttl) {
        return this.client.create(this._withNamespace(key), JSON.stringify(value), ttl)
      } else {
        return this.client.put(this._withNamespace(key), JSON.stringify(value))
      }
    } catch (error) {
      console.error('adaptor: ', error)
    }
  }

  get(key) {
    return this.client.get(this._withNamespace(key)).then((data) => {
      if (!data) return data
      if (data.operation === 'PURGE' || data.operation === 'DEL') return null
      return data.json()
    })
  }

  del(key) {
    return this.client.purge(this._withNamespace(key))
  }
}

module.exports = NatsAdaptor
