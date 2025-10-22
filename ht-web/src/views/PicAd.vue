<template>
    <div style="width:800px;height:300px;border:1px solid #000">
        <vueEsign ref="esign" class="mySign" :width="800" :height="300" :border="1" :isCrop="isCrop" :lineWidth="lineWidth"
            :lineColor="lineColor" />
        <span class="dialog-footer">
            <el-button @click="save" type="primary">生成签字图片</el-button>
            <el-button @click="reset">清空画板</el-button>
        </span>
        <img v-if="resultImg" :src="resultImg" alt="Signature Image" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted } from 'vue'
import vueEsign from "vue-esign";
const lineWidth = ref(0);
const lineColor = ref("#000000");
const bgColor = ref("");
const resultImg = ref("");
const isCrop = ref("");
const esign = ref();

// 清空画板
const reset = () => {
    esign.value.reset();
    //   this.$refs.esign.reset();
};
// 保存
const save = () => {
    // 可选配置参数 ，在未设置format或quality属性时可在生成图片时配置 例如： {format:'image/jpeg', quality: 0.5}
    // this.$refs.esign.generate({format:'image/jpeg', quality: 0.5})
    esign.value
        .generate()
        .then((res:any) => {
            //   this.$emit("finsih", res);
            console.log(res);
            resultImg.value = res;
        })
        .catch((err:any) => {
            console.log(err);
            // 画布没有签字时会执行这里 'Not Signned'
            //   this.$message.error("您还未完成签字，请签字完成后保存");
        });
};
</script>
<style scoped lang="less"></style>