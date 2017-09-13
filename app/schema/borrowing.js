var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var BorrowingSchema = new mongoose.Schema({
  other: String,
  telphone: Number,
  price: String,
  // 0 借出
  // 1 借入
  type: Number,
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
});


BorrowingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

BorrowingSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb);
  },
  findById: function(id, cb) {
    return this
      .findOne({
        _id: id
      })
      .exec(cb);
  },
};

module.exports = BorrowingSchema;
