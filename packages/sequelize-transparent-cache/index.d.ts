declare module 'sequelize-transparent-cache' {

  export interface CacheInterface<TModel> {
    client: () => TModel | null
    cache: (value: string | null | undefined) => TModel
    prototype: Record<string, any>
  }

  export type ModelWithCache<TModel> = TModel & CacheInterface<TModel>

  export type WithCache = <TModel>(modelClass: TModel) => ModelWithCache<TModel>

  interface GeneratorResult {
    withCache: WithCache
  }
  type Adaptor = any
  const sequelizeCache: <TAdaptor = Adaptor>(client: TAdaptor) => GeneratorResult

  export default sequelizeCache
}
