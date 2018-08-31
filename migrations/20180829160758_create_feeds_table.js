
exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('feeds', function (table) {
      table.increments('id')
      table.string('hash')
      table.unique('hash')
      table.string('raw')
      table.integer('feed_id')
      table.foreign('feed_id').references('feed_ids.id')
      table.integer('type_id')
      table.foreign('type_id').references('type_ids.id')
    })
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('feeds')
}
