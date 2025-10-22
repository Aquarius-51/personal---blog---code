const router = require('koa-router')()
const Menu = require('../model/menuSchema.js')
const utils = require('../utils/utils.js')
router.prefix('/menu')

//菜单列表渲染
router.get('/list', async (ctx) => {
    var { menuName, menuState } = ctx.request.query
    try {
        let params = {};
        if (menuName) params.menuName = { $regex: menuName };
        if (menuState) params.menuState = menuState
        let rootlist = await Menu.find(params).lean()
        let res = utils.TreeMenuList(rootlist)//把普通数组转化成树形结构
        ctx.body = utils.success(res)
    } catch (error) {
        console.log(error);
    }
})


//菜单列表创建&新增&编辑
router.post('/operate', async (ctx, next) => {
    const params = ctx.request.body
    console.log('params=>', params);
    const { menuName, active, _id } = params
    if (active == 'create') {//创建
        if (!menuName) {//验证前端是否填写
            ctx.body = utils.fail('参数错误')
        }
        //防止重复出现相同菜单名称
        let res = await Menu.findOne({ $or: [{ menuName }] }, '_id menuName')
        console.log('res', res);
        if (res) {
            ctx.body = utils.fail('菜单已存在,请重新填写')
            return;
        } else {
            let res = await Menu.create(params)
            ctx.body = utils.success('菜单创建成功')
        }
    } else if (active == 'add') {
        let res = await Menu.create(params)
        ctx.body = utils.success('菜单新增成功')
    } else {
        let res = await Menu.findOneAndUpdate({ _id }, params)
        ctx.body = utils.success('更新成功')
    }
})

//菜单列表删除&批量删除
router.post('/delete', async (ctx) => {
    var _id = ctx.request.body
    console.log('id=>',_id);
    try {
        let res = await Menu.findByIdAndDelete(_id)
        await Menu.deleteMany({ parentId: { $all: _id } })
        ctx.body = utils.success(`删除成功`)
    } catch (error) {
        console.log(error);
    }
})
module.exports = router
