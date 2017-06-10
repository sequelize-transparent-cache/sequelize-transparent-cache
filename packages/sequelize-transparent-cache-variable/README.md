# sequelize-transparent-cache-variable

Variable adaptor for [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache).

Stores sequelize objects in variable. Useful for debugging purposes.

**Warning**: Do not use this adaptor in production, unless you know what you doing.

## Example usage

```javascript
const VariableAdaptor = require('sequelize-transparent-cache-variable')
const variableAdaptor = new VariableAdaptor({
  store: {} // optional
})

const sequelizeCache = require('sequelize-transparent-cache')
const {classMethods, instanceMethods} = sequelizeCache(variableAdaptor)

const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  port: 3306,
  define: {
    classMethods,
    instanceMethods
  }
})
```

## Constructor arguments

| Param   | Type   | Required | Description                         |
|---------|--------|----------|-------------------------------------|
| `store` | object | no       | Object to store sequelize instances |

## Storing format
Each object stored as is, keyed by id.

```javascript
{
  modelName: {
    objectId: {...}
  }
}
```

For more info see [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache)