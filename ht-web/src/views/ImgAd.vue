<template>
  <div v-for="(item, index) in images" :key="index" class="upload">
    <img :src="item.path" alt="path" class="upload-img">
  </div>
  <el-upload class="upload-demo" drag action="/api/uploads/img" :headers="getHeaders" multiple name="avatar"
    :on-success="onSuccess">
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        jpg/png files with a size less than 500kb
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import Api from "./../api";
import { ref, onMounted, reactive } from 'vue';
let data: any = window.sessionStorage.getItem('userinfo')
let { token = "" } = JSON.parse(data)
const getHeaders = reactive({
  Authorization: 'Bearer ' + token
})
let images = ref<any>([])
const onSuccess = () => {
  Api.uploadImg().then((res: any) => {
    console.log(res);
    images.value = res
  })
}
onMounted(() => {
  onSuccess()
})
</script>
