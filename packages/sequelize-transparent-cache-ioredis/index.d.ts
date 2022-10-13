declare module 'sequelize-transparent-cache-ioredis' {
  import { Redis } from 'ioredis'
  export interface IORedisAdaptorConstructor {
    client: Redis
    namespace?: string
    /** TTL */
    lifetime?: number
  }
  class IORedisAdaptor {
    client: Redis
    namespace?: string
    lifetime?: number
    constructor({ client, namespace, lifetime }: IORedisAdaptorConstructor)
  }

  export default IORedisAdaptor
}
