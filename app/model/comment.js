const mongoose = require('mongoose');
const CommentSchema = require('../schema/comment');
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
