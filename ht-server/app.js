const Koa = require('koa')
const app = new Koa();
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')//打印某一些内容
const jwt = require('koa-jwt');
const router = require('koa-router')()
const utils = require('./utils/utils.js')
const users = require('./routes/users')
const echarts = require('./routes/echarts')
const menus = require('./routes/menus')
const roles = require('./routes/roles')
const depts = require('./routes/depts')
const leaves = require('./routes/leaves')
const uploads = require('./routes/uploads')
const session = require('koa-session');
// error handler
onerror(app)
require('./config/db')

app.keys = ['some secret hurr'];

const CONFIG = {
  key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
};

app.use(session(CONFIG, app));
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  await next().catch((err)=>{
     if(401==err.status){
      
      ctx.body = utils.fail({data:'token超时token超时请重新登录111',msg:'fail',code:401});
     }
   })
})

// routes
router.prefix('/api')
app.use(jwt({ secret: 'lee' }).unless({ path: [/^\/api\/users\/login/,/^\/api\/users\/captcha/]}));
router.use(users.routes(), users.allowedMethods())
router.use(echarts.routes(), echarts.allowedMethods())
router.use(menus.routes(), menus.allowedMethods())
router.use(roles.routes(), roles.allowedMethods())
router.use(depts.routes(), depts.allowedMethods())
router.use(leaves.routes(), leaves.allowedMethods())
router.use(uploads.routes(), uploads.allowedMethods())
app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
