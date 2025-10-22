const mongoose = require('mongoose')
const {
	Schema
} = mongoose;

const leaveSchema = new Schema({
	orderNo:String,//订单号
    allTime:[String],//休假时间
    leaveTime:String,//休假时长
    applyType:{//休假类型
      default:1,
      type:Number
    },
    applyState:{//审批类型
        default:1,
        type:Number
    },
    reasons:String,//休假原因
	createTime:{//申请时间
		 type: Date, default: Date.now 
	},
    applyUser:{//提交人
        userId: String,
        userName: String,
        userEmail: String
    },
	auditUsers:String,//审批人 分为三个 当前审批人 人事主管 财务主管
    curAuditUserName:String,//当前审批人
    //审批流
    auditFlows:[{
        userId: String,
        userName: String,
        userEmail: String
    }],
    //审批日志
    auditLogs:[{
        userId: String,
        userName: String,
        action:String,//审批通过或者拒绝
        remark:String,//备注
        createTime:{//申请时间
            type: Date, default: Date.now 
       },
    }]

});
module.exports = mongoose.model('leaves', leaveSchema);