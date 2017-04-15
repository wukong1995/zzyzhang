var _ = require('underscore')
var mongoose = require('mongoose');
var Bond = require('../model/bond');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	Bond.findById(id, function(err, bond) {
		res.render('bond/detail', {
			title: '债券详情页',
			bond: bond
		})
	});
};

exports.list = function(req, res) {
	var user = req.session.user;
	res.render('bond/list', {
		title: '债券列表页',
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
			path: 'bond',
			select: 'name code purchase yield income meta',
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
			totalCount = user.bond.length;
			var results = user.bond.slice(start, start + limit);
			res.json({
				page: (page + 1),
				bond: results || [],
				totalCount: totalCount
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('bond/add', {
		title: '债券新增页',
		bond: {
			name: '',
			code: '',
			price: '',
			interest_rate: '',
		}
	})
};

exports.edit = function(req, res) {
	var id = req.params.id

	Bond.findById(id, function(err, bond) {
		res.render('bond/add', {
			title: '债券编辑页',
			bond: bond
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.bond._id;
	var bondObj = req.body.bond;
	bondObj.income = parseFloat(bondObj.purchase) * parseFloat(bondObj.yield);
	var _bond;

	if (id) {
		Bond.findById(id, function(err, bond) {
			if (err) {
				console.log(err)
			}
			_bond = _.extend(bond, bondObj);
			_bond.save(function(err, bond) {
				if (err) {
					console.log(err)
				}
				// 重定向请求
				res.redirect('/bond/detail/' + bond._id)
			})
		})
	} else {
		var user_id = req.session.user._id;
		bondObj.account = user_id;
		_bond = new Bond(bondObj);

		_bond.save(function(err, bond) {
			if (err) {
				console.log(err);
			}

			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
				}
				user.bond.push(bond._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err)
					}
					res.redirect('/bond/detail/' + bond._id);
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

	Bond.remove({
		_id: id
	}, function(err, movie) {
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
	Bond.findById(req.params.id, function(err, bond) {
		res.json({
			bond: bond,
			success: 1
		});
	});
};

// App保存
exports.saveMO = function(req, res) {
	var bondObj = req.body;
	var _bond;

	var user_id = req.headers['token'];
	bondObj.account = user_id;
	_bond = new Bond(bondObj);

	_bond.save(function(err, bond) {
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
			user.bond.push(bond._id);
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
					id: bond._id
				});
			});
		});
	});
}

// App端删除与PC端相同