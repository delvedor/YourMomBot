'use strict'

// Imports
const TelegramBot = require('node-telegram-bot-api')
const matchAll = require('match-all')
const level = require('level')

// Declarations
const { token, chatId } = require('./token.json')
const bot = new TelegramBot(token, {polling: true})
const db = level('.yourmomdb')

bot.onText(/\/how/, function (message, match) {
  const reg = /@(\w+)/gi
  const users = matchAll(message.text, reg).toArray()
  users.forEach((user) => {
    db.get(user.toLowerCase(), (err, value) => {
      if (err) {
        if (err.notFound) {
          bot.sendMessage(chatId, 'Non ha ancora risposto!')
        } else {
          console.log(err)
          bot.sendMessage(chatId, 'Ops, è accaduto qualcosa di spiacevole!')
        }
        return
      }
      bot.sendMessage(chatId, `${user.toLowerCase()} ${value}`)
    })
  })
})

const howMom = {
  reply_markup: JSON.stringify({
    keyboard: [
      [{text: 'Bene', callback_data: '1'}],
      [{text: 'Male', callback_data: '2'}]
    ],
    'one_time_keyboard': true
  })
}

setInterval(() => {
  bot.sendMessage(chatId, 'Come sta la tua mamma?', howMom)
    .then((message) => {
      bot.onReplyToMessage(message.chat.id, message.message_id, (reply) => {
        db.put(reply.from.username.toLowerCase(), reply.text, (err) => {
          if (err) {
            console.log(err)
            bot.sendMessage(chatId, 'Ops, è accaduto qualcosa di spiacevole!')
          }
        })
      })
    })
}, 1000 * 60 * 60 * 24)

bot.onText(/\/howall/, function (message, match) {
  db.createReadStream()
    .on('data', (data) => {
      bot.sendMessage(chatId, `${data.key} ${data.value}`)
    })
    .on('error', (err) => {
      console.log(err)
      bot.sendMessage(chatId, 'Ops, è accaduto qualcosa di spiacevole!')
    })
})
