const { instanceToData, dataToInstance } = require('./util')

function getInstanceModel (instance) {
  const version = instance.sequelize.Sequelize.version

  /* istanbul ignore next: covered, but depends on installed sequelize version */
  return version.startsWith('4')
    ? instance.constructor
    : instance.Model
}

function getModelCacheKeys (instance) {
  return getInstanceModel(instance).primaryKeyAttributes.map((k) => instance[k])
}

function save (client, instance) {
  if (!instance) {
    return instance
  }
  const key = [
    getInstanceModel(instance).name,
    ...getModelCacheKeys(instance)
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
    getInstanceModel(instance).name,
    ...getModelCacheKeys(instance)
  ]
  return client.del(key)
}

module.exports = {
  save,
  get,
  destroy
}
