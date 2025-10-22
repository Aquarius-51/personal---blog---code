const mongoose = require('mongoose')
const {
	Schema
} = mongoose;

const roleSchema = new Schema({
	roleName:String,
    remark:String,
    permissionList:{
          checkKeys:[],//全选 按钮
          halfCheckKeys:[]//半选 菜单
    },
	createTime:{
		 type: Date, default: Date.now 
	},
	updateTime:{
		type: Date, default: Date.now 
	}
});
module.exports = mongoose.model('role', roleSchema);