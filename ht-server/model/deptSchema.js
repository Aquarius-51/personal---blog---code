const mongoose = require('mongoose')
const {
	Schema
} = mongoose;

const deptSchema = new Schema({
    deptId:[mongoose.Types.ObjectId],
    deptName: String,
    userId:String,
    userName: String,
    userEmail: String,
    userName2: String,
    userEmail2: String,
	createTime:{
		 type: Date, default: Date.now 
	},
    updateTime: {
        type: Date, default: Date.now
    },
    remark:String
});
module.exports = mongoose.model('dept', deptSchema);