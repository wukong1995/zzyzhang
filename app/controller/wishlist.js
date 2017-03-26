var _ = require('underscore')
var mongoose = require('mongoose');
var Wishlist = require('../model/wishlist');
var User = require('../model/account');
var Payment = require('../model/payment');

exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	Wishlist.findById(id, function(err, wishlist) {
		res.render('wishlist/detail', {
			title: '心愿详情页',
			wishlist: wishlist
		})
	});
};

exports.list = function(req, res) {
	var user = req.session.user;
	res.render('wishlist/list', {
		title: '心愿列表页',
		user: user
	});
};

exports.result = function(req, res) {

	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.body.page ? parseInt(req.body.page) : 1;
	var start = req.body.start ? parseInt(req.body.start) : 0;
	var limit = req.body.limit ? parseInt(req.body.limit) : 15;
	var keyword = req.body.keyword ? req.body.keyword : '';

	var totalCount = 0;
	var user = req.session.user;

	User.findOne({
			_id: user._id
		}).populate({
			path: 'wishlist',
			select: 'name product_type price meta',
			match: {
				name: new RegExp(keyword, "i")
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			totalCount = user.wishlist.length;
			var results = user.wishlist.slice(start, start + limit);
			res.json({
				wishlist: results || [],
				totalCount: totalCount
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('wishlist/add', {
		title: '心愿新增页',
		wishlist: {
			name: '',
			price: ''
		}
	})
};

exports.edit = function(req, res) {
	var id = req.params.id

	Wishlist.findById(id, function(err, wishlist) {
		res.render('wishlist/add', {
			title: '心愿编辑页',
			wishlist: wishlist
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.wishlist._id;
	var wishlistObj = req.body.wishlist;
	var _wishlist;

	if (id) {
		Wishlist.findById(id, function(err, wishlist) {
			if (err) {
				console.log(err)
			}
			_wishlist = _.extend(wishlist, wishlistObj);
			_wishlist.save(function(err, wishlist) {
				if (err) {
					console.log(err)
				}
				// 重定向请求
				res.redirect('/wishlist/detail/' + wishlist._id)
			})
		})
	} else {
		var user_id = req.session.user._id;
		wishlistObj.account = user_id;
		_wishlist = new Wishlist(wishlistObj);

		_wishlist.save(function(err, wishlist) {
			if (err) {
				console.log(err);
			}

			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
				}
				user.wishlist.push(wishlist._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err)
					}
					res.redirect('/wishlist/detail/' + wishlist._id);
				});
			});

		});
	}
}

exports.del = function(req, res) {
	var id = req.query.id;
	if (id) {
		Wishlist.remove({
			_id: id
		}, function(err, wishlist) {
			if (err) {
				console.log(err);
				res.json({
					success: 0
				});
			} else {
				res.json({
					success: 1
				});
			}
		});
	}
}

exports.buy = function(req, res) {
	var id = req.query.id;
	var user_id = req.session.user._id;
	if (id) {
		Wishlist.remove({
			_id: id
		}, function(err, wishlist) {
			if (err) {
				console.log(err)
			} else {
				wishlist.type = 1;
				var _payment = new Payment(wishlist);
				_payment.save(function(err, payment) {
					if (err) {
						console.log(err);
					}

					User.findById(user_id, function(err, user) {
						if (err) {
							console.log(err);
						}
						user.payment.push(payment._id);
						user.save(function(err, user) {
							if (err) {
								console.log(err);
								res.json({
									success: 0
								});
							} else {
								res.json({
									success: 1
								});
							}
						});
					});
				});
			}
		});
	}
}