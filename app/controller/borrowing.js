var _ = require('underscore')
var mongoose = require('mongoose');
var Borrowing = require('../model/borrowing');
var User = require('../model/account');
var Commen = require('./commen');

exports.detail = function(req, res) {
	if (!req.params || !req.params.id) {
		res.redirect('/borrowing/list');
		return;
	}
	var id = req.params.id;
	Borrowing.findById(id, function(err, borrowing) {
		if (err) {
			return next(err);
		}
		if (borrowing == null) {
			var err = new Error('Not Fount');
			err.status = 404;
			return next(err)
		}
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
			select: 'other telphone price type meta',
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
				console.log(err);
				res.json({
					success: 0,
					msg: '服务器错误'
				});
				return;
			}
			totalCount = user.borrowing.length;
			var results = user.borrowing.slice(start, start + limit);
			res.json({
				success: 1,
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
	if (!req.params || !req.params.id) {
		res.redirect('/borrowing/list');
		return;
	}
	var id = req.params.id;

	Borrowing.findById(id, function(err, borrowing) {
		res.render('borrowing/add', {
			title: '借贷编辑页',
			borrowing: borrowing
		})
	});
};

exports.save = function(req, res) {
	if (!req.body || !req.body.borrowing) {
		console.log("缺少参数	");
		res.redirect('/borrowing/add');
		return;
	}
	var borrowingObj = req.body.borrowing;
	var id = borrowingObj._id;

	if (borrowingObj.other == undefined || borrowingObj.telphone == undefined || borrowingObj.type == undefined || borrowingObj.price == undefined) {
		console.log("缺少参数	");
		if (id) {
			res.redirect('/borrowing/edit/' + id);
		} else {
			res.redirect('/borrowing/add');
		}
		return;
	}

	var result = Commen.checkField([
		[borrowingObj.other, '/^[\\S]+$/', '对方名字不能为空'],
		[borrowingObj.other, '/^.{1,16}$/', '对方名字为1-16位'],
		[borrowingObj.telphone, '/^[\\S]+$/', '对方电话不能为空'],
		[borrowingObj.telphone, '/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/', '电话格式不正确'],
		[borrowingObj.type, '/^[\\S]+$/', '类型不能为空'],
		[borrowingObj.price, '/^[\\S]+$/', '价格不能为空'],
		[borrowingObj.price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
	]);

	if (result.flag === false) {
		console.log(result.msg);
		if (id) {
			res.redirect('/borrowing/edit/' + id);
		} else {
			res.redirect('/borrowing/add');
		}
		return;
	} else {
		result = null;
	}

	var _borrowing;

	if (id) {
		Borrowing.findById(id, function(err, borrowing) {
			if (err) {
				console.log(err);
				res.redirect('/borrowing/edit/' + id);
			}
			_borrowing = _.extend(borrowing, borrowingObj);
			_borrowing.save(function(err, borrowing) {
				if (err) {
					console.log(err);
					res.redirect('/borrowing/edit/' + id);
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
				res.redirect('/borrowing/add');
			}

			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
					res.redirect('/borrowing/add');
				}
				user.borrowing.push(borrowing._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err);
						res.redirect('/borrowing/add');
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
						borrowing: id
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
	if (!req.body) {
		res.json({
			error_code: 0,
			success: 0,
			msg: '缺少参数'
		});
		return;
	}
	var borrowingObj = req.body;

	if (borrowingObj.other == undefined || borrowingObj.telphone == undefined || borrowingObj.type == undefined || borrowingObj.price == undefined) {
		res.json({
			error_code: 0,
			success: 0,
			msg: '缺少参数'
		});
		return;
	}

	var result = Commen.checkField([
		[borrowingObj.other, '/^[\\S]+$/', '对方名字不能为空'],
		[borrowingObj.other, '/^.{1,16}$/', '对方名字为1-16位'],
		[borrowingObj.telphone, '/^[\\S]+$/', '对方电话不能为空'],
		[borrowingObj.telphone, '/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/', '电话格式不正确'],
		[borrowingObj.type, '/^[\\S]+$/', '类型不能为空'],
		[borrowingObj.price, '/^[\\S]+$/', '价格不能为空'],
		[borrowingObj.price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
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