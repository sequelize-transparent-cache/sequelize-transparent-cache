class MemcachePlusAdaptor {
  constructor ({ client, namespace, lifetime = 0 }) {
    this.client = client
    this.namespace = namespace
    this.lifetime = lifetime
  }

  _withNamespace (key) {
    const namespace = this.namespace
    const keyWithNamespace = namespace
      ? [namespace, ...key]
      : key

    return keyWithNamespace.join(':')
  }

  set (key, value) {
    return this.client.set(
      this._withNamespace(key),
      value,
      this.lifetime
    )
  }

  get (key) {
    return this.client.get(this._withNamespace(key))
  }

  del (key) {
    return this.client.delete(this._withNamespace(key))
  }
}

module.exports = MemcachePlusAdaptor
