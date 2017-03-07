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
			title: '详情页',
			wishlist: wishlist
		})
	});
};

exports.list = function(req, res) {
	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.p ? parseInt(req.query.p) : 1;
	var count = 10;
	var totalPage = 1;
	var user = req.session.user;

	User.findOne({
			_id: user._id
		}).populate({
			path: 'wishlist'
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			var index = (page - 1) * count;
			totalPage = Math.ceil(user.wishlist.length / count);
			var results = user.wishlist.slice(index, index + count);
			console.log(results)

			// 渲染视图模板
			res.render('wishlist/list', {
				title: '列表页',
				wishlist: results || [],
				currentPage: page,
				totalPage: totalPage,
				user: user
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('wishlist/add', {
		title: '新增页',
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
			title: '编辑页',
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
		_wishlist = new wishlist(wishlistObj);

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
					res.redirect('/wishlist/detail/' + food._id);
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
				console.log(err)
			} else {
				res.json({
					success: 1
				})
			}
		})
	}
}

exports.buy = function(req, res) {
	var id = req.query.id;
	if (id) {
		Wishlist.remove({
			_id: id
		}, function(err, wishlist) {
			if (err) {
				console.log(err)
			} else {
				wishlist.type = 1;
				var _payment = new payment(wishlist);
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
								console.log(err)
							}
							res.redirect('/payment/detail/' + payment._id);
						});
					});
				});
			}
		})
	}
}