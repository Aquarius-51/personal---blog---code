import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Api from '@/api'
import utils from '@/utils/utils'
const routes: RouteRecordRaw[] = [{
    name: 'HomeAd',
    path: '/',
    redirect: '/login',
    component: () => import('@/views/HomeAd.vue'),
    children: [{
        name: 'WelcomeAd',
        path: '/welcome',
        meta: { title: '首页' },
        component: () => import('@/views/WelcomeAd.vue')
    },
        // {
        //     name: 'UserAd',
        //     path: '/user',
        //     meta:{title:'用户管理'},
        //     component: () => import('../views/UserAd.vue')
        // },
        // {
        //     name: 'MenuAd',
        //     path: '/menu',
        //     meta:{title:'菜单管理'},
        //     component: () => import('../views/MenuAd.vue')
        // },
        // {
        //     name: 'RoleAd',
        //     path: '/role',
        //     meta:{title:'角色管理'},
        //     component: () => import('../views/RoleAd.vue')
        // },
        // {
        //     name: 'DeptAd',
        //     path: '/dept',
        //     meta:{title:'部门管理'},
        //     component: () => import('@/views/DeptAd.vue')
        // },
        // {
        //     name: 'EchartAd',
        //     path: '/echart',
        //     meta:{title:'图表管理'},
        //     component: () => import('../views/EchartAd.vue')
        // },
        // {
        //     name: 'LeaveAd',
        //     path: '/leave',
        //     meta:{title:'待审批管理'},
        //     component: () => import('../views/LeaveAd.vue')
        // },
        // {
        //     name: 'TogtherAd',
        //     path: '/togther',
        //     meta:{title:'打卡管理'},
        //     component: () => import('../views/TogtherAd.vue')
        // },
        // {
        //     name: 'PicAd',
        //     path: '/pic',
        //     meta:{title:'上传图片'},
        //     component: () => import('../views/PicAd.vue')
        // },
        // {
        //     name: 'ApproveAd',
        //     path: '/approve',
        //     meta:{title:'审批管理'},
        //     component: () => import('../views/ApproveAd.vue')
        // },
        // {
        //     name: 'TrackAd',
        //     path: '/track',
        //     meta:{title:'行驶轨迹'},
        //     component: () => import('../views/TrackAd.vue')
        // }
    ]
},
{
    name: 'LoginAd',
    path: '/login',
    meta:{title:'登录页'},
    component: () => import('../views/LoginAd.vue')
},
{
    name: '404Ad',
    path: '/404',
    meta:{title:'Not Found'},
    component: () => import('../views/404Ad.vue')
}
]
//异步路由 动态路由
async function loadAsyncRoutes() {
    const userInfo: string = window.sessionStorage.getItem('userinfo') || '{}'
    const { token } = JSON.parse(userInfo)
    if (token) {
        let res = await Api.getMenuPermissionList()
        const { menuList } = res.data
        let routeList:any = utils.generatorRoutes(menuList)
        const modules = import.meta.glob('../views/*.vue')
        console.log(modules);
        
        routeList.map((route:any)=>{
            let url = `../views/${route.name}.vue`
            route.component = modules[url]
            router.addRoute('HomeAd',route)
        })

    }else {
        return;
        
    }


}

const router = createRouter({
    routes,
    history: createWebHashHistory()
})
export function resetRouter(){
    let routeslist = router.getRoutes()
    console.log(routeslist);
    routeslist.map((item:any)=>{
        if(!['LoginAd','404Ad'].includes(item.name)){
            router.removeRoute(item.name)
        }
    })
}


//前置导航守卫
router.beforeEach(async (to, _from, next) => {
    const userInfo: string = window.sessionStorage.getItem('userinfo') || '{}'
    const { token } = JSON.parse(userInfo)
   if(to.name){
     document.title = to.meta.title as string
    if (!token && to.name != 'LoginAd') {
        next('/login')
    } else {
        next()
    }
   }else {
        // 这个时候你还有添加动态路由，所以你跳转到没有权限的页面，是没有to.name这时候你才开始加载loadAsyncRoutes()
      await loadAsyncRoutes()
      let curRoute = router.getRoutes().filter(v=>v.path==to.path)
      if(curRoute?.length){ //相当于curRoute存在并curRoute.length也存在
         next({...to,replace:true})//终止当前导航，跳转到新的导航
      }else {
        next('/404')
      }
   }

})
export default router