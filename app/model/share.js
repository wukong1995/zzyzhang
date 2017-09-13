const mongoose = require('mongoose');
const ShareSchema = require('../schema/share');
const Share = mongoose.model('Share', ShareSchema);

module.exports = Share;
