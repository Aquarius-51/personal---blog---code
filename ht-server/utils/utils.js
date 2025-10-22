var jwt = require('jsonwebtoken');
let CODE = {
    SUCCESS: 200,
    PARAM_ERROR: 10001, //参数错误
    USER_ACCOUNT_ERROR: 20001, //账号或密码错误
    USER_LOGIN_ERROR: 30001, //用户未登录
    BUSINESS_ERROR: 401, //业务请求失败
    AUTH_ERROR: 50001 //认证失败或TOKEN过期
}
module.exports = {
    pager({ currentPage, pageSize }) {
        const currentpage = currentPage * 1
        const pagesize = pageSize * 1
        const skipIndex = (currentpage - 1) * pagesize
        return {
            page: { currentpage, pagesize }, skipIndex
        }
    },
    TreeMenuList(data) {//非递归
        let reslut = []//返回的数据
        let map = {}//映射的数据
        data.forEach(item => {
            map[item._id] = item
        })
        data.forEach(item => {
            let a = item.parentId.slice().pop()
            let parent = map[a]
            if (parent) {
                (parent.children || (parent.children = [])).push(item);
                if (parent.component == '') {
                    (parent.action || (parent.action = [])).push(item);
                }
            } else {
                reslut.push(item)
            }
        })
        return reslut
    },
    success(data = "", msg = "ok", code = CODE.SUCCESS) {
        return {
            data, msg, code
        }
    },
    fail(data = "", msg = "fail", code = CODE.BUSINESS_ERROR) {
        return {
            data, msg, code
        }
    },
    decoded(Authorization) {
        if (Authorization) {
            let token = Authorization.split(' ')[1]
            return jwt.verify(token, 'lee')
        }
    },
    //时间格式化函数
    formateDate(date, rule) {
        let fmt = rule || 'yyyy-MM-dd hh:mm:ss'
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, date.getFullYear())
        }
        const o = {
            // 'y+': date.getFullYear(),
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                const val = o[k] + '';
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? val : ('00' + val).substr(val.length));
            }
        }
        return fmt;
    },

}