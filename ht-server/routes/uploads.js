/**
 * 上传模块
 */
const router = require('koa-router')()
const Upload = require('./../model/uploadSchema')
const utils = require('./../utils/utils')
const fs = require('fs')//不需要安装 内置模块 读取一些文件需要他
const path = require('path')//不需要安装 内置模块
const multer = require('@koa/multer');//上传模块 需要安装 中间件
router.prefix('/uploads')
let upload = multer({
    storage: multer.diskStorage({
        //文件保存路径
        destination: function (req, file, cb) {
            let dir = "./public/images"
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                })
            }
            cb(null, dir) //注意路径必须存在
        },
        //修改文件名称
        filename: function (req, file, cb) {
            let fileName = file.fieldname + "-" + Date.now() + path.extname(file.originalname)
            cb(null, fileName)
        }
    })
})

//上传
router.post('/img',upload.single('avatar'), async (ctx) => {
    console.log(ctx.request);
    let path = ctx.request.file.path
    path = ctx.request.origin + '' + path.replace(/public/, '')
    let res = await Upload.create({path})
    ctx.body = utils.success(res)
})
//获取页面需要的图片
router.get('/img2', async (ctx) => {
    let res = await Upload.find({})
    ctx.body = utils.success(res)
  })
module.exports = router
