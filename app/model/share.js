var mongoose = require('mongoose');
var ShareSchema = require('../schema/share');
var Share = mongoose.model('Share', ShareSchema);

module.exports = Share;