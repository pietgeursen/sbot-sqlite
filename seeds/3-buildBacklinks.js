var emitLinks = require('ssb-backlinks/emit-links')
var pull = require('pull-stream')

exports.seed = function (knex, Promise) {
  console.log('start building backlinks')
  // Deletes ALL existing entries
  return knex('backlinks').del()
    .then(function () {
      return knex('feeds')
        .select('raw')
    })
    .then(function (results) {
      return storeBackLinks(results)
    })
  function storeBackLinks (results) {
    return new Promise(function (resolve, reject) {
      pull(
        pull.values(results),
        pull.map(o => o.raw),
        pull.map(JSON.parse),
        pull.map(function (message) {
          return emitLinks(message, () => {})
        }),
        pull.flatten(),
        pull.map(function (link) {
          return {
            source_key: link.key,
            dest_key: link.dest
          }
        }),
        pull.collect(function (error, links) {
          if (error) return reject(error)
          knex.batchInsert('backlinks', links, 100)
            .then(function () {
              console.log('done building backlinks')
              resolve()
            })
            .catch(reject)
        })
      )
    })
  }
}
