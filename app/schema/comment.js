var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var CommentSchema = new mongoose.Schema({

  createAt: {
    type: Date,
    default: Date.now()
  },
  account: {
    type: ObjectId,
    ref: 'Account'
  },
  remark: String
});

CommentSchema.statics = {
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

module.exports = CommentSchema;
