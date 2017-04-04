var _ = require('underscore')
var mongoose = require('mongoose');
var Payment = require('../model/payment');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	Payment.findById(id, function(err, payment) {
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
	var page = req.body.page ? parseInt(req.body.page) : 0;
	var start = req.body.start ? parseInt(req.body.start) : 0;
	var limit = req.body.limit ? parseInt(req.body.limit) : 15;
	var keyword = req.body.keyword ? req.body.keyword : '';
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
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			totalCount = user.payment.length;

			var results = user.payment.slice(start, start + limit);

			res.json({
				page: (page + 1),
				payment: results || [],
				totalCount: totalCount
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('payment/add', {
		title: '新增页',
		payment: {
			name: '',
			price: '',
			type: '',
			product_type: '',
			remrk: ''
		}
	})
};

exports.edit = function(req, res) {
	var id = req.params.id

	Payment.findById(id, function(err, payment) {
		res.render('payment/add', {
			title: '编辑页',
			payment: payment
		})
	});
};

exports.save = function(req, res) {
	var paymentObj = req.body.payment;
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
	var id = req.query.id;
	if (id) {
		Payment.remove({
			_id: id
		}, function(err, payment) {
			if (err) {
				console.log(err);
				res.json({
					error_code:1,
					success: 0
				});
			} else {
				res.json({
					error_code:0,
					success: 1
				});
			}
		})
	}
};


// App详情
exports.detailMO = function(req, res) {
	var id = req.body.id

	// res.sendFile()直接输出html文件
	Payment.findById(id, function(err, payment) {
		res.json({
			payment: payment
		});
	});
};

// App保存
exports.saveMO = function(req, res) {
	var paymentObj = req.body.payment;
	var _payment;

	var user_id = req.headers['token'];
	paymentObj.account = user_id;
	_payment = new Payment(paymentObj);

	_payment.save(function(err, payment) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0,
				msg:'数据库保存出错'
			});
		}

		User.findById(user_id, function(err, user) {
			if (err) {
				console.log(err);
				res.json({
					error_code:1,
					success: 0,
					msg:'数据未查询到'
				});
			}
			user.payment.push(payment._id);
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code:0,
						success: 0,
						msg:'数据库保存出错'
					});
				}
				res.json({
					error_code:0,
					success: 1,
					msg:'保存成功',
					id:payment._id
				});
			});
		});
	});
}

// App端删除与PC端相同