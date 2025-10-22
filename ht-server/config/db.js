const mongoose = require('mongoose');
const config = require('./index')
mongoose.connect(config.URL);
mongoose.connection.on('error', err => {
  console.log(err);
});
mongoose.connection.on('open', () => {
  console.log('********数据库连接成功********');
});