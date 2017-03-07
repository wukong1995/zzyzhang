var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var SALT_WORK_FACTOR = 10;

var BondSchema = new mongoose.Schema({
	name: String,
	code: String,
	purchase: Number,
	// 收益率
	yield: Number,
	// 收益
	income: Number,
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


BondSchema.pre('save', function(next) {
	var _bond = this
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now()
	}
	next();
});


BondSchema.statics = {
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

module.exports = BondSchema