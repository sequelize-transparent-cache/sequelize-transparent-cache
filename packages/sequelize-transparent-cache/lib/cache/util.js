function instanceToData (instance) {
  return instance.get({ plain: true })
}

function dataToInstance (model, data) {
  if (!data) {
    return data
  }
  let include = []
  if (model.associations) {
    Object.keys(model.associations).forEach((key) => {
      const association = {}
      //  model.associations[key] does not work on include, we grab it from sequelize.model()
      if (model.associations[key].hasOwnProperty('options')) {
        let modelName = model.associations[key].options.name.singular
        association.model = model.sequelize.model(modelName)
        association.as = key
      }
      include.push(association)
    })
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

module.exports = {
  instanceToData,
  dataToInstance
}
