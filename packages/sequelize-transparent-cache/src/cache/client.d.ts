import { Promise } from 'sequelize';

export interface Client {
  get(path: string[]): Promise<object>,
  set(path: string[], value: object): Promise<void>,
  del(path: string[]): Promise<void>
}