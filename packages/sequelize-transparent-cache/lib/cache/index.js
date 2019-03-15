const { instanceToData, dataToInstance } = require('./util')

function getInstanceModel (instance) {
  const version = instance.sequelize.Sequelize.version

  /* istanbul ignore next: covered, but depends on installed sequelize version */
  return version.startsWith('4')
    ? instance.constructor
    : instance.Model
}

function getInstanceCacheKey (instance) {
  return getInstanceModel(instance).primaryKeyAttributes.map(pk => instance[pk])
}

function save (client, instance, customId) {
  if (!instance) {
    return instance
  }
  let key = [getInstanceModel(instance).name]
  if (customId !== undefined) {
    key.push(
      customId
    )
  } else {
    key.push(
      ...getInstanceCacheKey(instance)
    )
  }
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
    ...getInstanceCacheKey(instance)
  ]
  return client.del(key)
}

function clearKey (client, model, customKey) {
  const key = [
    model.name,
    customKey
  ]
  return client.del(key)
}

module.exports = {
  save,
  get,
  destroy,
  clearKey
}
