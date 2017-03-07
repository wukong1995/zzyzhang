var _ = require('underscore')
var mongoose = require('mongoose');
var Assets = require('../model/assets');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	Assets.findById(id, function(err, assets) {
		res.render('assets/detail', {
			title: '详情页',
			assets: assets
		})
	});
};

exports.list = function(req, res) {

	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.p ? parseInt(req.query.p) : 1;
	var count = 10;
	var totalPage = 1;
	var user = req.session.user;

	User.findOne({
			_id: user._id
		}).populate({
			path: 'assets'
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			var index = (page - 1) * count;
			totalPage = Math.ceil(user.assets.length / count);
			var results = user.assets.slice(index, index + count);
			console.log(results)

			// 渲染视图模板
			res.render('assets/list', {
				title: '列表页',
				assets: results || [],
				currentPage: page,
				totalPage: totalPage,
				user: user
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
			title: '编辑页',
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
				console.log(err)
			} else {
				res.json({
					success: 1
				})
			}
		})
	}
}