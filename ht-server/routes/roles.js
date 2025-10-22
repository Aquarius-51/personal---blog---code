const router = require('koa-router')()
const Role = require('../model/roleSchema.js')
const utils = require('../utils/utils.js')
router.prefix('/roles')

//角色列表渲染
router.get('/list', async (ctx) => {
    var { roleName} = ctx.request.query
    const {page,skipIndex} = utils.pager(ctx.request.query)
    try {
        let params = {};
        if (roleName) params.roleName = {$regex:roleName};
        let query = Role.find(params)
        let list = await query.skip(skipIndex).limit(page.pagesize);
        let total = await Role.countDocuments(params)
        ctx.body = utils.success({list,total})
    } catch (error) {
        console.log(error);
    }
})


//角色列表创建&编辑
router.post('/operate', async (ctx, next) => {
    const params = ctx.request.body
    console.log('params=>', params);
    const { roleName, active, _id } = params
    if (active == 'create') {//创建
        if (!roleName) {//验证前端是否填写
            ctx.body = utils.fail('参数错误')
        }
        //防止重复出现相同角色名称
        let res = await Role.findOne({ $or: [{ roleName }] }, '_id roleName')
        if (res) {
            ctx.body = utils.fail('角色已存在,请重新填写')
            return;
        } else {
            let res = await Role.create(params)
            ctx.body = utils.success('角色创建成功')
        }
    } else {
        let res = await Role.findOneAndUpdate({ _id }, params)
        ctx.body = utils.success('更新成功')
    }
})


//角色列表删除
router.post('/delete', async (ctx) => {
    var _id = ctx.request.body
    try {
        let res = await Role.findByIdAndDelete(_id)
        ctx.body = utils.success(`删除成功`)
    } catch (error) {
        console.log(error);
    }
})

//设置权限
router.post('/permission', async (ctx) => {
    var {_id,...params }= ctx.request.body
    try {
       console.log('params=>',params);
       let res = await Role.findByIdAndUpdate(_id,params)
       ctx.body = utils.success({msg:'ok',code:200,data:'设置成功'})
    } catch (error) {
        console.log(error);
    }
})

module.exports = router
