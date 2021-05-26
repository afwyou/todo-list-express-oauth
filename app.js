const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const usePassport = require('./config/passport')

const routes = require('./routes')
require('./config/mongoose')

const app = express()
const PORT = process.env.PORT || 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

//app.use 對所有的req做前置處理（上而下），代表這組 middleware 會作用於所有的路由
app.use(session({
  secret: 'ThisIsMySecret',
  resave: 'false',
  saveUninitialized: 'true'

}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
usePassport(app)//取得user
app.use((req, res, next) => {
  // 你可以在這裡 console.log(req.user) 等資訊來觀察
  // res.locals代表在所有的路由都宣告了以下的變數
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  console.log(res.locals)
  next()
})//存入res
app.use(routes)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
