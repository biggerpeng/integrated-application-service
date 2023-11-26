const svgCaptcha = require('svg-captcha')
const database = require('../database')

const getVerificationCode = (req, res) => {
  var captcha = svgCaptcha.create({ color: true })
  database.query(
    `INSERT INTO verification_code (code_key, code_value) VALUES ('${req.params.codeKey}', '${captcha.text}')`,
    (err, result) => {
      if (err) {
        res.send(err.message)
      } else if (result.affectedRows === 1) {
        res.type('svg')
        res.status(200).send(captcha.data)
      }
    }
  )
}

const verifyVerificationCode = (req, res) => {
  req.checkBody(['code_key', 'code_value'])
  database.query(
    `SELECT * FROM verification_code WHERE code_key = '${req.body.code_key}'`,
    (err, result) => {
      if (err) {
        res.send(err.message)
      } else {
        !result.length && res.notFound('未查询到数据')
        result[0].code_value.toUpperCase() === req.body.code_value.toUpperCase()
          ? res.success('验证成功')
          : res.fail('验证码错误')
      }
    }
  )
}

module.exports = { getVerificationCode, verifyVerificationCode }
