const express = require('express')
const userRouter = express.Router()
const userHandler = require('../handlers/user')

userRouter.post('/register', userHandler.register)
userRouter.post('/login', userHandler.login)

module.exports = userRouter
