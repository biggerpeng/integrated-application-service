const mysql = require('mysql')
const config = require('./config')
const database = mysql.createPool(config.mysql)

module.exports = database
