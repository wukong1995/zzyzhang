var _ = require('underscore')
var mongoose = require('mongoose');
var Borrowing = require('../model/borrowing');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	Borrowing.findById(id, function(err, borrowing) {
		res.render('borrowing/detail', {
			title: '借贷详情页',
			borrowing: borrowing
		})
	});
};

exports.list = function(req, res) {
	var user = req.session.user;
	res.render('borrowing/list', {
		title: '借贷列表页',
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
	if (req.session.user) {
		var userId = req.session.user._id;
	} else {
		var userId = req.headers['token'];
	}

	User.findOne({
			_id: userId
		}).populate({
			path: 'borrowing',
			select: 'other telephone price type meta',
			match: {
				other: new RegExp(keyword, "i")
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			totalCount = user.borrowing.length;
			var results = user.borrowing.slice(start, start + limit);
			res.json({
				page: (page + 1),
				borrowing: results || [],
				totalCount: totalCount
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('borrowing/add', {
		title: '借贷新增页',
		borrowing: {
			name: '',
			price: ''
		}
	})
};

exports.edit = function(req, res) {
	var id = req.params.id

	Borrowing.findById(id, function(err, borrowing) {
		res.render('borrowing/add', {
			title: '借贷编辑页',
			borrowing: borrowing
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.borrowing._id;
	var borrowingObj = req.body.borrowing;
	var _borrowing;

	if (id) {
		Borrowing.findById(id, function(err, borrowing) {
			if (err) {
				console.log(err)
			}
			_borrowing = _.extend(borrowing, borrowingObj);
			_borrowing.save(function(err, borrowing) {
				if (err) {
					console.log(err)
				}
				// 重定向请求
				res.redirect('/borrowing/detail/' + borrowing._id)
			})
		})
	} else {
		var user_id = req.session.user._id;
		borrowingObj.account = user_id;
		_borrowing = new Borrowing(borrowingObj);

		_borrowing.save(function(err, borrowing) {
			if (err) {
				console.log(err);
			}

			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
				}
				user.borrowing.push(borrowing._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err)
					}
					res.redirect('/borrowing/detail/' + borrowing._id);
				});
			});

		});
	}
}

exports.del = function(req, res) {
	var id = req.query.id;
	if (id) {
		Borrowing.remove({
			_id: id
		}, function(err, borrowing) {
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