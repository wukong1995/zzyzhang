var _ = require('underscore')
var mongoose = require('mongoose');
var Payment = require('../model/payment');
var User = require('../model/account');
var Commen = require('./commen');


exports.detail = function(req, res, next) {
	if (!req.params || !req.params.id) {
		res.redirect('/payment/list');
		return;
	}

	var id = req.params.id;
	Payment.findById(id, function(err, payment) {
		if (err) {
			return next(err);
		}
		if (payment == null) {
			var err = new Error('Not Fount');
			err.status = 404;
			return next(err)
		}
		res.render('payment/detail', {
			title: '详情页',
			payment: payment
		})
	});
};

exports.list = function(req, res) {
	var user = req.session.user;
	res.render('payment/list', {
		title: '列表页',
		user: user
	});
};

exports.result = function(req, res) {

	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.page ? parseInt(req.query.page) : 0;
	var start = req.query.start ? parseInt(req.query.start) : 0;
	var limit = req.query.limit ? parseInt(req.query.limit) : 15;
	var keyword = req.query.keyword ? req.query.keyword : '';
	if (req.session.user) {
		var userId = req.session.user._id;
	} else {
		var userId = req.headers['token'];
	}

	var totalCount = 0;

	User.findOne({
			_id: userId
		}).populate({
			path: 'payment',
			select: 'name type price product_type meta',
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
				console.log(err);
				res.json({
					success: 0,
					msg: '服务器错误'
				});
				return;
			}
			totalCount = user.payment.length;

			var results = user.payment.slice(start, start + limit);
			res.json({
				page: (page + 1),
				data: results || [],
				totalCount: totalCount
			})
		});
};

exports.add = function(req, res, next) {
	try {
		res.render('payment/add', {
			title: '新增页',
			payment: {
				name: '',
				price: '',
				type: '',
				product_type: '',
				remrk: ''
			}
		});
	} catch (err) {
		return next(err);
	}
};

exports.edit = function(req, res) {
	if (!req.params || !req.params.id) {
		res.redirect('/payment/list');
		return;
	}
	var id = req.params.id;

	Payment.findById(id, function(err, payment) {
		if (err) {
			return next(err);
		}
		res.render('payment/add', {
			title: '编辑页',
			payment: payment
		})
	});
};

exports.save = function(req, res) {
	if (!req.body || !req.body.payment) {
		res.redirect('/payment/add');
		return;
	}
	var paymentObj = req.body.payment;

	if (paymentObj.type == undefined || paymentObj.name == undefined || paymentObj.product_type == undefined || paymentObj.price == undefined) {
		res.redirect('/payment/add');
		return;
	}

	var result = Commen.checkField([
		[paymentObj.type, '/^[\\S]+$/', '类型不能为空'],
		[paymentObj.name, '/^[\\S]+$/', '名字不能为空'],
		[paymentObj.name, '/^.{1,16}$/', '名字为4-16位'],
		[paymentObj.product_type, '/^[\\S]+$/', '类型不能为空'],
		[paymentObj.price, '/^[\\S]+$/', '价格不能为空'],
		[paymentObj.price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
	]);

	if (result.flag === false) {
		res.redirect('/payment/add');
		return;
	} else {
		result = null;
	}

	var _payment;

	var user_id = req.session.user._id;
	paymentObj.account = user_id;
	_payment = new Payment(paymentObj);

	_payment.save(function(err, payment) {
		if (err) {
			console.log(err);
		}

		User.findById(user_id, function(err, user) {
			if (err) {
				console.log(err);
			}
			user.payment.push(payment._id)
			user.save(function(err, user) {
				if (err) {
					console.log(err)
				}
				res.redirect('/payment/detail/' + payment._id);
			});
		});
	});

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

	Payment.remove({
		_id: id
	}, function(err, payment) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0
			});
			return;
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
	})

};


// App详情
exports.detailMO = function(req, res) {
	if (!req.params || !req.params.id) {
		res.json({
			success: 0,
			msg: '无传递参数id'
		});
		return;
	}

	Payment.findById(req.params.id, function(err, payment) {
		res.json({
			data: payment,
			success: 1
		});
		return;
	});
};

// App保存
exports.saveMO = function(req, res) {
	if (!req.body) {
		res.json({
			error_code: 0,
			success: 0,
			msg: '缺少参数'
		});
		return;
	}
	var paymentObj = req.body;

	if (paymentObj.type == undefined || paymentObj.name == undefined || paymentObj.product_type == undefined || paymentObj.price == undefined) {
		res.json({
			error_code: 0,
			success: 0,
			msg: '缺少参数'
		});
		return;
	}

	var result = Commen.checkField([
		[paymentObj.type, '/^[\\S]+$/', '类型不能为空'],
		[paymentObj.name, '/^[\\S]+$/', '对方名字不能为空'],
		[paymentObj.name, '/^.{1,16}$/', '对方名字为1-16位'],
		[paymentObj.product_type, '/^[\\S]+$/', '类型电话不能为空'],
		[paymentObj.price, '/^[\\S]+$/', '价格不能为空'],
		[paymentObj.price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
	]);

	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			msg: result.msg
		});
		return;
	} else {
		result = null;
	}
	var _payment;

	var user_id = req.headers['token'];
	paymentObj.account = user_id;
	_payment = new Payment(paymentObj);

	_payment.save(function(err, payment) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				msg: '数据库保存出错'
			});
			return;
		}

		User.findById(user_id, function(err, user) {
			if (err) {
				console.log(err);
				res.json({
					error_code: 1,
					success: 0,
					msg: '数据未查询到用户'
				});
				return;
			}
			user.payment.push(payment._id);
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code: 0,
						success: 0,
						msg: '数据库保存出错'
					});
					return;
				}
				res.json({
					error_code: 0,
					success: 1,
					msg: '保存成功',
					id: payment._id
				});
				return;
			});
		});
	});
}

// App端删除与PC端相同

// 查看月账单
exports.monthBill = function(req, res) {
	var year = new Date().getFullYear()
	var month = new Date().getMonth() + 1;
	var date = req.query.date;
	if (date) {
		year = date.split('-')[0]
		month = date.split('-')[1]
	}
	date = new Date(year, month, 0);

	Payment
		.aggregate()
		.match({
			'meta.createAt': {
				$gte: new Date(year + '-' + month + '-01'),
				$lt: new Date(year + '-' + month + '-' + date.getDate())
			}
		})
		.group({
			_id: "$type",
			data: {
				$sum: '$price'
			}
		})
		.exec(function(err, payment) {
			if (err) {
				console.log(err);
				res.json({
					error_code: 1,
					success: 0,
					msg: '数据库查询出错'
				});
				return;
			}
			payment.forEach(function(item) {
				if (item._id == 0) {
					item.label = '收入(' + item.data + ')';
				} else {
					item.label = '支出(' + item.data + ')';
				}
			});

			res.json({
				error_code: 0,
				success: 1,
				msg: '查询成功',
				data: payment
			});
			return;
		})
}