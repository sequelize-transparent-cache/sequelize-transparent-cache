module.exports = function (sequelize, DataTypes) {
  const Grand = sequelize.define(
    'Grand', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })
  return Grand
}