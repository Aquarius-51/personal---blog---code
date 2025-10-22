<template>
    <div>
        <div id="my-container">
            <el-tabs v-model="editableTabsValue" type="card" closable @tab-change="handleTabsChange"
                @tab-remove="handleTabsRemove">
                <el-tab-pane v-for="item in editableTabs" :label="item.title" :name="item.path">
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted } from 'vue'
import type { TabPaneName } from 'element-plus'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useDraggable } from 'vue-draggable-plus'
let router = useRouter()
let route = useRoute()
let cookies = useCookies()
const editableTabsValue = ref(route.path)//聚焦
const editableTabs = ref([
    {
        title: '首页',
        path: '/welcome',
    }
])

//点击左侧菜单触发该方法
onBeforeRouteUpdate((to, _from) => {
    addTab({
        title: to.meta.title,
        path: to.path,
    })
})

//新增tab
const addTab = (targetName: any) => {
    console.log('targetName', targetName);
    let numtab = editableTabs.value.findIndex(v => {
        editableTabsValue.value = targetName.path
        return v.path == targetName.path
    })
    console.log(numtab);
    if (numtab == -1) {
        editableTabsValue.value = targetName.path
        editableTabs.value.push(targetName)
        cookies.set('tabName', editableTabs.value)
    }
}
//点击tab切换
const handleTabsChange = (targetName: any) => {
    router.push(targetName)
}
//初始化tab
const initTab = () => {
    let tabname = cookies.get('tabName')
    editableTabs.value = tabname || editableTabs.value
}
initTab()

//移除tab
const handleTabsRemove = (targetName: TabPaneName | undefined) => {
    const tabs = editableTabs.value
    let activeName = editableTabsValue.value
    if (activeName === targetName) {
        tabs.forEach((tab, index) => {
            if (tab.path === targetName) {
                const nextTab = tabs[index + 1] || tabs[index - 1]
                if (nextTab) {
                    activeName = nextTab.path
                    router.push(activeName)
                }
            }
        })
    }
    editableTabsValue.value = activeName
    editableTabs.value = tabs.filter((tab) => tab.path !== targetName)
    cookies.set('tabName', editableTabs.value)
}

useDraggable('#my-container .el-tabs__nav', editableTabs, {
    animation: 1000,
    onStart() {
        console.log('start')
    },
    onUpdate() {
        console.log('update list2')
    },
})

</script>
<style></style>