var _ = require('underscore')
var mongoose = require('mongoose');
var Share = require('../model/share');
var User = require('../model/account');

exports.detail = function(req, res) {
	if (!req.params || !req.params.id) {
		res.redirect('/share/list');
		return;
	}
	var id = req.params.id;

	// res.sendFile()直接输出html文件
	Share.findById(id, function(err, share) {
		res.render('share/detail', {
			title: '股票详情页',
			share: share
		})
	});
};

exports.list = function(req, res) {
	var user = req.session.user;
	res.render('share/list', {
		title: '股票列表页',
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
			path: 'share',
			select: 'name count first_price last_price income meta',
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
					message: '服务器错误'
				});
				return;
			}
			totalCount = user.share.length;
			var results = user.share.slice(start, start + limit);
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
	res.render('share/add', {
		title: '股票新增页',
		share: {
			name: '',
			count: '',
			first_price: '',
			last_price: '',
			remark: ''
		}
	})
};

exports.edit = function(req, res) {
	if (!req.params || !req.params.id) {
		res.redirect('/share/list');
		return;
	}

	var id = req.params.id;
	Share.findById(id, function(err, share) {
		res.render('share/add', {
			title: '股票编辑页',
			share: share
		})
	});
};

exports.save = function(req, res) {
	if (!req.body || !req.body.share) {
		res.redirect('/share/add');
		return;
	}
	var shareObj = req.body.share;
	var id = shareObj._id;

	if (shareObj.name == undefined || shareObj.count == undefined || shareObj.first_price == undefined || shareObj.last_price == undefined) {
		if (id) {
			res.redirect('/share/edit/' + id);
		} else {
			res.redirect('/share/add');
		}
		return;
	}

	var result = Commen.checkField([
		[shareObj.name, '/^[\\S]+$/', '名字不能为空'],
		[shareObj.name, '/^.{4,32}$/', '名字长度为4-32位'],
		[shareObj.count, '/^[\\S]+$/', '股数不能为空'],
		[shareObj.count, '/^\\d+$/', '股数不能为空'],
		[shareObj.first_price, '/^[\\S]+$/', '价格不能为空'],
		[shareObj.first_price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
		[shareObj.last_price, '/^[\\S]+$/', '价格不能为空'],
		[shareObj.last_price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
	]);

	if (result.flag === false) {
		if (id) {
			res.redirect('/share/edit/' + id);
		} else {
			res.redirect('/share/add');
		}
		return;
	} else {
		result = null;
	}

	shareObj.income = parseInt(shareObj.count) * (parseInt(shareObj.last_price) - parseInt(shareObj.first_price));
	var _share;

	if (id) {
		Share.findById(id, function(err, share) {
			if (err) {
				console.log(err)
			}
			_share = _.extend(share, shareObj);
			_share.save(function(err, share) {
				if (err) {
					console.log(err)
				}
				// 重定向请求
				res.redirect('/share/detail/' + share._id)
			})
		})
	} else {
		var user_id = req.session.user._id;
		shareObj.account = user_id;
		_share = new Share(shareObj);

		_share.save(function(err, share) {
			if (err) {
				console.log(err);
			}

			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
				}
				user.share.push(share._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err)
					}
					res.redirect('/share/detail/' + share._id);
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

	Share.remove({
		_id: id
	}, function(err, share) {
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
						share: id
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
	Share.findById(req.params.id, function(err, share) {
		res.json({
			data: share,
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
	var shareObj = req.body;

	if (shareObj.name == undefined || shareObj.count == undefined || shareObj.first_price == undefined || shareObj.last_price == undefined) {
		res.json({
			error_code: 0,
			success: 0,
			msg: '缺少参数'
		});
		return;
	}

	var result = Commen.checkField([
		[shareObj.name, '/^[\\S]+$/', '名字不能为空'],
		[shareObj.name, '/^.{4,32}$/', '名字长度为4-32位'],
		[shareObj.count, '/^[\\S]+$/', '股数不能为空'],
		[shareObj.count, '/^\\d+$/', '股数不能为空'],
		[shareObj.first_price, '/^[\\S]+$/', '价格不能为空'],
		[shareObj.first_price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
		[shareObj.last_price, '/^[\\S]+$/', '价格不能为空'],
		[shareObj.last_price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
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

	var _share;

	var user_id = req.headers['token'];
	shareObj.account = user_id;
	shareObj.income = parseInt(shareObj.count) * (parseInt(shareObj.last_price) - parseInt(shareObj.first_price));
	_share = new Share(shareObj);

	_share.save(function(err, share) {
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
			user.share.push(share._id);
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
					id: share._id
				});
			});
		});
	});
}

// App端删除与PC端相同