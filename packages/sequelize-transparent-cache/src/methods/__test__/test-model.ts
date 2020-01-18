import sequelizeCache from '../..'
import { Sequelize, Options, DataTypes, Model } from 'sequelize';
const VariableAdaptor = require('../../../../sequelize-transparent-cache-variable')

const variableAdaptor = new VariableAdaptor()
const { staticCache, cache } = sequelizeCache(variableAdaptor)

const options: Options = {
  logging: false,
  dialect: 'sqlite',
  define: {
    paranoid: true
  }
}

export const sequelize = new Sequelize(options)

export class User extends Model {
  public id: number;
  public name: string;

  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  public cache = cache;
  public static cache = staticCache;
}

User.init({
  name: {
    allowNull: false,
    type: DataTypes.STRING
  }
}, { sequelize })

export class Group extends Model {
  public id: number;
  public name: string;

  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  public cache = cache;
  public static cache = staticCache;
}

Group.init({
  name: {
    allowNull: false,
    type: DataTypes.STRING
  }
}, { sequelize })

export class UserGroup extends Model {
  public userId: number;
  public groupId: number;

  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  public cache = cache;
  public static cache = staticCache;
}

UserGroup.init({
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  groupId: {
    allowNull: false,
    type: DataTypes.INTEGER
  }
}, { sequelize })

export class Article extends Model {
  public uuid: string;
  public title: string;

  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  public cache = cache;
  public static cache = staticCache;
}

Article.init({
  uuid: {
    allowNull: false,
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    allowNull: false,
    type: DataTypes.STRING
  }
}, { sequelize })

export class Comment extends Model {
  public userId: number;
  public articleUuid: string;

  public body: string;

  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  public cache = cache;
  public static cache = staticCache;
}

Comment.init({
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  articleUuid: {
    allowNull: false,
    type: DataTypes.STRING,
    primaryKey: true
  },
  body: {
    allowNull: false,
    type: DataTypes.STRING
  }
}, { sequelize })


sequelize.model('User').hasMany(sequelize.model('Article'), { as: 'Articles' })
sequelize.model('Article').belongsTo(sequelize.model('User'), { as: 'Author' })
sequelize.model('User').belongsToMany(sequelize.model('Group'), {
  through: {
    model: sequelize.model('UserGroup'),
    unique: false
  },
  foreignKey: 'userId',
  as: 'userGroups'
})
sequelize.model('Group').belongsToMany(sequelize.model('User'), {
  through: {
    model: sequelize.model('UserGroup'),
    unique: false
  },
  foreignKey: 'groupId',
  as: 'groupUsers'
})
