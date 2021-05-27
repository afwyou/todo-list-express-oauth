const express = require('express')
const router = express.Router()
const User = require('../../models/user')
const passport = require('passport')
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

    return User.create({
      name,
      email,
      password
    })
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