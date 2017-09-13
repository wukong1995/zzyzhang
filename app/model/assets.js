var mongoose = require('mongoose');
var AssetsSchema = require('../schema/assets');
var Assets = mongoose.model('Assets', AssetsSchema);

module.exports = Assets;
