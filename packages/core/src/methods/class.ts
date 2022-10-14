import type { Model, ModelStatic, Identifier } from 'sequelize'

import { cache } from '../cache'
import { Adaptor } from '../types'

export function buildAutoMethods<TModel extends ModelStatic<Model<any, any>>>(client: Adaptor, model: TModel) {
  console.log('auto methods')
  return {
    client() {
      return client
    },
    async create() {
      const instance = await model.create.apply(model, arguments)
      const mode = await cache.save(client, instance)
      return mode
    },
    async findByPk(id: Identifier) {
      const instance = await cache.get(client, model, id)
      console.log('Instance:', instance)
      if (instance) {
        return instance
      }

      return (
        //@ts-expect-error FIXME
        (model.findByPk || model.findById).apply(model, arguments).then((instance) => cache.save(client, instance))
      )
    },
    findById() {
      return this.findByPk.apply(this, arguments)
    },
    async upsert(data: any) {
      const created = await model.upsert.apply(model, arguments)
      return cache.destroy(client, model.build(data)).then(() => created)
    },
    insertOrUpdate() {
      return this.upsert.apply(this, arguments)
    },
  }
}

export function buildManualMethods<TModel extends ModelStatic<Model<any, any>>>(
  client: Adaptor,
  model: TModel,
  customKey?: string,
) {
  console.log('manual methods')
  return {
    client() {
      return client
    },
    async findAll() {
      const instances = await cache.getAll(client, model, customKey)
      if (instances) {
        // any array - cache hit
        return instances
      }
      return model.findAll
        .apply(model, arguments)
        .then((instances_1) => cache.saveAll(client, model, instances_1, customKey))
    },
    async findOne() {
      const instance = await cache.get(client, model, customKey)
      if (instance) {
        return instance
      }

      return model.findOne.apply(model, arguments).then((instance) => cache.save(client, instance, customKey))
    },
    clear() {
      return cache.clearKey(client, model, customKey)
    },
  }
}
