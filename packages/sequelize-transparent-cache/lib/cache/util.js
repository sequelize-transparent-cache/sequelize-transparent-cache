function stringify (instance) {
  return JSON.stringify(instance.get())
}

function parse (model, json) {
  if (!json) {
    return json
  }

  const data = JSON.parse(json)
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
  stringify,
  parse
}
