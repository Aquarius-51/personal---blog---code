const router = require('koa-router')()
const Leave = require('../model/leaveSchema.js')
const Dept = require('../model/deptSchema.js')
const utils = require('../utils/utils.js')
router.prefix('/leaves')

//审批休假列表渲染
router.get('/list', async (ctx) => {
    // "1": "待审批", // "2": "审批中", // "3": "审批通过",// "4": "审批拒绝",// "5": "作废"
    // 0.获取当前登录人的信息 由此可得到部门信息
    // 1.判断你是管理者还是普通员工
    // 2.如果你是管理者，你只能看到你自己的申请以及你下面员工的申请
    // 3.如果你是普通员工，你只能看到你自己的申请
    // 4.查询分页返回
    const { applyState, type } = ctx.request.query
    const authorization = ctx.request.header.authorization
    let data = utils.decoded(authorization)//当前登录人信息
    const { page, skipIndex } = utils.pager(ctx.request.query)//分页
    let params = {}
    try {
        // 1.判断你是管理者还是普通员工
        if (type == 'approve') {
            // 2.如果你是管理者，你只能看到你自己的申请以及你下面员工的申请
            if (applyState == 1 || applyState == 2) {// "1": "待审批", // "2": "审批中"
                // params.$or = [{applyState:1},{applyState:2}]
                params.curAuditUserName = data.userName
                params.applyState = applyState
            } else if (applyState > 2) {// "3": "审批通过",// "4": "审批拒绝",// "5": "作废"
                // 2.如果你是管理者，你只能看到你自己的申请以及你下面员工的申请
                params = { "auditFlows.userId": data.userId, applyState }
            } else {
                params = { "curAuditUserName": data.userName }
            }
        } else {
            // 3.如果你是普通员工，你只能看到你自己的申请
            params = { "applyUser.userId": data.userId }//查询自己的数据
            if (applyState) {
                params.applyState = applyState//自己的数据的各种请假状态
            }
        }
        
        let query = Leave.find(params)
        let list = await query.skip(skipIndex).limit(page.pagesize);
        let total = await Leave.countDocuments(params)
        ctx.body = utils.success({ list, total })
    } catch (error) {
        console.log(error);
    }
})


//审批休假列表创建&作废
router.post('/operate', async (ctx, next) => {
    // "1": "待审批", // "2": "审批中", // "3": "审批通过",// "4": "审批拒绝",// "5": "作废"
    const { _id, action, ...params } = ctx.request.body
    const authorization = ctx.request.header.authorization
    let data = utils.decoded(authorization)
    params.applyState = 1//待审批
    if (action == 'create') {
        let total = await Leave.countDocuments()
        let orderNo = 'XJ' + utils.formateDate(new Date(), 'yyMMdd') + total
        params.orderNo = orderNo
        applyUser = {//当前提交人
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail
        }
        console.log('applyUser', applyUser);
        if (data.deptId.length == 2) {//中层领导登录
            var id = data.deptId[0]
        } else {
            var id = data.deptId[data.deptId.length - 2]//中层领导下的员工
        }
        let dept = await Dept.findById(id)
        let curAuditUserName = dept.userName//当前审批人
        let auditUsers = dept.userName//审批人中的第一个审批人
        let auditFlows = [{
            userId: dept.userId,
            userName: dept.userName,
            userEmail: dept.userEmail
        }]//审批流
        let userList = await Dept.find({ deptName: { $in: ['财务部门', '人事部门'] } })
        let temp = userList[0]//财务部门
        userList[0] = userList[1]
        userList[1] = temp
        userList.map(item => {
            auditFlows.push({
                userId: item.userId,
                userName: item.userName,
                userEmail: item.userEmail
            })
            auditUsers += ',' + item.userName
        })
        let auditLogs = []//审批日志 不审批不产生日志
        params.curAuditUserName = curAuditUserName
        params.auditFlows = auditFlows
        params.auditUsers = auditUsers
        params.applyUser = applyUser
        params.createTime = new Date()
        params.auditLogs = auditLogs
        let res = await Leave.create(params)
        ctx.body = utils.success({ data: '申请成功', msg: 'ok', code: 200 })
    } else {
        // 作废
        console.log('ID', _id);
        params.applyState = 5
        let res = await Leave.findByIdAndUpdate(_id, params)
        ctx.body = utils.success({ data: '作废成功', msg: 'ok', code: 200 })
    }
})

//审批休假通过/作废
router.post('/approve', async (ctx) => {
    // "1": "待审批", // "2": "审批中", // "3": "审批通过",// "4": "审批拒绝",// "5": "作废"  
    const { _id, action, remark } = ctx.request.body
    console.log(' _id, action, remark', _id, action, remark);
    const authorization = ctx.request.header.authorization
    let data = utils.decoded(authorization)
    let params = {}
    let doc = await Leave.findById(_id)
    try {
        //1.审批驳回
        if (action == 'refuse') {
            params.applyState = 4
            let res = await Leave.findByIdAndUpdate(_id, params)
            ctx.body = utils.success({ data: '驳回成功', msg: 'ok', code: 200 })
        } else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
            //2.审批通过 不管是审批中还是全部通过 审批日志都要增加
            //(1.审批全部通过 doc.auditFlows.length==doc.auditLogs.length+1 相等于三个审核人都走了一遍)
            params.applyState = 3
            doc.auditLogs.push({
                userId: data.userId,
                userName: data.userName,
                action: action,//审批通过或者拒绝
                remark: remark,//备注
                createTime: utils.formateDate(new Date())//申请时间    
            })
            params.auditLogs = doc.auditLogs
            let res = await Leave.findByIdAndUpdate(_id, params)
            ctx.body = utils.success({ data: '审核成功', msg: 'ok', code: 200 })
        } else if (doc.auditFlows.length > doc.auditLogs.length) {
            //2.审批通过
            //(2.当前审批通过 下一位继续审批  审批中)
            params.applyState = 2
            params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1].userName
            doc.auditLogs.push({
                userId: data.userId,
                userName: data.userName,
                action: action,//审批通过或者拒绝
                remark: remark,//备注
                createTime: utils.formateDate(new Date())//申请时间    
            })
            params.auditLogs = doc.auditLogs
            console.log('params', params);
            let res = await Leave.findByIdAndUpdate(_id, params)
            ctx.body = utils.success({ data: '审核成功', msg: 'ok', code: 200 })
        }
    } catch (error) {
        console.log(error);
    }
})
module.exports = router
