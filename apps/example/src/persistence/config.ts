import type { Options } from 'sequelize'

export const config: Options = {
  username: 'root',
  password: '',
  database: 'sequelize_transparent_cache',
  host: '127.0.0.1',
  port: 3310,
  dialect: 'mysql',
  logging: false,
  logQueryParameters: false,
  dialectOptions: {
    decimalNumbers: true,
  },
}
