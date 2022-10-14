import Redis from 'ioredis'

export const REDISHOST = process.env.REDISHOST || '127.0.0.1'
export const REDISPORT = process.env.REDISPORT || 6379

export const RedisCache = process.env.APOLLO_CHECK ? ({} as Redis) : new Redis(Number(REDISPORT), REDISHOST)
