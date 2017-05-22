const hour = 60 * 60

class MemcachedAdaptor {
  constructor ({ client, namespace, lifetime = hour }) {
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
    return new Promise((resolve, reject) => {
      this.client.set(
        this._withNamespace(key),
        JSON.stringify(value),
        this.lifetime,
        error => error ? reject(error) : resolve()
      )
    })
  }

  get (key) {
    return new Promise((resolve, reject) => {
      this.client.get(
        this._withNamespace(key),
        (error, data) => {
          if (error) {
            return reject(error)
          }

          if (!data) {
            return resolve(data)
          }

          resolve(JSON.parse(data))
        }
      )
    })
  }

  del (key) {
    return new Promise((resolve, reject) => {
      this.client.del(
        this._withNamespace(key),
        error => error ? reject(error) : resolve()
      )
    })
  }
}

module.exports = MemcachedAdaptor
