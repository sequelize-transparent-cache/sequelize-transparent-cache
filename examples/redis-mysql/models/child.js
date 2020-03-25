module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentId: DataTypes.INTEGER
  })
  User.associate = (Parent) => {
    User.belongsTo(Parent, { foreignKey: 'parentId' })
  }
  return User
}
