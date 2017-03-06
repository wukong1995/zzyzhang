var mongoose = require('mongoose');
var AccountSchema = require('../schema/account');
var Account = mongoose.model('Account', AccountSchema);

module.exports = Account;