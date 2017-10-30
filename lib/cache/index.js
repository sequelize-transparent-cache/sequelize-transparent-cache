const { instanceToData, dataToInstance } = require('./util')

function getInstanceModel (instance) {
  const version = instance.sequelize.Sequelize.version

  /* istanbul ignore next: covered, but depends on installed sequelize version */
  return version.startsWith('4')
    ? instance.constructor
    : instance.Model
}

function getModelPrimaryKeys (instance) {
  return getInstanceModel(instance).describe().then(
    (schema) => {
      return Object.keys(schema).filter(function (field) {
        return schema[field].primaryKey
      })
    }
  ).then(
    (keys) => keys.map((k) => instance[k])
  )
}

function save (client, instance) {
  if (!instance) {
    return instance
  }
  return getModelPrimaryKeys(instance).then(
    (keys) => {
      const key = [
        getInstanceModel(instance).name,
        ...keys
      ]
      return client.set(key, instanceToData(instance)).then(() => instance)
    }
  )
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

  return getModelPrimaryKeys(instance).then(
    (keys) => {
      const key = [
        getInstanceModel(instance).name,
        keys
      ]
      return client.del(key)
    }
  )
}

module.exports = {
  save,
  get,
  destroy
}
