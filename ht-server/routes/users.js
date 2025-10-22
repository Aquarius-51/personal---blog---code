const router = require('koa-router')()
var jwt = require('jsonwebtoken');
const User = require('../model/userSchema.js')
const Menu = require('../model/menuSchema.js')
const Role = require('../model/roleSchema.js')
const Counter = require('../model/counterSchema.js')
const utils = require('../utils/utils.js')
var svgCaptcha = require('svg-captcha');
const excel = require("./../utils/excel")//引入excel
const { setAccessToken, setRefreshToken, secret } = require('../utils/token')
router.prefix('/users')
//列表渲染 get 上传 POST 修改PUT或者POST 删除delete或者POST  RESTFUL风格语法
//如果是POST请求 获取前端发送的参数 ctx.request.body
//如果是GET请求 获取前端发送的参数 ctx.request.query
//ctx.body是返回给前端的数据
//方法的后面 第一个参数都是查询条件 第二个参数基本上都是返回条件
//{userPwd:0} 作为返回条件 0代表不返回  1代表返回 {}或者null代表全部返回 'userName userEmail'代表挑选返回
//$inc 自增加  $or或者  $in包含   $all所有
//登录接口
router.post('/login', async (ctx) => {
    console.log('111111',ctx.request.body);
    var { userName, userPwd ,captcha} = ctx.request.body
    try {
        let res = await User.findOne({ userName, userPwd }, { userPwd: 0})
        if (res&&captcha.toLowerCase()==ctx.session.picCode.toLowerCase()) {
            let data = res._doc
            let accessToken = setAccessToken(data);
            let refreshToken = setRefreshToken(data);
            data.token = accessToken
            data.refreshToken = refreshToken
            ctx.body = utils.success({ data: res, msg: 'ok', code: 200 })
        }else {
            ctx.body = utils.success({ data: '账号密码或验证码错误', msg: 'ok', code: 200 })
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/refresh', (ctx) => {
    let code, msg, data = null
    //获取请求头中携带的长token
    const authorization = ctx.request.header.authorization
    let token = utils.decoded(authorization)
    ctx.body = utils.success(token)
    // jwt.verify(r_tk,secret,(error)=>{
    //     if(error){
    //         code=4006,
    //         msg='长token无效，请重新登录'
    //     } else{
    //         code=2000,
    //         msg='长token有效，返回新的token'，
    //         data={
    //             accessToken:getAccessToken(),
    //             refreshToken:getReferToken()
    //         }
    //     }
    // })
})
//权限
router.get('/permissionlist', async (ctx) => {
    const authorization = ctx.request.header.authorization
    let data = utils.decoded(authorization)
    console.log('data', data);
    try {
        let menuList = await getMenuList(data.role, data.roleList)//第一个参数是角色（普通用户还是管理员） 第二个参数角色列表（你是什么职位 如:人事主管 技术总监）
        let actionList = getActionList(JSON.parse(JSON.stringify(menuList)))
        ctx.body = utils.success({ data: { menuList, actionList }, msg: 'ok', code: 200 })
    } catch (error) {
        console.log(error);
    }
})

//按钮的权限
function getActionList(menuList) {
    let actionList = []
    const deep = (arr) => {
        while (arr.length) {
            let item = arr.pop()
            if (item.children && item.action) {//一级菜单
                deep(item.children)
            } else if (item.children && !item.action) {//二级菜单
                item.children.map(v => {
                    actionList.push(v.menuCode)
                })
            }
        }
    }
    deep(menuList)
    return actionList
}
//菜单的权限
async function getMenuList(userRole, roleKeys) {
    let rootList = []
    if (userRole == 0) {//管理员
        rootList = await Menu.find({}).lean() || {}
    } else {
        let roleList = await Role.find({ _id: { $in: roleKeys } })
        let permissionList = []
        roleList.map(role => {
            let { checkKeys, halfCheckKeys } = role.permissionList
            permissionList = permissionList.concat([...checkKeys, ...halfCheckKeys])
        })
        permissionList = [...new Set(permissionList)]
        rootList = await Menu.find({ _id: { $in: permissionList } }).lean()
    }
    return utils.TreeMenuList(rootList)
}



//用户列表渲染
router.get('/list', async (ctx) => {
    var { userId, userName, state, type } = ctx.request.query
    console.log(userId, userName, typeof state, type);
    const { page, skipIndex } = utils.pager(ctx.request.query)
    try {
        let params = {};
        if (userId) params.userId = userId;
        if (userName) params.userName = userName;
        if (state && state != 0) params.state = state;
        let query = User.find(params, { _id: 0, userPwd: 0 });
        let list = await query.skip(skipIndex).limit(page.pagesize);
        let total = await User.countDocuments(params)
        ctx.body = utils.success({ list, total })
        if (type == 'dept') {//部门管理页面dialog中获取用户名称
            //在职
            //不分页
            if (state && state == 1) {
                params.state = state
                let res = await User.find(params)
                ctx.body = utils.success(res)
            } else {
                ctx.body = utils.fail('查询错误')
            }
        }
    } catch (error) {
        console.log(error);
    }
})


//用户列表新增&编辑
router.post('/operate', async (ctx, next) => {
    let { userId, userName, userEmail, mobile, state, job, roleList, deptId, active } = ctx.request.body
    console.log('111', userName, userEmail, mobile, state, job, roleList, deptId, active);
    try {
        //新增
        if (active == 'add') {
            //后端表单验证
            if (!userName || !mobile) {
                ctx.body = utils.fail('参数错误')
            }
            //防止重复出现相同电话或邮箱
            let res = await User.findOne({ $or: [{ mobile }, { userEmail }] }, '_id userName userEmail mobile')
            if (res) {
                ctx.body = utils.fail('不能有重复电话或者邮箱')
                return;
            } else {
                //新增
                let doc = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { squence_value: 1 } }, { new: true })
                let userres = new User({
                    userId: doc.squence_value,
                    userName: userName,
                    userPwd: '123456',
                    userEmail: userEmail,
                    mobile: mobile,
                    state: 1,
                    role: 1,
                    roleList: roleList,
                    job: job,
                    deptId: deptId
                })
                await userres.save()
                ctx.body = utils.success('新增成功')
            }

        } else {
            //编辑
            let res = await User.findOneAndUpdate({ userId }, { userName, userEmail, mobile, state, job, roleList, deptId })
            ctx.body = utils.success('更新成功')
        }
    } catch (error) {
        console.log(error);
    }
})

