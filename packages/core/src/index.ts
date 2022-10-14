import type { Model, ModelStatic } from 'sequelize'

import { buildAutoMethods, buildManualMethods } from './methods/class'
import { instanceMethods } from './methods/instance'
import { Adaptor, ModelWithCache } from './types'

export const getSequelizeCache =
  (client: Adaptor) =>
  <TModel extends Model<any, any>>(model: ModelStatic<TModel>) => {
    ;(model as any).cache = function (customId?: string) {
      return customId
        ? buildManualMethods<ModelStatic<TModel>>(client, model, customId)
        : buildAutoMethods<ModelStatic<TModel>>(client, model)
    }
    model.prototype.cache = function () {
      return instanceMethods(client, model as unknown as TModel)
    }

    return model as unknown as ModelWithCache<TModel>
  }

export * from './types'
