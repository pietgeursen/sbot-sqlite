var sbot = require('../start-sbot')()
var pull = require('pull-stream')
var insertFeed = require('../lib/insertFeed')

exports.seed = function (knex, Promise) {
  var ids = new Set()

  return Promise.all([
    knex('feed_ids')
      .select('public_key')
      .then(function (feed_ids) {
        feed_ids.forEach(function ({public_key}) {
          ids.add(public_key)
        })
      }),
    new Promise(function (resolve, reject) {
      console.log('Start adding friends')
      pull(
        sbot.friends.createFriendStream({hops: 1}),
        pull.map(function (friendId) {
          return {
            public_key: friendId
          }
        }),
        pull.asyncMap(function (friend, cb) {
          if (ids.has(friend.public_key)) {
            return cb(null)
          }
          ids.add(friend.public_key)

          knex('feed_ids')
            .insert(friend)
            .then(function () {
              return insertFeed(friend.public_key, knex, Promise)
            })
            .then(function () {
              cb(null)
            })
            .catch(function () {
              cb(null)
            })
        }),
        pull.collect(function (err) {
          if (err) {
            return console.log('oopsie', err)
          }
          console.log('finished adding friends')
          resolve()
        })
      )
    })

  ])
}
