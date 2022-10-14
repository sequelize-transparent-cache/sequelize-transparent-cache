import type { Model } from 'sequelize'

import type { StaticModel } from '../types'

export function instanceToData(instance: Model<any, any>) {
  return instance.get({ plain: true })
}

export function dataToInstance<TData extends Omit<any, string>>(model: StaticModel, data: TData) {
  if (!data) {
    return data
  }
  const include = generateIncludeRecurse(model)
  const instance = model.build(data, { isNewRecord: false, raw: false, include })
  restoreTimestamps(data, instance)
  return instance
}

function restoreTimestamps<TData extends Record<string, string | number | Date>>(
  data: TData,
  instance: Model<any, any>,
) {
  const timestampFields = ['createdAt', 'updatedAt', 'deletedAt']

  for (const field of timestampFields) {
    const value = data[field]
    if (value) {
      instance.setDataValue(field, new Date(value))
    }
  }

  Object.keys(data).forEach((key) => {
    const value = data[key]

    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      try {
        const nestedInstances = instance.get(key) as Model<any, any>[]
        value.forEach((nestedValue, i) => restoreTimestamps(nestedValue, nestedInstances[i]))
      } catch (error) {
        // TODO: Fix issue with JSON and BLOB columns
      }

      return
    }

    if (typeof value === 'object') {
      try {
        const nestedInstance = instance.get(key) as Model<any, any>
        Object.values(value).forEach((nestedValue) => restoreTimestamps(nestedValue, nestedInstance))
      } catch (error) {
        // TODO: Fix issue with JSON and BLOB columns
      }
    }
  })
}

function generateIncludeRecurse(model: typeof Model<any, any>, depth = 1): any[] {
  if (depth > 5) {
    return []
  }
  return Object.entries(model.associations || [])
    .filter(([as, association]) => {
      const hasOptions: boolean = Object.prototype.hasOwnProperty.call(association, 'options')
      return hasOptions
    })
    .map(([as, association]) => {
      const associatedModel = model.sequelize?.model(association.target.name)
      if (!associatedModel) throw new Error('Cannot find model')
      return {
        model: associatedModel,
        include: generateIncludeRecurse(associatedModel, depth + 1),
        as,
      }
    })
}
