class MemcachePlusAdaptor {
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
    const ttl = options && options.ttl != null ? options.ttl : this.lifetime
    return this.client.set(this._withNamespace(key), value, ttl)
  }

  get(key) {
    return this.client.get(this._withNamespace(key))
  }

  del(key) {
    return this.client.delete(this._withNamespace(key))
  }
}

module.exports = MemcachePlusAdaptor
