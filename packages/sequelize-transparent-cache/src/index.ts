import { manualClassMethods, autoClassMethods } from "./methods/class"
import { instanceMethods } from "./methods/instance"
import { Model } from "sequelize/types"

export default client => ({
  // withCache (modelClass) {
  //   modelClass.cache = function (customId) {
  //     return customId
  //       ? manualClassMethods(client, this, customId)
  //       : autoClassMethods(client, this)
  //   }

  //   modelClass.prototype.cache = function () {
  //     return instanceMethods(client, this)
  //   }

  //   return modelClass
  // },
  staticCache<M extends typeof Model & { new (): M }>(this: M, customId?: string) {
    return customId
      ? manualClassMethods(client, this, customId)
      : autoClassMethods(client, this)
  },
  cache<M extends Model>(this: M) {
    return instanceMethods(client, this)
  }
})
