var mongoose = require('mongoose');
var AssetSchema = require('../schema/assets');
var Asset = mongoose.model('Asset', AssetSchema);

module.exports = Asset;