class VariableAdaptor {
  constructor (store = {}) {
    this.store = store
  }

  _ensureModel (model) {
    if (!this.store[model]) {
      this.store[model] = {}
    }
  }

  set ([model, id], value) {
    this._ensureModel(model)

    this.store[model][id] = value
    return Promise.resolve()
  }

  get ([model, id]) {
    this._ensureModel(model)

    return Promise.resolve(this.store[model][id])
  }

  del ([model, id]) {
    this._ensureModel(model)

    delete this.store[model][id]
    Promise.resolve()
  }
}

module.exports = VariableAdaptor
