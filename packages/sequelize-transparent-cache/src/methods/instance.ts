
import { Model } from 'sequelize';
import * as cache from '../cache';

export function instanceMethods<M extends Model> (client: cache.Client, instance: M) {
  const proxiedMethods: Pick<M, 'save' | 'update' | 'reload' | 'destroy'> = {
    save () {
      return instance.save.apply(instance, arguments)
        .then(instance => cache.save(client, instance))
    },
    update () {
      return instance.update
        .apply(instance, arguments)
        .then(instance => cache.save(client, instance))
    },
    reload () {
      return instance.reload
        .apply(instance, arguments)
        .then(instance => cache.save(client, instance))
    },
    destroy () {
      return instance.destroy.apply(instance, arguments)
        .then(() => cache.destroy(client, instance))
    }
  }

  return {
    ...proxiedMethods,
    clear () {
      return cache.destroy(client, instance)
    },
    client () { return client },
  }
}
