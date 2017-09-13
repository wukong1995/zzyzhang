const mongoose = require('mongoose');
const WishlistSchema = require('../schema/wishlist');
const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
