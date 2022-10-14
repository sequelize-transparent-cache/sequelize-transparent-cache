import { Sequelize, CreationOptional, InferAttributes, Model, DataTypes, ForeignKey } from 'sequelize'
import { Author } from './Author'

export const book = (sequelize: Sequelize) => {
  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      releaseDate: {
        type: DataTypes.DATE,
        field: 'release_date',
        allowNull: false,
      },
      authorId: {
        type: DataTypes.INTEGER,
        field: 'author_id',
        allowNull: false,
        references: {
          model: Author,
          key: 'id',
        },
      },
    },
    {
      name: {
        singular: 'book',
        plural: 'books',
      },
      tableName: 'book',
      sequelize,
      timestamps: false,
    },
  )

  return Book
}

export class Book extends Model<InferAttributes<Book>, InferAttributes<Book>> {
  declare id: CreationOptional<Buffer>
  static associate: () => void

  declare title: string
  declare releaseDate: Date
  declare authorId: ForeignKey<Author['id']>
}
