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

	User.findOne({
			_id: req.session.user._id
		}).populate({
			path: 'payment',
			options: {
				limit: 10
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			// 渲染视图模板
			res.render('payment/list', {
				title: '列表页',
				payments: user.payment || []
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
	var id = req.body.payment._id;
	var paymentObj = req.body.payment;
	var _payment;

	if (id) {
		Payment.findById(id, function(err, payment) {
			if (err) {
				console.log(err)
			}
			_payment = _.extend(payment, paymentObj);
			_payment.save(function(err, payment) {
				if (err) {
					console.log(err)
				}
				// 重定向请求
				res.redirect('/payment/detail/' + payment._id)
			})
		})
	} else {
		var user_id = req.session.user._id;
		paymentObj.account = user_id;
		_payment = new payment(paymentObj);

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
}

exports.del = function(req, res) {
	var id = req.query.id;
	if (id) {
		Payment.remove({
			_id: id
		}, function(err, payment) {
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