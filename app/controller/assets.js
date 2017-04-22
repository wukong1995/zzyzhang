var _ = require('underscore')
var mongoose = require('mongoose');
var Assets = require('../model/assets');
var User = require('../model/account');

exports.detail = function(req, res) {
	if (!req.params || !req.params.id) {
		res.redirect('/assets/list');
		return;
	}
	var id = req.params.id;

	// res.sendFile()直接输出html文件
	Assets.findById(id, function(err, assets) {
		res.render('assets/detail', {
			title: '资产详情页',
			assets: assets
		})
	});
};

exports.list = function(req, res) {
	var user = req.session.user;
	// 渲染视图模板
	res.render('assets/list', {
		title: '资产列表页',
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
			path: 'assets',
			select: 'name type price meta',
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
			totalCount = user.assets.length;
			var results = user.assets.slice(start, start + limit);
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
	res.render('assets/add', {
		title: '添加资产',
		assets: {
			name: '',
			type: '',
			price: '',
			remark: '',
		}
	})
};

exports.edit = function(req, res) {
	if (!req.params || !req.params.id) {
		res.redirect('/assets/list');
		return;
	}
	var id = req.params.id;
	Assets.findById(id, function(err, assets) {
		res.render('assets/add', {
			title: '资产编辑页',
			assets: assets
		})
	});
};

exports.save = function(req, res) {
	if (!req.body || !req.body.assets) {
		res.redirect('/assets/add');
		return;
	}
	var assetsObj = req.body.assets;
	var id = assetsObj.id;

	if (assetsObj.name == undefined || assetsObj.type == undefined || assetsObj.price == undefined) {
		if (id) {
			res.redirect('/assets/edit/' + id);
		} else {
			res.redirect('/assets/add');
		}
		return;
	}

	var result = Commen.checkField([
		[assetsObj.name, '/^[\\S]+$/', '资产不能为空'],
		[assetsObj.name, '/^.{4,32}$/', '资产长度为4-32位'],
		[assetsObj.type, '/^[\\S]+$/', '类型不能为空'],
		[assetsObj.price, '/^[\\S]+$/', '价格不能为空'],
		[assetsObj.price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
	]);

	if (result.flag === false) {
		if (id) {
			res.redirect('/assets/edit/' + id);
		} else {
			res.redirect('/assets/add');
		}
		return;
	} else {
		result = null;
	}
	var _assets;

	if (id) {
		Assets.findById(id, function(err, assets) {
			if (err) {
				console.log(err);
				res.redirect('/assets/edit/' + id);
			}

			_assets = _.extend(assets, assetsObj);
			_assets.save(function(err, assets) {
				if (err) {
					console.log(err);
					res.redirect('/assets/edit/' + id);
				}
				// 重定向请求
				res.redirect('/assets/detail/' + assets._id)
			})
		})
	} else {

		var user_id = req.session.user._id;
		assetsObj.account = user_id;
		_assets = new Assets(assetsObj);

		_assets.save(function(err, assets) {
			if (err) {
				console.log(err);
				res.redirect('/assets/add');
			}
			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
					res.redirect('/assets/add');
				}

				user.assets.push(assets._id);
				user.save(function(err, user) {
					if (err) {
						console.log(err);
						res.redirect('/assets/add');
					}
					res.redirect('/assets/detail/' + assets._id);
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

	Assets.remove({
		_id: id
	}, function(err, assets) {
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
						assets: id
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
	Assets.findById(req.params.id, function(err, assets) {
		res.json({
			data: assets,
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
	var assetsObj = req.body;

	if (assetsObj.name == undefined || assetsObj.type == undefined || assetsObj.price == undefined) {
		if (id) {
			res.redirect('/assets/edit/' + id);
		} else {
			res.redirect('/assets/add');
		}
		return;
	}

	var result = Commen.checkField([
		[assetsObj.name, '/^[\\S]+$/', '资产不能为空'],
		[assetsObj.name, '/^.{4,16}$/', '资产长度为4-32位'],
		[assetsObj.type, '/^[\\S]+$/', '类型不能为空'],
		[assetsObj.price, '/^[\\S]+$/', '价格不能为空'],
		[assetsObj.price, '/^\\d+(\\.\\d+)?$/', '价格只能为大于零的数']
	]);

	if (result.flag === false) {
		res.json({
			error_code: 1,
			success: 0,
			msg: result.msg
		});
		return;
	} else {
		result = null;
	}
	var _assets;
	var id = assetsObj._id;

	if (id) {
		Assets.findById(id, function(err, assets) {
			if (err) {
				console.log(err);
				res.json({
					error_code: 1,
					success: 0,
					msg: '数据未查询到数据'
				});
				return;
			}

			_assets = _.extend(assets, assetsObj);
			_assets.save(function(err, assets) {
				if (err) {
					console.log(err);
					res.json({
						error_code: 1,
						success: 0,
						msg: '数据保存'
					});
					return;
				}
				res.json({
					error_code: 0,
					success: 1,
					msg: '修改成功',
					id: assets._id
				});
				return;
			})
		})
	} else {

		var user_id = req.headers['token'];
		assetsObj.account = user_id;
		_assets = new Assets(assetsObj);

		_assets.save(function(err, assets) {
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
				user.assets.push(assets._id);
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
						id: assets._id
					});
				});
			});
		});
	}
}

// App端删除与PC端相同