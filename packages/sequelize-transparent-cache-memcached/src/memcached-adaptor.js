const hour = 60 * 60

class MemcachedAdaptor {
  constructor ({ client, namespace, lifetime = hour, errorHandler }) {
    this.client = client
    this.namespace = namespace
    this.lifetime = lifetime
    this.errorHandler = errorHandler
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
      const keyWithNamespace = this._withNamespace(key)

      try {
        this.client.set(
          keyWithNamespace,
          JSON.stringify(value),
          this.lifetime,
          error => error
            ? this._onError(error, resolve, reject, 'set', keyWithNamespace)
            : resolve()
        )
      } catch (error) {
        this._onError(error, resolve, reject, 'set', keyWithNamespace)
      }
    })
  }

  get (key) {
    return new Promise((resolve, reject) => {
      const keyWithNamespace = this._withNamespace(key)

      try {
        this.client.get(
          keyWithNamespace,
          (error, data) => {
            if (error) {
              this._onError(error, resolve, reject, 'get', keyWithNamespace)
              return
            }

            if (!data) {
              resolve(data)
              return
            }

            resolve(JSON.parse(data))
          }
        )
      } catch (error) {
        this._onError(error, resolve, reject, 'get', keyWithNamespace)
      }
    })
  }

  del (key) {
    return new Promise((resolve, reject) => {
      const keyWithNamespace = this._withNamespace(key)

      try {
        this.client.del(
          keyWithNamespace,
          error => error
            ? this._onError(error, resolve, reject, 'del', keyWithNamespace)
            : resolve()
        )
      } catch (error) {
        this._onError(error, resolve, reject, 'del', keyWithNamespace)
      }
    })
  }

  _onError (error, resolve, reject, operation, key) {
    if (this.errorHandler) {
      resolve(this.errorHandler(error, operation, key))
    } else {
      reject(error)
    }
  }
}

module.exports = MemcachedAdaptor
