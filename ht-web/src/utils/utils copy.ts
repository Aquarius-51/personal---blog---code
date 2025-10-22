/**
 * 工具函数封装
 */
export default {
    formateDate(date: any, rule?: any) {
        let fmt = rule || 'yyyy-MM-dd hh:mm:ss'
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, date.getFullYear())
        }
        const o: any = {
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
    // generatorRoutes(menuList: any) {
    //     let routes: any = [];
    //     const deepList = (list: any) => {
    //         while (list.length) {
    //             let item = list.pop()
    //             if (item.action) {
    //                 routes.push({
    //                     name: item.component,
    //                     path: item.path,
    //                     meta: {
    //                         title: item.menuName
    //                     },
    //                     component: item.component
    //                 })
    //             } else {
    //                 if (item.children && !item.action) {
    //                     deepList(item.children)
    //                 }
    //             }
    //         }
    //     }
    //     deepList(menuList)
    //     return routes;
    // }
    generatorRoutes(menuList: any) {
        let routes:any = []
        const deep = (arr: any) => {
            while (arr.length) {
                let item = arr.pop()
                if (item.children && item.action) {//一级
                    deep(item.children)
                } else if (item.children && !item.action) {//二级
                    routes.push({
                        name: item.component,
                        path:item.path,
                        meta: { title: item.menuName },
                        component: item.component
                    })
                }
            }
        }
        deep(JSON.parse(JSON.stringify(menuList)))
        console.log(routes);
        
        return routes
    }
}