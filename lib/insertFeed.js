var pull = require('pull-stream')
var sbot = require('../start-sbot')()

module.exports = function insertFeed (feed_id, knex, Promise) {
  var types = new Map()

  console.log('Start adding feed: ', feed_id)
  return Promise.all([
    knex('type_ids')
      .then(function (ids) {
        ids.forEach(function ({id, type}) {
          types.set(type, id)
        })

        return knex('feed_ids')
          .insert({public_key: feed_id})
          .catch(function (err) {
            return Promise.resolve()
          })
      })
      .then(function () {
        return knex('feed_ids')
          .where({public_key: feed_id})
          .select('id')
          .first()
          .then(function ({id}) {
            return new Promise(function (resolve, reject) {
              pull(
                sbot.createHistoryStream({id: feed_id}),
                pull.map(function (message) {
                  return {
                    hash: message.key,
                    feed_id: id,
                    raw: JSON.stringify(message),
                    message
                  }
                }),
                pull.asyncMap(function (data, cb) {
                  var msg = data.message
                  var type = msg.value.content.type || 'unknown'
                  findOrCreateTypeId(type)
                    .then(function ({type_id}) {
                      cb(null, {
                        hash: data.hash,
                        feed_id: data.feed_id,
                        raw: data.raw,
                        type_id: type_id
                      })
                    })
                    .catch(function (err) {
                      cb(err)
                    })
                }),
                pull.collect(function (error, data) {
                  console.log('begin batch insert')
                  knex.batchInsert('feeds', data, 100)
                    .then(function () {
                      console.log('finished adding feed')
                      resolve()
                    })
                    .catch(function (err) {
                      reject(err)
                    })
                })
              )
            })
          })
      })
  ])

  function findOrCreateTypeId (type) {
    // get all the feeds
    return new Promise(function (resolve, reject) {
      pull(
        pull.once(type),
        pull.map(function (type) {
          // see if we can find the type in the types table
          var type_id = types.get(type)
          return {type, type_id}
        }),
        pull.asyncMap(function ({type, type_id}, cb) {
          // this type already is in the types table
          if (type_id) return cb(null, {type, type_id})

          // otherwise create the type in the table
          knex('type_ids')
            .insert({type})
            .returning('id')
            .then(function (ids) {
              var id = ids[0]
              types.set(type, id)
              cb(null, {type, type_id: id})
            })
            .catch(function (err) {
              cb(err)
            })
        }),
        pull.drain(function ({type_id}) {
          resolve({type_id})
        })
      )
    })
  }
}
