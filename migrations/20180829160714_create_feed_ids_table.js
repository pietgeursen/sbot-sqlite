
exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('feed_ids', function (table) {
      table.increments('id')
      table.string('public_key')
      table.unique('public_key')
    })
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('feed_ids')
}
