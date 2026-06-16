function instanceToData(instance) {
  return instance.get({ plain: true })
}

function dataToInstance(model, data) {
  if (!data) {
    return data
  }
  const include = generateIncludeFromData(model, data)
  const instance = model.build(data, { isNewRecord: false, raw: false, include })
  restoreTimestamps(data, instance)
  return instance
}

function restoreTimestamps(data, instance) {
  const timestampFields = ['createdAt', 'updatedAt', 'deletedAt']

  for (const field of timestampFields) {
    if (!(field in data)) continue
    const value = data[field]
    instance.setDataValue(field, value ? new Date(value) : null)
  }

  Object.keys(data).forEach((key) => {
    const value = data[key]

    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      try {
        const nestedInstances = instance.get(key)
        value.forEach((nestedValue, i) => restoreTimestamps(nestedValue, nestedInstances[i]))
      } catch (_error) {
        // TODO: Fix issue with JSON and BLOB columns
      }

      return
    }

    if (typeof value === 'object') {
      try {
        const nestedInstance = instance.get(key)
        Object.values(value).forEach((nestedValue) => restoreTimestamps(nestedValue, nestedInstance))
      } catch (_error) {
        // TODO: Fix issue with JSON and BLOB columns
      }
    }
  })
}

// Only include associations actually present in the cached payload, bounding the
// rebuilt include tree to what was queried rather than the whole model graph.
function generateIncludeFromData(model, data, depth = 1) {
  if (!data || depth > 5) {
    return []
  }
  const associations = model.associations || {}
  return Object.keys(associations)
    .filter((as) => data[as] != null)
    .map((as) => {
      const associatedModel = model.sequelize.model(associations[as].target.name)
      const sample = Array.isArray(data[as]) ? data[as][0] : data[as]
      return {
        model: associatedModel,
        as,
        include: generateIncludeFromData(associatedModel, sample, depth + 1),
      }
    })
}

module.exports = {
  instanceToData,
  dataToInstance,
  generateIncludeFromData,
}
