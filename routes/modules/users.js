const express = require('express')
const router = express.Router()
const User = require('../../models/user')
const passport = require('passport')
router.get('/login', (req, res) => {
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
  //Passport.js 提供的函式，會幫你清除 session
  res.redirect('/users/login')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  User.findOne({ email }).then(user => {
    if (user) {
      console.log('User already exists')
      res.render('register', {
        name,
        email,
        password,
        confirmPassword
      })
    } else {
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
    }
  })
})

module.exports = router