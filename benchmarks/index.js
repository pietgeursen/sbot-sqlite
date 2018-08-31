var sbot = require('../start-sbot')()
var pull = require('pull-stream')
var knexConfig = require('../knexfile')[process.env.NODE_ENV || 'development']
var knex = require('knex')(knexConfig)

var myId = sbot.whoami().id

sbotGetMyFeed()
  .then(knexGetMyFeed)
  .then(sbotGetAllVotesByMe)
  .then(knexGetAllVotesByMe)
  .then(sbotGetMsg)
  .then(knexGetMsg)
  .then(sbotJsonSearching)
  .then(knexJsonSearching)
  .then(() => sbot.close())

function sbotGetMsg () {
  console.time('sbot-get-message-by-hash')
  return new Promise(function (resolve, reject) {
    sbot.get('%t4HUs5ScLtHrCXgy36sufHtfkJxEDbF+KaPeG1O7umA=.sha256', function (err, res) {
      if (err) return reject(err)
      console.timeEnd('sbot-get-message-by-hash')
      resolve()
    })
  })
}

function sbotJsonSearching () {
  var reg = new RegExp('loomio')
  console.time('sbot-json-searching')
  return new Promise(function (resolve, reject) {
    pull(
      sbot.createHistoryStream({id: myId}),
      pull.filter(message => message && message.value && message.value.content && message.value.content.text),
      pull.map(message => message.value.content.text),
      pull.filter(text => reg.test(text)),
      pull.collect(function (err, res) {
        console.timeEnd('sbot-json-searching')
        console.log(`got ${res.length} results`)
        resolve()
      })
    )
  })
}

function knexJsonSearching () {
  console.time('knex-json-searching')
  // get the hashes of all the messages with text that mentions loomio
  return knex.raw('SELECT hash FROM feeds WHERE feed_id=1 AND json_extract(raw, "$.value.content.text") LIKE "%loomio%";')
    .then(function (results) {
      console.timeEnd('knex-json-searching')
      console.log(`got ${results.length} results`)
    })
}

function knexGetMsg () {
  console.time('knex-get-message-by-hash')
  return knex('feeds')
    .where({hash: '%t4HUs5ScLtHrCXgy36sufHtfkJxEDbF+KaPeG1O7umA=.sha256'})
    .first()
    .then(function (msg) {
      console.timeEnd('knex-get-message-by-hash')
    })
}

function knexGetAllVotesByMe () {
  console.time('knex-get-all-votes-by-me')
  return knex('feeds')
    .join('type_ids', 'feeds.type_id', 'type_ids.id')
    .select('raw', 'type_ids.type as type')
    .where({feed_id: 1})
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
