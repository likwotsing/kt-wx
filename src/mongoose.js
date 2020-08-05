const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/weixin', {
  userNewUrlParser: true
}, () => {
  console.log('Mongodb connected...')
})
exports.ServerToken = mongoose.model('ServerToken', {
  accessToken: String
})