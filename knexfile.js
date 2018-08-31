// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }
  },

  staging: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'dev',
      password: 'dev',
      database: 'dev'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './production.sqlite3'
    }
  }

}
