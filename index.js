'use strict'

const http = require('http')
setInterval(() => {
  http.get('https://yourmotherbot.herokuapp.com/')
}, 1000 * 60 * 25)

const bot = require('./yourmom')
require('./server')(bot)
