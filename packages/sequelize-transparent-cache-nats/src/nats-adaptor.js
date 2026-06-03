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
    if (ttl) {
      // in this context this is `Bucket.create()` which takes 3 arguments, the latter being
      // the per-Key TTL specified as a string duration. It is miss named in the signature as
      // `markerTTL?`, however when it is passed to the `_put()` method is it used to populate
      // the header `MessageTTL`.
      return this.client.create(this._withNamespace(key), JSON.stringify(value), ttl).catch((error) => {
        // This is to catch the possibility that the key may present.
        // In a distributed system another cache instance could have populated
        // the key in between the current cache instance checking for the presence and
        // running the query to retrieve the data.
        const re = /^wrong last sequence.*$/
        if (error.name === 'JetStreamApiError' && re.exec(error.message)) {
          return
        }
        throw error
      })
    } else {
      return this.client.put(this._withNamespace(key), JSON.stringify(value))
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
