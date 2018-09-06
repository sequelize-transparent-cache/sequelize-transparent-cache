class VariableAdaptor {
  constructor (store = {}) {
    this.store = store
  }

  _ensureModel (model) {
    if (!this.store[model]) {
      this.store[model] = {}
    }
  }

  set ([model, ...ids], value) {
    this._ensureModel(model)

    this.store[model][ids.join()] = value
    return Promise.resolve()
  }

  get ([model, ...ids]) {
    this._ensureModel(model)

    return Promise.resolve(this.store[model][ids.join()])
  }

  del ([model, ...ids]) {
    this._ensureModel(model)

    delete this.store[model][ids.join()]
    Promise.resolve()
  }
}

module.exports = VariableAdaptor
