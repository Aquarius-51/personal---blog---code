const mongoose = require('mongoose')
const uploadSchema = mongoose.Schema({
    path: String,
    createTime: {
        type: Date, default: Date.now
    },
    updateTime: {
        type: Date, default: Date.now
    },
})
module.exports = mongoose.model('upload', uploadSchema);