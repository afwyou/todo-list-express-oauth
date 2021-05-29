const express = require('express')
const router = express.Router()

const passport = require('passport')
//給畫面上的按鈕連結的路由，開始fb的登入流程
router.get('/facebook', passport.authenticate('facebook', {
  //告訴scope要跟使用者申請什麼資料
  scope: ['email', 'public_profile']
}))


//經過fb callback的url，要交給passport的facebook strategy去做事
router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

module.exports = router