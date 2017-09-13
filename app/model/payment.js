const mongoose = require('mongoose');
const PaymentSchema = require('../schema/payment');
const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
