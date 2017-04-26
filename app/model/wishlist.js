var mongoose = require('mongoose');
var WishlistSchema = require('../schema/wishlist');
var Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;