const hour = 60 * 60

class MemcachedAdaptor {
  constructor ({ client, namespace, lifetime = hour }) {
    this.client = client
    this.namespace = namespace
    this.lifetime = lifetime
  }

  _withNamespace (key) {
    const namespace = this.namespace

    return namespace
      ? `${namespace}:${key}`
      : key
  }

  set (key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(
        this._withNamespace(key),
        value,
        this.lifetime,
        error => error ? reject(error) : resolve()
      )
    })
  }

  get (key) {
    return new Promise((resolve, reject) => {
      this.client.get(
        this._withNamespace(key),
        (error, data) => error ? reject(error) : resolve(data)
      )
    })
  }

  del (key) {
    return new Promise((resolve, reject) => {
      this.client.del(
        this._withNamespace(key),
        error => error ? reject(error) : resolve(error)
      )
    })
  }
}

module.exports = MemcachedAdaptor
