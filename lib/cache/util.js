function instanceToData (instance) {
  return instance.get({plain: true})
}

function dataToInstance (model, data) {
  if (!data) {
    return data
  }

  const instance = model.build(data, { isNewRecord: false })

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
