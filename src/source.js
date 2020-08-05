// source.js
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const xml2js = require('xml2js')
const url = require('url')
const conf = require('./conf')

const crypto = require('crypto')
const bodyParser = require('koa-bodyparser');
const xmlParser = require('koa-xml-body')

const app = new Koa()

app.use(xmlParser())
const router = new Router()
app.use(static(__dirname + '/'))

// router.all('/wechat', wechat(conf).middleware(
//   async message => {
//     console.log('wechat', message)
//     return 'Hello world! ' + message.Content
//   }
// ))

// 验证
router.get('/wechat', ctx => {
  console.log('微信认证... ', ctx.url)
  const { query } = url.parse(ctx.url, true)
  const {
    signature, // 微信加密签名
    timestamp, // 时间戳
    nonce, // 随机数
    echostr // 随机字符串
  } = query
  console.log('wechat', query)

  // 将token timestamp nonce 三个参数进行字典排序并用sha1加密
  let str = [conf.token, timestamp, nonce].sort().join('')
  console.log('str', str)
  let strSha1 = crypto.createHash('sha1').update(str).digest('hex')

  console.log('自己加密后的字符串为：', strSha1)
  console.log('微信传入的加密字符串为：', signature)
  console.log('两者比较的结果：', strSha1 === signature)
  
  // 签名对比，相同则按照微信要求返回echostr
  if (strSha1 === signature) {
    ctx.body = echostr
  } else {
    ctx.body = '你不是微信aa'
  }
})

// 接收信息
router.post('/wechat', ctx => {
  const { xml: msg } = ctx.request.body
  console.log('Receive:', msg)
  const builder = new xml2js.Builder()
  const result = builder.buildObject({
    xml: {
      ToUserName: msg.FromUserName,
      FromUserName: msg.ToUserName,
      CreateTime: Date.now(),
      MsgType: msg.MsgType,
      Content: 'Hello ' + msg.Content
    }
  })
  ctx.body = result
})

app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(3000);