<template>
  <div>
    <div ref="main" style="width: 600px;height:400px"></div>
    <div ref="chartDom" id="maincity" style="width: 100%;height:600px"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import Api from './../api'
import 'echarts-gl';
import { ref, reactive, toRefs, onMounted } from 'vue'
var chartDom = ref();
let buildingsGeoJSON:any = {}
const getecharts=()=>{
  Api.getEcharts().then((res:any)=>{
    buildingsGeoJSON = res as any
    getchearts(buildingsGeoJSON)
  })
}
const getchearts=(buildingsGeoJSON:any)=>{
   var myChart = echarts.init(chartDom.value);
    echarts.registerMap('buildings', buildingsGeoJSON);
    var regions = buildingsGeoJSON.features.map((feature:any)=>{
      return {
        name: feature.properties.name,
        value: Math.max(Math.sqrt(feature.properties.height), 0.1),
        height: Math.max(Math.sqrt(feature.properties.height), 0.1)
      };
    });
    myChart.setOption({
      backgroundColor:"#100C2A",
      series: [
        {
          type: 'map3D',
          map: 'buildings',
          shading: 'realistic',
          realisticMaterial: {
            roughness: 0.6,
            textureTiling: 20,
            detailTexture: '/src/assets/woods.jpg'
          },
          postEffect: {
            enable: true,
            bloom: {
              enable: false
            },
            SSAO: {
              enable: true,
              quality: 'medium',
              radius: 10,
              intensity: 1.2
            },
            depthOfField: {
              enable: false,
              focalRange: 5,
              fstop: 1,
              blurRadius: 6
            }
          },
          groundPlane: {
            show: true,
            color: '#333'
          },
          light: {
            main: {
              intensity: 6,
              shadow: true,
              shadowQuality: 'high',
              alpha: 30
            },
            ambient: {
              intensity: 0
            },
            ambientCubemap: {
              texture: '/src/assets/canyon.hdr',
              exposure: 2,
              diffuseIntensity: 1,
              specularIntensity: 1
            }
          },
          viewControl: {
            minBeta: -360,
            maxBeta: 360
          },
          itemStyle: {
            areaColor: '#666'
          },
          label: {
            color: 'white'
          },
          silent: true,
          instancing: true,
          boxWidth: 200,
          boxHeight: 1,
          data: regions
        }
      ]
    });
  }




let main = ref()
const draw = () => {
  var myChart = echarts.init(main.value);
  // 指定图表的配置项和数据
  var option1 = {
    title: {
      text: 'ECharts 入门示例'
    },
    tooltip: {},
    dataset: {
      source:[['Mon',5,150,1048,'Search Engine'],
              ['Tue',20,230,735,'Direct'],
              ['Wed',36,218,580,'Email'],
              ['Thu',10,135,484,'Union Ads'],
              ['Fri',10,147,300,'Video Ads'],
              ['Sat',20,100,'',''],
              ['Sun','',260,'','']]
    },
    legend: {
      data: ['销量']
    },
    xAxis: {
       type: 'category'
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'line',
        encode:{y:2}
      },
      {
        name: '销量',
        type: 'bar',
        encode:{y:1}
      },
      {
      name: 'Access From',
      type: 'pie',
      radius: '20%',
      encode:{
        itemName:4,
        value:3
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
    ]
  };
  // var option2 = {
  //   xAxis: {
  //     type: 'category',
  //     data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  //   },
  //   yAxis: {
  //     type: 'value'
  //   },
  //   series: [
  //     {
  //       data: [150, 230, 224, 218, 135, 147, 260],
  //       type: 'line'
  //     }
  //   ]
  // };
  // 使用刚指定的配置项和数据显示图表。

  myChart.setOption(option1);
}
onMounted(() => {
  draw()
  getecharts()
})
</script>
<style scoped lang="less"></style>