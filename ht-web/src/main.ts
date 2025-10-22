import { createApp } from 'vue'
import './style.css'
// @ts-ignore
import App from './App.vue'
import 'virtual:windi.css'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import router from './router'
import vueEsign from 'vue-esign'
const pinia = createPinia()
// console.log('import.meta.env=>',import.meta.env);
const app:any= createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

//自定义指令控制按钮的权限
app.directive('has',{
  mounted(el:any, binding:any){
     let values = binding.value
     let actionList = JSON.parse(window.sessionStorage.getItem('actionList')||'{}')
     let permissionButtonlist = actionList?.includes(values)
     if(!permissionButtonlist){
        el.style.display='none'
        el.remove(el)
     }
  }
})

app.use(pinia).use(router).use(vueEsign).use(ElementPlus, {
  locale: zhCn,
}).mount('#app')
