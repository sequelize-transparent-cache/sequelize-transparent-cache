import { Model } from "sequelize"
import { instanceToData, dataToInstance } from "./util"
import { Client } from './client';
import { Promise } from 'sequelize';

export { Client } from './client';

function getInstanceModel<M extends typeof Model> (instance: Model): M {
  return instance.constructor as M
}

function getInstanceCacheKey<M extends Model> (instance: M) {
  return getInstanceModel(instance).primaryKeyAttributes.map(pk => instance[pk])
}

export function save (client: Client, instance: Model, customKey?: string) {
  if (!instance) {
    return Promise.resolve(instance)
  }

  const key = [
    getInstanceModel(instance).name
  ]

  if (customKey) {
    key.push(customKey)
  } else {
    key.push(...getInstanceCacheKey(instance))
  }

  return client.set(key, instanceToData(instance)).then(() => instance)
}

export function saveAll (client: Client, model: typeof Model, instances: Model[], customKey: string) {
  const key = [
    model.name,
    customKey
  ]

  return client.set(key, instances.map(instanceToData)).then(() => instances)
}

export function getAll<M extends typeof Model & { new (): M }> (client: Client, model: M, customKey: string) {
  const key = [
    model.name,
    customKey
  ]

  return client.get(key).then((dataArray: object[]) => {
    if (!dataArray) { // undefined - cache miss
      return dataArray
    }

    return dataArray.map(data => dataToInstance(model, data))
  })
}

export function get<M extends typeof Model & { new (): M }> (client: Client, model: M, id: string) {
  const key = [
    model.name,
    id
  ]

  return client.get(key).then(data => {
    return dataToInstance(model, data)
  })
}

export function destroy (client, instance) {
  if (!instance) {
    return Promise.resolve(instance)
  }

  const key = [
    getInstanceModel(instance).name,
    ...getInstanceCacheKey(instance)
  ]
  return client.del(key)
}

export function clearKey (client: Client, model: typeof Model, customKey: string) {
  const key = [
    model.name,
    customKey
  ]
  return client.del(key)
}