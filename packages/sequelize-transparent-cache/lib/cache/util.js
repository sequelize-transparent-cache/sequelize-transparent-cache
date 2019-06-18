function instanceToData (instance) {
  return instance.get({ plain: true })
}

function dataToInstance (model, data) {
  if (!data) {
    return data
  }
  let include = []

  if (model.associations) {
    include = loadAssociations(model)
  }

  const instance = model.build(data, { isNewRecord: false, include })

  if (data.updatedAt) {
    instance.setDataValue('updatedAt', data.updatedAt)
  }

  if (data.createdAt) {
    instance.setDataValue('createdAt', data.createdAt)
  }

  if (data.deletedAt) {
    instance.setDataValue('deletedAt', data.deletedAt)
  }

  return instance
}

function loadAssociations (model, depth = 1) {
  const associations = []
  if (Object.keys(model.associations).length > 0 && depth <= 5) {
    Object.keys(model.associations).forEach((key) => {
      const value = model.associations[key]
      let modelName
      if (model.sequelize.isDefined(value.target.name)) {
        modelName = value.target.name
      } else if (value.hasOwnProperty('options') && model.sequelize.isDefined(value.options.name.singular)) {
        modelName = value.options.name.singular
      } else if (value.hasOwnProperty('options') && model.sequelize.isDefined(value.options.as)) {
        modelName = value.options.as
      } else {
        return
      }
      const target = model.sequelize.model(modelName)
      // we have to do this to get scopes to work
      target._injectScope({})
      associations.push({
        model: target,
        as: value.associationAccessor,
        include: loadAssociations(target, depth + 1)
      })
    })
  }
  return associations
}

module.exports = {
  instanceToData,
  dataToInstance
}
