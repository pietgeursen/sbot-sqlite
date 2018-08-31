var sbot = require('../start-sbot')()
var insertFeed = require('../lib/insertFeed')

exports.seed = function (knex, Promise) {
  var myId = sbot.whoami().id
  return insertFeed(myId, knex, Promise)
}
