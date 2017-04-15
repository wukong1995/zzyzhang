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
	var page = req.query.page ? parseInt(req.query.page) : 1;
	var start = req.query.start ? parseInt(req.query.start) : 0;
	var limit = req.query.limit ? parseInt(req.query.limit) : 15;
	var keyword = req.query.keyword ? req.query.keyword : '';

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
			totalCount = user.borrowing.length;
			var results = user.borrowing.slice(start, start + limit);
			res.json({
				page: (page + 1),
				data: results || [],
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

	Borrowing.remove({
		_id: id
	}, function(err, borrowing) {
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
	})
}

// App详情
exports.detailMO = function(req, res) {
	if (!req.params || !req.params.id) {
		res.json({
			success: 0,
			msg: '无传递参数id'
		});
	}
	Borrowing.findById(req.params.id, function(err, borrowing) {
		res.json({
			data: borrowing,
			success: 1
		});
	});
};

// App保存
exports.saveMO = function(req, res) {
	var borrowingObj = req.body;
	var _borrowing;

	var user_id = req.headers['token'];
	borrowingObj.account = user_id;
	_borrowing = new Borrowing(borrowingObj);

	_borrowing.save(function(err, borrowing) {
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
			user.borrowing.push(borrowing._id);
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
					id: borrowing._id
				});
			});
		});
	});
}

// App端删除与PC端相同