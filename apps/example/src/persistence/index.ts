import { Sequelize } from 'sequelize'
import { getSequelizeCache } from '@sequelize-transparent-cache/core'
import { IORedisAdaptor } from '@sequelize-transparent-cache/ioredis'

import { config } from './config'
import { RedisCache } from './cache'
import * as appModels from './models'

const redisAdaptor = new IORedisAdaptor({
  client: RedisCache,
  lifetime: 10_000,
})
const withCache = getSequelizeCache(redisAdaptor)

const database = new Sequelize(config)

export const models = {
  Author: withCache(appModels.author(database)),
  Book: withCache(appModels.book(database)),
}
