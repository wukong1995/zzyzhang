var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var SALT_WORK_FACTOR = 10;

var AccountSchema = new mongoose.Schema({
	name: {
		unique: true,
		type: String
	},
	password: String,
	telphone: String,
	email: String,

	Head_portrait: String,
	real_name: String,
	// 1男2女
	sex: Number,
	birth: Date,
	signature: String,

	// 0:normal user
	// 1:verified user
	// professonal user
	// 
	// >10:super admin
	// >50:super super admin
	// 
	role: {
		type: Number,
		default: 0
	},
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
	// 0:正常
	// 1:冻结
	state: {
		type: Number,
		default: 0
	},
	payment: [{
		type: ObjectId,
		ref: 'Payment'
	}],
	share: [{
		type: ObjectId,
		ref: 'Share'
	}],
	bond: [{
		type: ObjectId,
		ref: 'Bond'
	}],
	borrowing: [{
		type: ObjectId,
		ref: 'Borrowing'
	}],
	wishlist: [{
		type: ObjectId,
		ref: 'Wishlist'
	}],
	assets: [{
		type: ObjectId,
		ref: 'Assets'
	}]
})


AccountSchema.pre('save', function(next) {
	var _account = this;
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now()
	}

	// 加盐
	// var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR)
	// this.password = bcrypt.hashSync(this.password, salt)

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) {
			return next(err);
		}
		bcrypt.hash(_account.password, salt, function(err, hash) {
			if (err) {
				return next(err);
			}
			_account.password = hash;
			return next();
		}, null);
	})
})

AccountSchema.methods = {
	comparePassword: function(_password, cb) {

		bcrypt.compare(_password, this.password, function(err, isMatch) {

			if (err) {
				return cb(err);
			}
			return cb(null, isMatch);
		})
	},
}

AccountSchema.statics = {
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

module.exports = AccountSchema