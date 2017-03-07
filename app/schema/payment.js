var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var PaymentSchema = new mongoose.Schema({
	name: String,
	price: Number,
	// 0 收入
	// 1 支出
	type: Number,
	// 0 奖金 工资 其他
	// 1 饮食 服装 交通 水电 通讯 日用品 旅游 保险 其他
	product_type: String,
	remrk: String,
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	},
	account: {
		type: ObjectId,
		ref: 'Account'
	}
})


PaymentSchema.pre('save', function(next) {
	var _payment = this
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now()
	}
	next();
});

PaymentSchema.statics = {
	fetch: function(cb) {
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	},
	findById: function(id, cb) {
		return this
			.findOne({
				_id: id
			})
			.exec(cb)
	},
}

module.exports = PaymentSchema