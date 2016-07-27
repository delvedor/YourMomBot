'use strict'
const tyval = require('tyval')
const remove = require('object.omit')

const keyVal = tyval.string().min(1).toFunction()
const valueVal = tyval.string().min(1).toFunction()

function createDB () {
  const database = {}
  const db = {}

  db.get = function (key, callback = noop) {
    if (!keyVal(key)) {
      return callback({ error: 'Key not valid' }, null)
    }
    if (database.hasOwnProperty(key)) {
      return callback(null, database[key])
    }
    return callback({ error: 'Key not found' }, null)
  }

  db.put = function (key, value, callback = noop) {
    if (!keyVal(key) || !valueVal(value)) {
      return callback({ error: 'Key/Value not valid' })
    }
    database[key] = value
    return callback(null)
  }

  db.del = function (key, callback = noop) {
    if (!keyVal(key)) {
      return callback({ error: 'Key not valid' })
    }
    remove(database, key)
    return callback(null)
  }

  db.all = function (callback = noop) {
    return callback(null, databaseIterator)
  }

  const databaseIterator = function * () {
    const propKeys = Reflect.ownKeys(database)
    for (let propKey of propKeys) {
      yield [propKey, database[propKey]]
    }
  }

  const noop = err => { if (err) throw err }

  return db
}

module.exports = createDB()
