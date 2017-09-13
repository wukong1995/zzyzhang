var mongoose = require('mongoose');
var BorrowingSchema = require('../schema/borrowing');
var Borrowing = mongoose.model('Borrowing', BorrowingSchema);

module.exports = Borrowing;
