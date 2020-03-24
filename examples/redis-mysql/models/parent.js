module.exports = function (sequelize, DataTypes) {
  const Parent = sequelize.define('Parent', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  Parent.associate = (User, Grand) => {
    Parent.belongsTo(User, {foreignKey: 'userId' })
    Parent.hasOne(Grand, {foreignKey: 'parentId' })
}
  return Parent
}