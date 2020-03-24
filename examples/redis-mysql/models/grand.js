module.exports = function (sequelize, DataTypes) {
  const Grand = sequelize.define(
    'Grand', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })

  Grand.associate = (Parent) => {
    Grand.belongsTo(Parent, { foreignKey: 'parentId' })
  }
  return Grand
}