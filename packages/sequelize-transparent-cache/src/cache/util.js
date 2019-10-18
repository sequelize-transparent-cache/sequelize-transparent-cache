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

  const instance = model.build(data, { isNewRecord: false, raw: true, include })
  return instance
}

function loadAssociations (model) {
  const associations = []

  Object.keys(model.associations).forEach((key) => {
    //  model.associations[key] does not work on include, we grab it from sequelize.model()
    if (model.associations[key].hasOwnProperty('options')) {
      const modelName = model.associations[key].target.name
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