//用户列表删除&批量删除
router.post('/delete', async (ctx) => {
    var { userIds } = ctx.request.body
    try {
        let { modifiedCount } = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
        console.log(modifiedCount);
        ctx.body = utils.success(`删除成功${modifiedCount}条`)
    } catch (error) {
        console.log(error);
    }
})

router.post('/excel', async (ctx) => {
    // 使用sequelize拿到数据库数据
    let res = await User.find({}, { _id: 0, userPwd: 0 })
  
    console.log(res);
    const res2 = JSON.parse(JSON.stringify(res))
    // 将数据转换为Buffer
    let buffer = excel.exportExcel(res2)
    console.log(buffer);
    // 设置content-type请求头
    // ctx.set('Content-Type', 'application/vnd.openxmlformats');
    // // 设置文件名信息请求头
    // ctx.set('Content-Disposition', "attachment; filename=" + encodeURIComponent("文件名") + ".xlsx");
    // // 文件名信息由后端返回时必须设置该请求头,否则前端拿不到Content-Disposition响应头信息
    // ctx.set("Access-Control-Expose-Headers", "Content-Disposition")
    // 将buffer返回给前端
    ctx.body = utils.success(buffer)
  });

//用户验证码
router.get('/captcha', async (ctx) => {
    var cap = svgCaptcha.create({
        size: 4, // 验证码长度
        width: 120, //验证码的宽度
        height: 40, //验证码的高度
        fontSize: 45, //验证码的字体大小
        ignoreChars: "0oO1ilI", // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: "#ddd", // 验证码图片背景颜色
    });
    let img = new Buffer.from(cap.data).toString("base64");
    let base64Img = "data:image/svg+xml;base64," + img;
    let text = cap.text.toLowerCase()
    ctx.session.picCode = text
    ctx.body = utils.success({ code: 200, data: { imgurl: `${base64Img}` }, msg: 'ok' })
})
module.exports = router
