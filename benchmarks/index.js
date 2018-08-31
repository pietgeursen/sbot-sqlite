var sbot = require('../start-sbot')()
var pull = require('pull-stream')
var knexConfig = require('../knexfile')['development']
var knex = require('knex')(knexConfig)

var myId = sbot.whoami().id

sbotGetMyFeed()
  .then(knexGetMyFeed)
  .then(knexGetAllVotesByMe)
  .then(sbotGetAllVotesByMe)

function knexGetAllVotesByMe () {
  console.time('knex-get-all-votes-by-me')
  return knex('feeds')
    .join('type_ids', 'feeds.type_id', 'type_ids.id')
    .select('raw', 'type_ids.type as type')
    .where({ feed_id: 1})
    .andWhere({type: 'vote'})
    .then(function (res) {
      console.timeEnd('knex-get-all-votes-by-me')
      console.log(`got ${res.length} results`)
      return Promise.resolve()
    })
    .catch(function (err) {
      console.log(err)
    })
}

function knexGetMyFeed () {
  console.time('knex-get-my-feed')
  return knex('feeds')
    .select('raw')
    .where({feed_id: 1})
    .then(function (res) {
      console.timeEnd('knex-get-my-feed')
      console.log(`got ${res.length} results`)
      return Promise.resolve()
    })
    .catch(function (err) {
      console.log(err)
    })
}

function sbotGetAllVotesByMe () {
  return new Promise(function (resolve, reject) {
    console.time('sbot-get-all-votes-by-me')
    pull(
      sbot.createHistoryStream({id: myId}),
      pull.filter(message => message && message.value && message.value.content && message.value.content.type === 'vote'),
      pull.collect(function (err, res) {
        console.timeEnd('sbot-get-all-votes-by-me')
        console.log(`got ${res.length} results`)
        resolve()
      })
    )
  })
}
function sbotGetMyFeed () {
  return new Promise(function (resolve, reject) {
    console.time('sbot-get-my-feed')
    pull(
      sbot.createHistoryStream({id: myId}),
      pull.collect(function (err, res) {
        console.timeEnd('sbot-get-my-feed')
        console.log(`got ${res.length} results`)
        resolve()
      })
    )
  })
}
