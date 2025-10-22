const mongoose = require('mongoose')
const {
	Schema
} = mongoose;

const menuSchema = new Schema({
    parentId:[mongoose.Types.ObjectId],
    menuType:Number,
    icon:String,
    menuName: String,
    path: String,
    component: String,
    menuCode:String,
    menuState: Number,
	createTime:{
		 type: Date, default: Date.now 
	},
    updateTime: {
        type: Date, default: Date.now
    },
    remark:String
});
module.exports = mongoose.model('menu', menuSchema);