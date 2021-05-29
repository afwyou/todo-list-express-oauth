const express = require('express')
const router = express.Router()
const User = require('../../models/user')
const passport = require('passport')
const bcrypt = require('bcryptjs')
router.get('/login', (req, res) => {
  console.log('第三我在/login(重新導向後）印出res.locals：', res.locals)
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

router.get('/register', (req, res) => {
  res.render('register')
})

router.get('/logout', (req, res) => {
  req.logout()
  //Passport.js 提供函式，會清除 session
  req.flash('success_msg', '你已經成功登出。')
  console.log('第二我在/logout印出：res.locals', res.locals)
  res.redirect('/users/login')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []
  if (!name || !email || !password || !confirmPassword) {
    errors.push({ message: '所有欄位都是必填。' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不相符！' })
  }
  if (errors.length) {//????
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword
    })
  }

  User.findOne({ email }).then(user => {
    if (user) {
      errors.push({ message: '這個 Email 已經註冊過了。' })
      return res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword
      })
    }//return 之後，會跳脫function，不需要再else了

    return bcrypt
      .genSalt(10)
      // 產生「鹽」，並設定複雜度係數為 10
      //不同帳號會有不同的salt，雜湊位數也不同，因此駭客更難透過窮算法去取得使用者的密碼
      //主要是密碼本身產生的主雜湊文是固定的
      //添加salt的合體密碼雜湊，和salt本身，會被分別存放在資料庫不同的地方
      //最後比對的仍然是密碼本身產生的雜湊值
      //只不過資料庫password呈現的是salt+密碼的雜湊值
      .then(salt => bcrypt.hash(password, salt))// 為使用者密碼「加鹽」，產生雜湊

      .then(hash => User.create({
        name,
        email,
        password: hash // 用雜湊值取代原本的使用者密碼
      }))
      .then(() => res.redirect('/'))
      .catch((error) => console.log('error'))

    ////another way
    // const newUser = new Users({
    //   name,
    //   email,
    //   password
    // })
    // newUser
    //   .save()
    //   .then(() => res.redirect('/'))
    //   .catch((error) => console.log('error'))

  })
})

module.exports = router