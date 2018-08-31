var knex = require('knex')({
  dialect: 'sqlite3',
  connection: {
    filename: './data.db'
  }
})

// Create a table
knex.schema
  .createTable('users', function (table) {
    table.increments('id')
    table.string('user_name')
  })
  .createTable('accounts', function (table) {
    table.increments('id')
    table.string('account_name')
    table.integer('user_id').unsigned().references('users.id')
  })
  .then(function () {
    console.log('done')
    knex.destroy()
  })
  .catch(function () {
    knex.destroy()
  })
