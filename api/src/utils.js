const { URL } = require('url')
const crypto = require('crypto')
const APPID = 'APPID'
const APISecret = 'APISecret'
const APIKey = 'APIKey'
/**
 * 接口鉴权url生成
 * @returns 
 */
function createUrl() {
  // 接口url
  const baseUrl = new URL('wss://spark-api.xf-yun.com/v1.1/chat')
  // 当前时间戳，采用RFC1123格式
  const date = new Date().toGMTString()
  // 获取host
  const host = baseUrl.host
  // 拼接生成签名字符串
  const signatureStr = `host: ${host}\ndate: ${date}\nGET ${baseUrl.pathname} HTTP/1.1`
  // 利用hmac-sha256算法结合APISecret对上一步的signatureStr签名，获得签名后的摘要signatureSha
  const hmac = crypto.createHmac('sha256', APISecret)
  hmac.update(signatureStr)
  const signatureSha = hmac.digest('bytes')
  // 将上方的signatureSha进行base64编码生成signature
  const signature = signatureSha.toString('base64')
  // 利用上面生成的signature，拼接下方的字符串生成signatureOrigin
  const signatureOrigin = `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
  // 最后再将上方的signatureOrigin进行base64编码,生成最终的authorization
  const authorization = new Buffer.from(signatureOrigin).toString('base64')
  const url = `${baseUrl}?authorization=${authorization}&date=${urlencode(date)}&host=${host}`
  return url
}

/**
 * 生成请求参数
 * @param {*} question 
 * @returns 
 */
function genParams(question) {
  const data = {
    header: {
      app_id: APPID,
      uid: '1234',
    },
    parameter: {
      chat: {
        domain: 'general',
        random_threshold: 0.5,
        max_tokens: 2048,
        auditing: 'default',
      },
    },
    payload: {
      message: {
        text: [{ role: 'user', content: question }],
      },
    },
  }
  return data
}
function urlencode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+')
}

module.exports = {
  createUrl,
  genParams,
}
