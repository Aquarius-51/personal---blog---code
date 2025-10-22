const router = require('koa-router')()
const Dept = require('../model/deptSchema.js')
const utils = require('../utils/utils.js')
router.prefix('/depts')

//部门列表渲染
router.get('/list', async (ctx) => {
    var { deptName } = ctx.request.query
    try {
        let params = {};
        if (deptName) params.deptName = { $regex: deptName };
        let rootlist = await Dept.find(params).lean()
        let res = TreeDeptList(rootlist)//把普通数组转化成树形结构
        ctx.body = utils.success(res)
    } catch (error) {
        console.log(error);
    }
})
//普通数组转化为树形结构
function TreeDeptList(data){//非递归
    let reslut = []//返回的数据
    let map = {}//映射的数据
    data.forEach(item=>{
      map[item._id] = item
    })
    data.forEach(item=>{
      let a =  item.deptId.slice().pop()
      let parent = map[a]
      if(parent){
         (parent.children || (parent.children = [])).push(item);
         if (parent.component != '') {
            (parent.action || (parent.action = [])).push(item);
        }
      }else {
         reslut.push(item)
      }
    })
    return reslut
 }
//列表创建&编辑
router.post('/operate', async (ctx, next) => {
    const params = ctx.request.body
    console.log('params',params);
    console.log('params=>', params);
    const { deptId, deptName, userName, userId, userEmail, userName2, userEmail2,active, _id } = params
    if (active == 'create') {//创建
        if (!deptName) {//验证前端是否填写
            ctx.body = utils.fail('参数错误')
        }
        let res = await Dept.create(params)
        ctx.body = utils.success('列表创建成功')
    } else if (active == 'add') {
        let res = await Dept.create(params)
        ctx.body = utils.success('部门新增成功')
    }else if(active == 'edit') {
        let res = await Dept.findOneAndUpdate({_id}, params)
        ctx.body = utils.success('更新成功')
    }
})

//部门列表删除&批量删除
router.post('/delete', async (ctx) => {
    var _id = ctx.request.body
    console.log('id=>', _id);
    try {
        let res = await Dept.findByIdAndDelete(_id)
        await Dept.deleteMany({ deptId: { $all: _id } })
        ctx.body = utils.success(`删除成功`)
    } catch (error) {
        console.log(error);
    }
})
module.exports = router
