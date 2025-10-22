const xlsx = require("node-xlsx")
// data为需要导出的数据,格式为[{name:"张三",age:18},{name:"李四",age:20}]
// options为设置导出excel文件的样式需要设置查询node-xlsx
module.exports = {
    exportExcel(data,options){
        // const _headers = ['姓名'];
        let xlsxObj = [
          {
            name: "sheet",
            data: []
          }
        ]
        // xlsxObj[0].data.unshift(_headers);
        data.forEach((item,idx) => {
          if(idx === 0){
              // 第一行为表头 这里可以使用两种：第一种是表的
            //xlsxObj[0].data.push(["名称", "发送人", "消息", "发送时间", "消息类型"])
            xlsxObj[0].data.push(Object.keys(item))
          }
          // 其余行为excel数据
          xlsxObj[0].data.push(Object.values(item))
        });
        //表样式
        options= {'!cols': [{wch: 24}, {wch: 20}, {wch: 100}, {wch: 20}, {wch: 10}]};
        // 返回一个buffer对象
        return xlsx.build(xlsxObj,options)
      }
}