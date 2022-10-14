import { Sequelize, CreationOptional, InferAttributes, Model, DataTypes } from 'sequelize'

export const author = (sequelize: Sequelize) => {
  Author.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name',
        allowNull: false,
      },
    },
    {
      name: {
        singular: 'author',
        plural: 'authors',
      },
      tableName: 'author',
      sequelize,
      timestamps: false,
    },
  )

  return Author
}

export class Author extends Model<InferAttributes<Author>, InferAttributes<Author>> {
  declare id: CreationOptional<Buffer>
  static associate: () => void

  declare firstName: string
  declare lastName: string
}
