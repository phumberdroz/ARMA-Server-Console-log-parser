module.exports =  {
  "development": {
    "username": "root",
    "password": "",
    "database": "gadget",
    "host": "localhost",
    "port": "3306",
    "dialect": "mysql",
    "logging": false,
    "pool": {
      "max": 100,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.DBUser,
    "password": process.env.DBPassword,
    "database": process.env.DB,
    "host": process.env.DBHost,
    "port": process.env.DBPort,
    "dialect": "mysql",
    "logging": false,
    "pool": {
      "max": 100,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  }
}
