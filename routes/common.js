const express = require('express')
const commonRouter = express.Router()
const commonHandler = require('../handlers/common')

commonRouter.get('/getVerificationCode/:codeKey', commonHandler.getVerificationCode)
commonRouter.post('/verifyVerificationCode', commonHandler.verifyVerificationCode)

module.exports = commonRouter
