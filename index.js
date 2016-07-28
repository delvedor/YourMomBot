'use strict'

const http = require('http')
setInterval(() => {
  http.get('https://yourmotherbot.herokuapp.com/')
}, 1000 * 60 * 25)

const { bot, sendHowMom } = require('./yourmom')
require('./server')(bot)

setInterval(sendHowMom, 1000 * 60 * 60 * 24)

