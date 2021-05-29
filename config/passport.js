const passport = require('passport')
const bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const User = require('../models/user')
module.exports = app => {
  // 初始化 Passport 模組
  app.use(passport.initialize())
  app.use(passport.session())
  // 設定本地登入策略
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered!' })
        }
        //bcrypt.compare判斷使用者登入密碼，是否與資料庫裡雜湊值一致。
        //第一個參數是使用者的輸入值，而第二個參數是資料庫裡的雜湊值，bcrypt比對並回傳布林值
        return bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
            return done(null, false, { message: 'Email or Password incorrect.' })
          }
          return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))


  passport.use(new FacebookStrategy({
    //透過下方的幾個值的設定來向fb取得使用者授權
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    //由誰來回頭呼叫這個url
    //由fb直接塞到瀏覽器的url
    //呼叫時，主機必須把這個request交給passport來處理
    callbackURL: process.env.FACEBOOK_CALLBACK,
    //取得哪些欄位的授權
    profileFields: ['email', 'displayName']
    //取得的使用者資料就會放在profile裡面
  }, (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const { name, email } = profile._json
    User.findOne({ email })// User.findOne({ email = profile._json.email })
      .then(user => {
        if (user) return done(null, user)
        //toString(36)將密碼轉成36進位可以取得所有的英數字母
        //slice(-8)只取後面8位
        const randomPassword = Math.random().toString(36).slice(-8)
        bcrypt
          .genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => User.create({
            name,
            email,
            password: hash
          }))
          .then(user => done(null, user))
          .catch(err => done(err, false))
      })
  }))

  // 設定序列化與反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}