const mongoose = require('mongoose')
const {
	Schema
} = mongoose;

const userSchema = new Schema({
	userName:String,
    userId:Number,
    userPwd:String,
    userEmail:String,
    state:Number,
    mobile:Number,
    role:String,
    job:String,
    sex:String,
    roleList:[],
    deptId:[],
	createTime:{
		 type: Date, default: Date.now 
	},
	lastLoginTime:{
		type: Date, default: Date.now 
	}
});
module.exports = mongoose.model('user', userSchema);