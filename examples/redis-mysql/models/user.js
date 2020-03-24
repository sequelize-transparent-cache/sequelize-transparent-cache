module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })
  User.associate = (Parent) => {
    User.hasOne(Parent, {foreignKey: 'userId'})
  }
  return User
}
