const { instanceToData, dataToInstance } = require('./util')

function getModelName (instance) {
  const version = instance.sequelize.Sequelize.version

  if (version.startsWith('4')) {
    return instance.constructor.name
  }

  return instance.Model.name
}

function save (client, instance) {
  if (!instance) {
    return instance
  }

  const key = [
    getModelName(instance),
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
    getModelName(instance),
    instance.id
  ]

  return client.del(key)
}

module.exports = {
  save,
  get,
  destroy
}
