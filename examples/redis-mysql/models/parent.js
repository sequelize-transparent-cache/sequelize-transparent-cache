module.exports = function (sequelize, DataTypes) {
  const Parent = sequelize.define('Parent', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  Parent.associate = (User, Grand) => {
    Parent.hasMany(User, { foreignKey: 'parentId' })
    Parent.hasOne(Grand, { foreignKey: 'parentId' })
  }
  return Parent
}
