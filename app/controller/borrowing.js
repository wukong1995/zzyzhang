var _ = require('underscore')
var mongoose = require('mongoose');
var Borrowing = require('../model/borrowing');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	Borrowing.findById(id, function(err, borrowing) {
		res.render('borrowing/detail', {
			title: '详情页',
			borrowing: borrowing
		})
	});
};

exports.list = function(req, res) {
	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.p ? parseInt(req.query.p) : 1;
	var count = 10;
	var totalPage = 1;
	var totalCount = 0;
	var user = req.session.user;

	User.findOne({
			_id: user._id
		}).populate({
			path: 'borrowing'
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			var index = (page - 1) * count;
			totalCount = user.borrowing.length;
			if (totalCount != 0) {
				totalPage = Math.ceil(totalCount / count);
			}
			var results = user.borrowing.slice(index, index + count);
			console.log(results)

			// 渲染视图模板
			res.render('borrowing/list', {
				title: '列表页',
				borrowing: results || [],
				currentPage: page,
				totalPage: totalPage,
				totalCount: totalCount,
				user: user
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('borrowing/add', {
		title: '新增页',
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
			title: '编辑页',
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
		_borrowing = new borrowing(borrowingObj);

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
					res.redirect('/borrowing/detail/' + food._id);
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