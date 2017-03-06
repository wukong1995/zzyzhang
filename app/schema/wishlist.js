var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var WishlistSchema = new mongoose.Schema({
	name: String,
	price: Number,
	// 1 饮食 服装 交通 水电 通讯 日用品 旅游 保险 其他
	product_type: String,
	remark: String,
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


WishlistSchema.pre('save', function(next) {
	var _wishlist = this
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now()
	}
})

WishlistSchema.statics = {
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

module.exports = WishlistSchema