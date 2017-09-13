var mongoose = require('mongoose');
var BondSchema = require('../schema/bond');
var Bond = mongoose.model('Bond', BondSchema);

module.exports = Bond;
