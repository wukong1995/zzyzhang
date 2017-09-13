const mongoose = require('mongoose');
const BorrowingSchema = require('../schema/borrowing');
const Borrowing = mongoose.model('Borrowing', BorrowingSchema);

module.exports = Borrowing;
