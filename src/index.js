// index.js
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser');
const conf = require('./conf')
const wechat = require('co-wechat')
const xml2js = require('xml2js')
const url = require('url')
const crypto = require('crypto')
const xmlParser = require('koa-xml-body')
const axios = require('axios');
const WechatAPI = require('co-wechat-api')
const { ServerToken } = require('./mongoose')

const api = new WechatAPI(
  conf.appid,
  conf.appsecret,
  // 获取token
  async() => await ServerToken.findOne(),
  // 存token
  async token => await ServerToken.updateOne({}, token, { upsert: true })
)
console.log('api', api)
const app = new Koa()
app.use(bodyParser())
const router = new Router()
app.use(static(__dirname + '/'))

router.all('/wechat', wechat(conf).middleware(
  async message => {
    console.log('wechat', message)
    return 'Hello world! ' + message.Content
  }
))

// const tokenCache = {
//   access_token: '',
//   updateTime: Date.now(),
//   expires_in: 7200
// }
// router.get('/getToken', async ctx => {
//   const wxDomain = `https://api.weixin.qq.com`
//   const path = `/cgi-bin/token`
//   const params = `?grant_type=client_credential&appid=${conf.appid}&secret=${conf.appsecret}`
//   const url = `${wxDomain}${path}${params}`
//   const res = await axios.get(url)
//   Object.assign(tokenCache, res.data, {
//     updateTime: Date.now()
//   })
//   ctx.body = res.data
// })

// router.get('/getFollwers', async ctx => {
//   const wxDomain = `https://api.weixin.qq.com`
//   const path = `/cgi-bin/user/get`
//   const params = `?access_token=${tokenCache.access_token}`
//   const url = `${wxDomain}${path}${params}`
//   const res = await axios.get(url)
//   console.log('getFollwers', res.data)
//   ctx.body = res.data
// })



router.get('/getFollowers', async ctx => {
  var res = await api.getFollowers()
  console.log(res.data)
  res = await api.batchGetUsers(res.data.openid, 'zh_CN')
  ctx.body = res
})

app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(3000);

console.log('server is running at port 3000')