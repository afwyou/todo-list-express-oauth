const express = require('express')
const router = express.Router()

const home = require('./modules/home')
const todos = require('./modules/todos')
const users = require('./modules/users')
const auth = require('./modules/auth')
const { authenticator } = require('../middleware/auth')

router.use('/todos', authenticator, todos)//需要驗證的路由
router.use('/users', users)
router.use('/auth', auth)
router.use('/', authenticator, home)//需要驗證的路由
module.exports = router
