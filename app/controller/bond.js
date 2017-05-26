var _ = require('underscore')
var mongoose = require('mongoose');
var Bond = require('../model/bond');
var User = require('../model/account');
var Commen = require('./commen');

exports.detail = function(req, res, next) {
	if (!req.params || !req.params.id) {
		res.redirect('/bond/list');
		return;
	}
	var id = req.params.id;
	Bond.findById(id, function(err, bond) {
		if (err) {
			return next(err);
		}
		if (bond == null) {
			var err = new Error('Not Fount');
			err.status = 404;
			return next(err)
		}
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
				console.log(err);
				res.json({
					success: 0,
					msg: '服务器错误'
				});
				return;
			}
			totalCount = user.bond.length;
			var results = user.bond.slice(start, start + limit);
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
	if (!req.params || !req.params.id) {
		res.redirect('/bond/list');
		return;
	}
	var id = req.params.id;

	Bond.findById(id, function(err, bond) {
		res.render('bond/add', {
			title: '债券编辑页',
			bond: bond
		})
	});
};

exports.save = function(req, res) {
	if (!req.body || !req.body.bond) {
		console.log("缺少参数	");
		res.redirect('/bond/add');
		return;
	}
	var id = req.body.bond._id;
	var bondObj = req.body.bond;

	if (bondObj.name == undefined || bondObj.code == undefined || bondObj.purchase == undefined || bondObj.yield == undefined) {
		console.log("缺少参数	");
		if (id) {
			res.redirect('/bond/edit/' + id);
		} else {
			res.redirect('/bond/add');
		}
		return;
	}

	var result = Commen.checkField([
		[bondObj.name, '/^[\\S]+$/', '名字不能为空'],
		[bondObj.name, '/^.{1,16}$/', '名字长度为1-16位'],
		[bondObj.code, '/^[\\S]+$/', '代码不能为空'],
		[bondObj.code, '/^[\\d]{6}$/', '代码长度为6位'],
		[bondObj.purchase, '/^[\\S]+$/', '价格不能为空'],
		[bondObj.purchase, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数'],
		[bondObj.yield, '/^[\\S]+$/', '收益率不能为空'],
		[bondObj.yield, '/^(\\-)?\\d+(\\.\\d+)?$/', '收益率只能为数字']
	]);

	if (result.flag === false) {
		console.log(result.msg);
		if (id) {
			res.redirect('/bond/edit/' + id);
		} else {
			res.redirect('/bond/add');
		}
		return;
	} else {
		result = null;
	}

	bondObj.income = parseFloat(bondObj.purchase) * parseFloat(bondObj.yield);
	var _bond;

	if (id) {
		Bond.findById(id, function(err, bond) {
			if (err) {
				console.log(err);
				res.redirect('/bond/edit/' + id);
			}
			_bond = _.extend(bond, bondObj);
			_bond.save(function(err, bond) {
				if (err) {
					console.log(err);
					res.redirect('/bond/edit/' + id);
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
				res.redirect('/bond/add');
			}

			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
					res.redirect('/bond/add');
				}
				user.bond.push(bond._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err);
						res.redirect('/bond/add');
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
						bond: id
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
		return;
	}

	Bond.findById(req.params.id, function(err, bond) {
		console.log(bond)

		res.json({
			data: bond,
			success: 1
		});
	});
};

// App保存
exports.saveMO = function(req, res) {
	var bondObj = req.body;
	var _bond;
	if (bondObj.name == undefined || bondObj.code == undefined || bondObj.purchase == undefined || bondObj.yield == undefined) {
		res.json({
			error_code: 0,
			success: 0,
			msg: '缺少参数'
		});
		return;
	}

	var result = Commen.checkField([
		[bondObj.name, '/^[\\S]+$/', '名字不能为空'],
		[bondObj.name, '/^.{1,16}$/', '名字长度为1-16位'],
		[bondObj.code, '/^[\\S]+$/', '代码不能为空'],
		[bondObj.code, '/^[\\d]{6}$/', '代码长度为6位'],
		[bondObj.purchase, '/^[\\S]+$/', '价格不能为空'],
		[bondObj.purchase, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数'],
		[bondObj.yield, '/^[\\S]+$/', '收益率不能为空'],
		[bondObj.yield, '/^(\\-)?\\d+(\\.\\d+)?$/', '收益率只能为数字']
	]);

	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			msg: res.msg
		});
		return;
	} else {
		result = null;
	}


	var user_id = req.headers['token'];
	bondObj.account = user_id;
	bondObj.income = parseFloat(bondObj.purchase) * parseFloat(bondObj.yield);

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