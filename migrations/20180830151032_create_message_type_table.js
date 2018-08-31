
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('type_ids'),
    knex.schema
      .createTable('type_ids', function (table) {
        table.increments('id')
        table.string('type')
        table.unique('type')
      })
  ])
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTableIfExists('type_ids')
}
