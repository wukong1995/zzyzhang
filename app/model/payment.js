var mongoose = require('mongoose');
var PaymentSchema = require('../schema/payment');
var Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;