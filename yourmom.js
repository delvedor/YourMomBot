'use strict'

// Imports
const TelegramBot = require('node-telegram-bot-api')
const matchAll = require('match-all')
const db = require('./db')
const remove = require('unordered-array-remove')

// Declarations
const token = process.env.TOKEN
const chatId = process.env.CHATID
let bot = null

if (process.env.NODE_ENV === 'production') {
  bot = new TelegramBot(token)
  bot.setWebHook(process.env.HEROKU_URL + bot.token)
  console.log('Running in production')
} else {
  bot = new TelegramBot(token, { polling: true })
  console.log('Running in development')
}
console.log('Bot started!')
console.log('Token:', token)
console.log('ChatId:', chatId)

// Custom keyboards
const keyboards = {
  howMom: {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Bene' }],
        [{ text: 'Male' }]
      ]
    })
  },
  hideKeyboard: {
    reply_to_message_id: null,
    reply_markup: JSON.stringify({
      hide_keyboard: true,
      selective: true
    })
  }
}

// /mom command
bot.onText(/\/mom/, function (message, match) {
  const reg = /@(\w+)/gi
  const users = matchAll(message.text, reg).toArray()
  // If the user sends "/mom@Your_Mom_Bot"
  const botName = users.indexOf('Your_Mom_Bot')
  if (botName !== -1) remove(users, botName)
  if (!users.length) return

  users.forEach((user) => {
    db.get(user.toLowerCase(), (err, value) => {
      if (err) {
        if (err.error === 'Key not found') {
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

// /allmom command
bot.onText(/\/allmom/, function (message, match) {
  db.all((err, iterator) => {
    if (err) {
      console.log(err)
      bot.sendMessage(chatId, 'Ops, è accaduto qualcosa di spiacevole!')
    }
    for (let [key, value] of iterator()) {
      bot.sendMessage(chatId, `${key} ${value}`)
    }
  })
})

// /mymom command
bot.onText(/\/mymom/, sendHowMom)

// Sends "How is your mom?" with a custom keyboard response.
function sendHowMom (message, match) {
  bot.sendMessage(chatId, 'Come sta la tua mamma?', keyboards.howMom)
    .then((message) => {
      bot.onReplyToMessage(message.chat.id, message.message_id, (reply) => {
        db.put(reply.from.username.toLowerCase(), reply.text, (err) => {
          if (err) {
            console.log(err)
            bot.sendMessage(chatId, 'Ops, è accaduto qualcosa di spiacevole!')
          }
          keyboards.hideKeyboard.reply_to_message_id = reply.message_id
          bot.sendMessage(chatId, 'ok!', keyboards.hideKeyboard)
        })
      })
    })
}

sendHowMom()
setInterval(sendHowMom, 1000 * 60 * 60 * 24)

module.exports = bot
