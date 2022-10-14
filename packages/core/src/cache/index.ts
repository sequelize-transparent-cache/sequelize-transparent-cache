import type { Model, Identifier } from 'sequelize'

import { StaticModel, Adaptor } from '../types'
import { instanceToData, dataToInstance } from './util'

function getInstanceModel(instance: Model<any, any>) {
  return instance.constructor
}

function getInstanceCacheKey(instance: Model<any, any>) {
  // @ts-expect-error FIXME
  return instance.constructor.primaryKeyAttributes.map((pk) => instance[pk])
}

async function save<TModel extends StaticModel>(client: Adaptor, instance: Model<any, any> | null, customKey?: string) {
  console.log('instance', instance)
  if (!instance) {
    return Promise.resolve(instance)
  }

  const key = [getInstanceModel(instance).name]
  console.log('key', key)

  if (customKey) {
    key.push(customKey)
  } else {
    key.push(...getInstanceCacheKey(instance))
  }

  return client.set(key, instanceToData(instance)).then(() => instance)
}

function saveAll<TModel extends StaticModel>(
  client: Adaptor,
  model: TModel,
  instances: Model<any, any>[],
  customKey?: string,
) {
  const key = [model.name]
  if (customKey) key.push(customKey)

  return client.set(key, instances.map(instanceToData)).then(() => instances)
}

async function getAll<TModel extends StaticModel>(client: Adaptor, model: TModel, customKey?: string) {
  const key = [model.name]
  if (customKey) key.push(customKey)

  const dataArray = await client.get(key)
  if (Array.isArray(dataArray)) {
    return dataArray.map((data) => dataToInstance(model, data))
  }
  return dataArray
}

async function get<TModel extends StaticModel>(client: Adaptor, model: TModel, id?: Identifier) {
  const key: Identifier[] = [model.name]
  if (id) key.push(id)

  const data = await client.get(key)
  return dataToInstance(model, data)
}

function destroy<TModel extends StaticModel>(client: Adaptor, instance: Model<any, any>) {
  if (!instance) {
    return Promise.resolve(instance)
  }

  const key = [getInstanceModel(instance).name, ...getInstanceCacheKey(instance)]
  return client.del(key)
}

function clearKey<TModel extends StaticModel>(client: Adaptor, model: TModel, customKey?: string) {
  const key = [model.name]
  if (customKey) key.push(customKey)
  return client.del(key)
}

export const cache = {
  save,
  saveAll,
  get,
  getAll,
  destroy,
  clearKey,
}
