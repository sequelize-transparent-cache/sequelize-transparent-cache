const { instanceToData, dataToInstance } = require('./util')

function getInstanceModel(instance) {
  return instance.constructor
}

function getInstanceCacheKey(instance) {
  return getInstanceModel(instance).primaryKeyAttributes.map(pk => instance[pk])
}

function save(client, instance, customKey) {
  if (!instance) {
    return instance
  }

  const key = [
    getInstanceModel(instance).name,
  ]

  if (customKey) {
    key.push(customKey)
  } else {
    key.push(...getInstanceCacheKey(instance))
  }

  return client.set(key, instanceToData(instance)).then(() => instance)
}

function saveAll(client, model, instances, customKey) {
  const key = [
    model.name,
    customKey
  ]

  return client.set(key, instances.map(instanceToData)).then(() => instances)
}

function getAll(client, model, customKey) {
  const key = [
    model.name,
    customKey
  ]

  return client.get(key).then(dataArray => {
    if (!dataArray) { // undefined - cache miss
      return dataArray
    }

    return dataArray.map(data => dataToInstance(model, data))
  })
}

function get(client, model, id) {
  const key = [
    model.name,
    id
  ]

  return client.get(key).then(data => {
    return dataToInstance(model, data)
  })
}

function destroy(client, instance) {
  if (!instance) {
    return instance
  }

  const key = [
    getInstanceModel(instance).name,
    ...getInstanceCacheKey(instance)
  ]
  return client.del(key)
}

function clearKey(client, model, customKey) {
  const key = [
    model.name,
    customKey
  ]
  return client.del(key)
}

module.exports = {
  save,
  saveAll,
  get,
  getAll,
  destroy,
  clearKey
}
