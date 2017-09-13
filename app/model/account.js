const mongoose = require('mongoose');
const AccountSchema = require('../schema/account');
const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
