<template>
  <template v-for="(item,index) in userMenu" :key="index">
    <!-- 多个菜单 -->
        <el-sub-menu :index="item.path" v-if="item.children&&item.children.length>0&&item.children[0].menuType==1">
          <template #title>
            <el-icon v-if="item.icon">
                 <!-- 动态组件 -->
                <component :is="item.icon"></component>
            </el-icon>
           
            <span>{{ item.menuName }}</span>
          </template>
           <!-- 这里要使用递归组件 -->
           <TreeMenu :userMenu="item.children"></TreeMenu>
        </el-sub-menu>

        <!-- 单个菜单 -->
        <el-menu-item :index="item.path" v-else>
          <el-icon v-if="item.icon">
             <!-- 动态组件 -->
             <component :is="item.icon"></component>
          </el-icon>
          <span>{{ item.menuName }}</span>
        </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted} from 'vue'
defineProps(['userMenu'])
</script>
<style scoped lang="less">
</style>