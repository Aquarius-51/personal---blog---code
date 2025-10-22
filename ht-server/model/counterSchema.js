const mongoose = require('mongoose')
const {
	Schema
} = mongoose;

const counterSchema = new Schema({
	_id:String,
    squence_value:Number
});
module.exports = mongoose.model('counter', counterSchema);