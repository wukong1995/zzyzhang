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
	var page = req.query.page ? parseInt(req.query.page) : 1;
	var start = req.query.start ? parseInt(req.query.start) : 0;
	var limit = req.query.limit ? parseInt(req.query.limit) : 15;
	var keyword = req.query.keyword ? req.query.keyword : '';

	var totalCount = 0;
	if (req.session.user) {
		var userId = req.session.user._id;
	} else {
		var userId = req.headers['token'];
	};

	User.findOne({
			_id: userId
		}).populate({
			path: 'wishlist',
			select: 'name product_type price meta',
			match: {
				name: new RegExp(keyword, "i")
			},
			options: {
				sort: {
					'meta.createAt': -1
				}
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			totalCount = user.wishlist.length;
			var results = user.wishlist.slice(start, start + limit);
			res.json({
				page: (page + 1),
				data: results || [],
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
	if (!req.query || !req.query.id) {
		res.json({
			success: 0,
			msg: '无传递参数id'
		});
		return;
	}

	var id = req.query.id;

	if (req.session.user) {
		var user_id = req.session.user._id;
	} else {
		var user_id = req.headers['token'];
	}

	Wishlist.remove({
		_id: id
	}, function(err, wishlist) {
		if (err) {
			console.log(err);
			res.json({
				success: 0
			});
		} else {
			User.update({
					_id: user_id
				}, {
					"$pull": {
						payment: id
					}
				})
				.exec(function(err, user) {
					if (err) {
						console.log(err);
						res.json({
							error_code: 1,
							success: 0,
							msg: '数据未查询到用户'
						});
						return;
					}
					res.json({
						error_code: 0,
						success: 1
					});
				});
		}
	});
}

exports.buy = function(req, res) {
	var id = req.query.id;
	var user_id = req.session.user._id;
	if (id) {
		Wishlist.findById(id, function(err, wishlist) {
			Wishlist.remove({
				_id: id
			}, function(err, result) {
				if (err) {
					console.log(err)
				} else {

					var payment = {
						type: 1,
						name: wishlist.name,
						price: wishlist.price,
						product_type: wishlist.product_type,
						remark: wishlist.remark,
						account: wishlist.account
					};
					console.log(payment)

					var _payment = new Payment(payment);
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
		});
	}
}

// App详情
exports.detailMO = function(req, res) {
	if (!req.params || !req.params.id) {
		res.json({
			success: 0,
			msg: '无传递参数id'
		});
	}
	Wishlist.findById(req.params.id, function(err, wishlist) {
		res.json({
			data: wishlist,
			success: 1
		});
	});
};

// App保存
exports.saveMO = function(req, res) {
	var wishlistObj = req.body;
	var _wishlist;

	var user_id = req.headers['token'];
	wishlistObj.account = user_id;
	_wishlist = new Wishlist(wishlistObj);

	_wishlist.save(function(err, wishlist) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				msg: '数据库保存出错'
			});
		}

		User.findById(user_id, function(err, user) {
			if (err) {
				console.log(err);
				res.json({
					error_code: 1,
					success: 0,
					msg: '数据未查询到用户'
				});
			}
			user.wishlist.push(wishlist._id);
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code: 0,
						success: 0,
						msg: '数据库保存出错'
					});
				}
				res.json({
					error_code: 0,
					success: 1,
					msg: '保存成功',
					id: wishlist._id
				});
			});
		});
	});
}

// App端删除与PC端相同