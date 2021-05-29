const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI
//如果在遠端執行，這裡的環境變數設定在heroku網頁裡/setting/Config Vars設定
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

module.exports = db
