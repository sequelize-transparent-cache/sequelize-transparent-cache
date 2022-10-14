import type { Identifier, ModelStatic, Model } from 'sequelize'

interface TransparentCache<TModel extends Model<any, any>> {
  client: () => TModel | null
  cache: (customKey?: string | null) => ModelStatic<TModel>
  // TODO: Add cache here as .cache.findByPk
  // cache: ((customKey?: string | null) => ModelStatic<TModel>) & ModelStatic<TModel>
}

export type ModelWithCache<TModel extends Model<any, any>> = ModelStatic<TModel> & TransparentCache<TModel>

export type WithCache = <TModel extends Model<any, any>>(modelClass: TModel) => ModelWithCache<TModel>

export type Adaptor = {
  get: (key?: Identifier | Identifier[]) => Promise<any>
  set: (key: Identifier | Identifier[], value: unknown) => Promise<any>
  del: (key?: Identifier | Identifier[]) => Promise<any>
}
export type StaticModel = ModelStatic<Model<any, any>>
