
exports.up = function (knex, Promise) {
  return Promise.all([
    knex
      .schema
      .createTable('backlinks', function (table) {
        table.increments('id')
        table.string('source_key')
        table.string('dest_key')
      })
  ])
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('backlinks')
}
