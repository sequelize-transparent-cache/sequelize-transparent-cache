const { instanceToData, dataToInstance } = require('./util')

function getInstanceModel(instance) {
  return instance.constructor
}

function getInstanceCacheKey(instance) {
  return getInstanceModel(instance).primaryKeyAttributes.map((pk) => instance[pk])
}

function parseOptions(options) {
  if (options !== null && typeof options === 'object') {
    const { customKey, ...opts } = options
    return { customKey, opts }
  }
  return { customKey: options, opts: undefined }
}

async function save(client, instance, options) {
  if (!instance) {
    return Promise.resolve(instance)
  }

  const { customKey, opts } = parseOptions(options)

  const key = [getInstanceModel(instance).name]

  if (customKey) {
    key.push(customKey)
  } else {
    key.push(...getInstanceCacheKey(instance))
  }

  return client.set(key, instanceToData(instance), opts).then(() => instance)
}

function saveAll(client, model, instances, options) {
  const { customKey, opts } = parseOptions(options)
  const key = [model.name, customKey]

  return client.set(key, instances.map(instanceToData), opts).then(() => instances)
}

function getAll(client, model, options) {
  const { customKey } = parseOptions(options)

  const key = [model.name, customKey]

  return client.get(key).then((dataArray) => {
    if (!dataArray) {
      // undefined - cache miss
      return dataArray
    }
    return dataArray.map((data) => dataToInstance(model, data))
  })
}

function get(client, model, options) {
  const { customKey } = parseOptions(options)
  const key = [model.name, customKey]

  return client.get(key).then((data) => {
    return dataToInstance(model, data)
  })
}

function destroy(client, instance) {
  if (!instance) {
    return Promise.resolve(instance)
  }

  const key = [getInstanceModel(instance).name, ...getInstanceCacheKey(instance)]
  return client.del(key)
}

function clearKey(client, model, options) {
  const { customKey } = parseOptions(options)
  const key = [model.name, customKey]
  return client.del(key)
}

module.exports = {
  save,
  saveAll,
  get,
  getAll,
  destroy,
  clearKey,
}
