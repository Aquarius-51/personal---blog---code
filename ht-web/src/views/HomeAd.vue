<template>
  <div class="home">
    <div class="common-layout">
      <el-container>
        <el-aside :width="isCollapse ? '60px' : '200px'">
          <div class="logo" @click="$router.push('/welcome')">
            <img src="./../assets/logo.png" />
            <h3 class="py-2 text-light-50">汇聚平台</h3>
          </div>
          <el-menu :active-text-color="systeamColor" background-color="#000" class="el-menu-vertical-demo"
            :default-active="$route.path" text-color="#fff" router unique-opened :collapse="isCollapse"
            :collapse-transition="false">
            <tree-menu :userMenu="userMenu"></tree-menu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header>
            <div class="header-height">
              <div>
                <el-icon @click="changeCollspse">
                  <component :is="isCollapse?'Expand':'Fold'"></component>
                </el-icon>
              </div>
              <div>
                <el-icon :class="isRotate ? 'animate-spin' : ''" @click="changeRotate">
                  <Refresh />
                </el-icon>
                <el-icon @click="toggle" class="mx-2">
                  <component :is="isFullscreen?'Aim':'FullScreen'"></component>
                </el-icon>
                <el-switch @change="toggleDark" v-model="value1" :active-action-icon="Moon" :inactive-action-icon="Sunny"
                  style="--el-switch-on-color: #000; --el-switch-off-color: #999" class="mx-2" />

                <el-badge is-dot class="item">
                  <el-icon>
                    <Bell :icon="Share" />
                  </el-icon>
                </el-badge>
                <el-dropdown>
                  <span class="el-dropdown-link">
                    {{ store.userInfo.userName }}
                    <el-icon class="el-icon--right">
                      <arrow-down />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>邮箱： {{ store.userInfo.userEmail }}</el-dropdown-item>
                      <el-dropdown-item @click="drawer2 = true">设置</el-dropdown-item>
                      <el-dropdown-item @click="loginOut">退出</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-drawer v-model="drawer2" :direction="direction">
                  <template #header>
                    <h4>主题</h4>
                  </template>
                  <template #default>
                    <div class="demo-color-block">
                      <span class="demonstration">请选择</span>
                      <el-color-picker v-model="systeamColor" @change="colorChange" />
                    </div>
                  </template>
                  <template #footer>
                    <div style="flex: auto">
                      <el-button @click="cancelClick">取消</el-button>
                      <el-button type="primary" @click="confirmClick">确定</el-button>
                    </div>
                  </template>
                </el-drawer>
              </div>
            </div>
          </el-header>
          <el-main>
            <TreeTab></TreeTab>
            <RouterView></RouterView>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
import Api from './../api'
import TreeMenu from '../components/TreeMenu.vue';
import TreeTab from '../components/TreeTab.vue';
import { Sunny, Moon, Share, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useFullscreen, useDark, useToggle } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'
import { loginStore } from '@/store'
import { useCookies } from '@vueuse/integrations/useCookies'
import { resetRouter } from '@/router'
let cookies = useCookies()
const store = loginStore()
const router = useRouter()
let userMenu = ref([])
let isCollapse = ref(false)//折叠
let isRotate = ref(false)//刷新
const value1 = ref(false)//切换暗黑模式
const drawer2 = ref(false)//切换抽屉
const direction = ref('rtl')//Drawer 打开的方向
const systeamColor = ref('#409EFF')//默认主题
const { isFullscreen, toggle } = useFullscreen()//全屏
// const getmenulist = () => {
//   Api.getMenuList().then((res: any) => {
//     userMenu.value = res
//   })
// }
// getmenulist()

//权限列表
const getmenupermissionlist = () => {
  Api.getMenuPermissionList().then((res: any) => {
    console.log(res);
    let { menuList, actionList } = res.data
    userMenu.value = menuList
    window.sessionStorage.setItem('actionList',JSON.stringify(actionList))
  })
}
getmenupermissionlist()
//切换折叠
const changeCollspse = () => {
  isCollapse.value = !isCollapse.value
}
//刷新
const changeRotate = () => {
  isRotate.value = true
  setTimeout(() => {
    window.location.reload();
  }, 2000)
}
//暗黑模式
//方法一
// const toggleDark = ()=>{
//   document.documentElement.classList.toggle('dark')
// }

//方法二
const isDark = useDark()
const toggleDark = useToggle(isDark)
//退出
const loginOut = () => {
  router.push('/login')
  store.clearUserInfo()
  cookies.remove('tabName')
  resetRouter()
  // setTimeout(()=>{
  //   window.location.reload();
  // },100)
  router.addRoute({
    name: 'HomeAd',
    path: '/',
    redirect: '/login',
    component: () => import('@/views/HomeAd.vue'),
    children: [{
      name: 'WelcomeAd',
      path: '/welcome',
      meta: { title: '首页' },
      component: () => import('@/views/WelcomeAd.vue')
    }]
  }
  )
}
//抽屉主题
// 变量前缀
const colorChange = (e: any) => {
  // e就是选择了的颜色
  const pre = "--el-color-primary";
  const el = document.documentElement;
  console.log('el=>', el);

  el.style.setProperty(pre, e);
}
const cancelClick = () => {
  drawer2.value = false
}
const confirmClick = () => {
  ElMessageBox.confirm(`您确定要关闭吗?`)
    .then(() => {
      drawer2.value = false
    })
    .catch(() => {
      // catch error
    })
}
</script>
<style scoped lang="scss">
.home {
  height: 100vh;
}

.el-container {
  height: 100vh;
}

.el-header {
  text-align: center;
  border-bottom: 1px solid #eee;

  .header-height {
    height: 60px;
    cursor: pointer;
    @apply flex justify-between items-center
  }
}

.el-aside {
  background-color: #000;
  text-align: center;

  .logo {
    display: flex;
    align-items: center;
    font-size: 18px;
    height: 50px;

    img {
      margin: 0 16px;
      width: 32px;
      height: 32px;
    }
  }
}

.el-menu {
  border: 0;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.item {
  margin-top: 0px;
  margin-right: 20px;
}

.el-switch {
  vertical-align: bottom;
}

.el-dropdown {
  vertical-align: text-top;
}

.demo-color-block {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.demo-color-block .demonstration {
  margin-right: 16px;
}

:deep(:focus-visible) {
  outline: none;
}
</style>
  