const mongoose = require('mongoose');
const AssetsSchema = require('../schema/assets');
const Assets = mongoose.model('Assets', AssetsSchema);

module.exports = Assets;
