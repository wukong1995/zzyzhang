var _ = require('underscore')
var mongoose = require('mongoose');
var Assets = require('../model/assets');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

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
			path: 'assets',
			select: 'name type price meta',
			match: {
				name: new RegExp(keyword, "i")
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			totalCount = user.assets.length;
			var results = user.assets.slice(start, start + limit);
			res.json({
				page: (page + 1),
				assets: results || [],
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
	var id = req.params.id

	Assets.findById(id, function(err, assets) {
		res.render('assets/add', {
			title: '资产编辑页',
			assets: assets
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.assets._id;
	var assetsObj = req.body.assets;
	var _assets;

	if (id) {
		Assets.findById(id, function(err, assets) {
			if (err) {
				console.log(err)
			}

			console.log(assets)
			console.log(assetsObj)

			_assets = _.extend(assets, assetsObj);
			_assets.save(function(err, assets) {
				if (err) {
					console.log(err)
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
			}
			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
				}

				user.assets.push(assets._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err)
					}
					res.redirect('/assets/detail/' + assets._id);
				});
			});

		});
	}
}

exports.del = function(req, res) {
	var id = req.query.id;
	if (id) {
		Assets.remove({
			_id: id
		}, function(err, assets) {
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