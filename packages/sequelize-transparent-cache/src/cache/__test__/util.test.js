const { dataToInstance } = require('../util')
const sequelize = require('./record')
const { Record } = sequelize.models
const exampleData = require('./example.json')

/*
  When a model contains a large number of cross-related associations
  the number of nodes in the re-hyratded graph explodes.

  For example with 33 Models, and 16 associations the number of nodes
  at the recusion depth of 5 is 11,496. All of which require memory
  allocation.
*/
describe('generateIncludeFromData (data-driven include)', () => {
  beforeAll(() => sequelize.sync())

  test('caps recursion depth at 5 even when data is deeper', () => {
    const instance = dataToInstance(Record, exampleData)
    expect(instance.length).toBeGreaterThan(200)
    expect(instance[0]).toBeInstanceOf(Record)
  })
})
