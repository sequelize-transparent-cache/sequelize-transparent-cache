const { stringify, parse } = require('./util')

function save (client, instance) {
  if (!instance) {
    return instance
  }

  const key = [
    instance.Model.name,
    instance.id
  ].join(':')

  return client.set(key, stringify(instance)).then(() => instance)
}

function get (client, model, id) {
  const key = [
    model.name,
    id
  ].join(':')

  return client.get(key).then(json => {
    return parse(model, json)
  })
}

function destroy (client, instance) {
  if (!instance) {
    return instance
  }

  const key = [
    instance.Model.name,
    instance.id
  ].join(':')

  return client.del(key)
}

module.exports = {
  save,
  get,
  destroy
}
