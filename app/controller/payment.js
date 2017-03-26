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
	var page = req.body.page ? parseInt(req.body.page) : 1;
	var start = req.body.start ? parseInt(req.body.start) : 0;
	var limit = req.body.limit ? parseInt(req.body.limit) : 15;
	var keyword = req.body.keyword ? req.body.keyword : '';

	var totalCount = 0;
	var user = req.session.user;

	User.findOne({
			_id: user._id
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
					success: 0
				});
			} else {
				res.json({
					success: 1
				});
			}
		})
	}
}