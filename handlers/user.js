const jwt = require('jsonwebtoken')
const database = require('../database')
const bcrypt = require('bcryptjs')
const axios = require('axios')
const salt = bcrypt.genSaltSync(10)
const { jwtSecretKey } = require('../config')
const baseUrl = 'http://127.0.0.1:3000'

const register = (req, res) => {
  req.checkBody(['username', 'password'])
  database.query(`SELECT * FROM users WHERE username = '${req.body.username}'`, (err, result) => {
    if (err) {
      res.fail(err.message)
    } else {
      if (result.length) return res.fail('该用户名已被注册')
      const data = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, salt),
        registrytime: new Date()
      }
      const sql = 'INSERT INTO users SET ?'
      database.query(sql, data, (err, okPacket) => {
        if (err) return res.fail(err.message)
        if (okPacket.affectedRows === 1) {
          res.success('注册成功')
        } else {
          res.fail('注册失败')
        }
      })
    }
  })
}

const login = (req, res) => {
  req.checkBody(['username', 'password', 'code_key', 'code_value'])
  axios
    .post(baseUrl + '/verifyVerificationCode', {
      code_key: req.body.code_key,
      code_value: req.body.code_value
    })
    .then(response => {
      // 验证码验证成功
      database.query('SELECT * FROM users WHERE username = ?', req.body.username, (err, result) => {
        if (err) return res.fail(err.message)
        if (!result.length) return res.notFound('该用户不存在')
        if (!bcrypt.compareSync(req.body.password, result[0].password)) return res.fail('密码错误')
        const token = jwt.sign({ username: req.body.username }, jwtSecretKey, { expiresIn: '7d' })
        res.success(token)
      })
    })
    .catch(error => {
      res.fail(error.response.data)
    })
}

module.exports = { register, login }
