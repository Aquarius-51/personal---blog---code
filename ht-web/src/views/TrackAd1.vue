<template>
  <div>
    <div id="container"></div>
    <div class="input-card">
      <h4>轨迹回放控制</h4>
      <div class="input-item">
        <input type="button" class="btn" value="开始动画" id="start" @click="startAnimation()" />
        <input type="button" class="btn" value="暂停动画" id="pause" @click="pauseAnimation()" />
      </div>
      <div class="input-item">
        <input type="button" class="btn" value="继续动画" id="resume" @click="resumeAnimation()" />
        <input type="button" class="btn" value="停止动画" id="stop" @click="stopAnimation()" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, shallowRef } from 'vue'
import AMapLoader from "@amap/amap-jsapi-loader";
// @ts-ignore
window._AMapSecurityConfig = {
  securityJsCode: "130557785659f998a374ed4bd1881392",
};
let map = shallowRef()
let level = ref(12)//地图德放大等级
// var marker: any, lineArr: any = [[116.478935, 39.997761], [116.478939, 39.997825], [116.478912, 39.998549], [116.478912, 39.998549], [116.478998, 39.998555], [116.478998, 39.998555], [116.479282, 39.99856], [116.479658, 39.998528], [116.480151, 39.998453], [116.480784, 39.998302], [116.480784, 39.998302], [116.481149, 39.998184], [116.481573, 39.997997], [116.481863, 39.997846], [116.482072, 39.997718], [116.482362, 39.997718], [116.483633, 39.998935], [116.48367, 39.998968], [116.484648, 39.999861]];
var marker:any,lineArr:any = [[116.478935, 39.997761],
                [116.478939, 39.997825],
                [116.478912, 39.998549],
                [116.478912, 39.998549],
                [116.478998, 39.998555],
                [116.478998, 39.998555],
                [116.479282, 39.99856],
                [116.479658, 39.998528],
                [116.480151, 39.998453],
                [116.480784, 39.998302],
                [116.480784, 39.998302],
                [116.481149, 39.998184],
                [116.481573, 39.997997],
                [116.481863, 39.997846],
                [116.482072, 39.997718],
                [116.482362, 39.997718],
                [116.483633, 39.998935],
                [116.48367, 39.998968],
                [108.983569, 34.285675],
                [106.205794, 38.458831],
                [111.761777, 40.875595],
                [103.85094, 35.987496]]
//初始化地图
const initMap = () => {
  AMapLoader.load({
    key: "32c62e29392fb04afb250830369af524", //申请好的 Web 端开发者 Key，首次调用 load 时必填
    version: "2.0", //指定要加载的 JS API 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Scale", "AMap.ToolBar", "AMap.HawkEye", "AMap.ControlBar"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['AMap.Scale','...','...']
  })
    .then((AMap: any) => {
      map.value = new AMap.Map("container", {
        viewMode: '3D', //默认使用 2D 模式
        zoom: 18, //地图级别
        mapStyle: "amap://styles/light", //设置地图的显示样式
        center: [116.407387, 39.904179], //地图中心点
      }); //"container"为 <div> 容器的 id
      var scale = new AMap.Scale();
      var toolbar = new AMap.ToolBar({
        position: {
          top: '110px',
          right: '40px'
        }
      });
      var hawkeye = new AMap.HawkEye();
      var controlbar = new AMap.ControlBar()
      map.value.addControl(scale);
      map.value.addControl(toolbar);
      map.value.addControl(hawkeye);
      map.value.addControl(controlbar);
      AMap.plugin('AMap.MoveAnimation', () => {
        marker = new AMap.Marker({
          map: map.value,
          position: [116.478935, 39.997761],
          icon: "https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png",
          offset: new AMap.Pixel(-13, -26),
        });

        // 绘制轨迹
        var polyline = new AMap.Polyline({
          map: map.value,
          path: lineArr,
          showDir: true,
          strokeColor: "#28F",  //线颜色
          // strokeOpacity: 1,     //线透明度
          strokeWeight: 6,      //线宽
          // strokeStyle: "solid"  //线样式
        });

        var passedPolyline = new AMap.Polyline({
          map: map.value,
          strokeColor: "#AF5",  //线颜色
          strokeWeight: 6,      //线宽
        });


        marker.on('moving', function (e: any) {
          passedPolyline.setPath(e.passedPath);
          map.value.setCenter(e.target.getPosition(), true)
        });

        map.value.setFitView();


      });
    })
    .catch((e: any) => {
      console.log(e);
    });
}

const startAnimation = () => {
  marker.moveAlong(lineArr, {
    // 每一段的时长
    duration: 500,//可根据实际采集时间间隔设置
    // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
    autoRotation: true,
  });
};

const pauseAnimation = () => {
  marker.pauseMove();
};

const resumeAnimation = () => {
  marker.resumeMove();
};

const stopAnimation = () => {
  marker.stopMove();
};
onMounted(() => {
  initMap()

})
</script>
<style scoped lang="scss">
@import url('https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css');

#container {
  width: 100%;
  height: 800px;
}
</style>