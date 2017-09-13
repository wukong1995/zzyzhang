const mongoose = require('mongoose');
const BondSchema = require('../schema/bond');
const Bond = mongoose.model('Bond', BondSchema);

module.exports = Bond;
