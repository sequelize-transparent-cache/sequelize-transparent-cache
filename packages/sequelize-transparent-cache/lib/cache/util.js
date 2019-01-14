function instanceToData(instance) {
  return instance.get({ plain: true })
}

function dataToInstance(model, data) {
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

function loadAssociations(model) {
  let associations = []
  Object.keys(model.associations).forEach((key) => {
    //  model.associations[key] does not work on include, we grab it from sequelize.model()
    if (model.associations[key].hasOwnProperty('options')) {
      const modelName = model.associations[key].options.name.singular
      associations.push({
        model: model.sequelize.model(modelName),
        as: key
      })
    }
  })
  return associations
}

module.exports = {
  instanceToData,
  dataToInstance
}
