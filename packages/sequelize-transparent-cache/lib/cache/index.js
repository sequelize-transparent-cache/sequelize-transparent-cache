const { instanceToData, dataToInstance } = require('./util')

function save (client, instance) {
  if (!instance) {
    return instance
  }

  const key = [
    instance.Model.name,
    instance.id
  ]

  return client.set(key, instanceToData(instance)).then(() => instance)
}

function get (client, model, id) {
  const key = [
    model.name,
    id
  ]

  return client.get(key).then(data => {
    return dataToInstance(model, data)
  })
}

function destroy (client, instance) {
  if (!instance) {
    return instance
  }

  const key = [
    instance.Model.name,
    instance.id
  ]

  return client.del(key)
}

module.exports = {
  save,
  get,
  destroy
}
