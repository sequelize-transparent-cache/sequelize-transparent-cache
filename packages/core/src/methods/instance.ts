import type { Model, ModelStatic } from 'sequelize'

import { cache } from '../cache'
import { Adaptor } from '../types'

export function instanceMethods<TModel extends Model<any, any>>(client: Adaptor, instance: TModel) {
  return {
    client() {
      return client
    },
    async save() {
      const _instance = await instance.save.apply(instance, arguments)
      cache.save(client, _instance)
    },
    async update() {
      const _instance = await instance.update.apply(instance, arguments)
      cache.save(client, _instance)
    },
    async reload() {
      const _instance = await instance.reload.apply(instance, arguments)
      cache.save(client, _instance)
    },
    async destroy() {
      await instance.destroy.apply(instance, arguments)
      cache.destroy(client, instance)
    },
    clear() {
      return cache.destroy(client, instance)
    },
  }
}
