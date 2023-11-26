// 各个依赖包
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const logger = require('./logger')
const { expressjwt } = require('express-jwt')
const { jwtSecretKey } = require('./config')

// 路由文件引用
const userRouter = require('./routes/user')
const commonRouter = require('./routes/common')

// Express 引用实例化
const app = express()

// 视图模板设置
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// 使用 morgan 打印日志
app.use(morgan('dev'))

// 使用对 Post 来的数据 json 格式化
app.use(express.json())

// 使用对 表单提交的数据 进行格式化
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// 在请求、响应对象上添加方法
app.use((req, res, next) => {
  res.success = data => {
    res.status(200).send(data)
  }
  res.notFound = message => {
    res.status(404).send(message)
  }
  res.fail = message => {
    res.status(400).send(message)
  }
  // 校验入参是否存在
  req.checkBody = params => {
    if (params instanceof Array) {
      let errStr = ''
      for (let key of params) {
        if (!req.body[key]) {
          errStr += `param ${key} is required\n`
        }
      }
      if (errStr) {
        const err = new Error(errStr)
        err.name = 'incompleteParamsError'
        throw err
      }
    }
  }
  next()
})

// 解析用户信息及配置接口权限，需要在路由前配置
app.use(expressjwt({ secret: jwtSecretKey, algorithms: ['HS256'] }).unless({ path: ['/login', '/register', '/verifyVerificationCode', /^\/getVerificationCode/] }))

app.use(userRouter)
app.use(commonRouter)

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.fail('无效token')
  } else if (err.name === 'incompleteParamsError') {
    res.fail(err.message)
  } else {
    next(err)
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
const _errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} ` + err.message)
  const errorMsg = err.message
  res.status(err.status || 500).json({
    code: -1,
    success: false,
    message: errorMsg,
    data: {}
  })
}
app.use(_errorHandler)

module.exports = app
