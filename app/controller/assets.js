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

	User.findOne({
			_id: req.session.user._id
		}).populate({
			path: 'assets',
			options: {
				limit: 10
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			// 渲染视图模板
			res.render('assets/list', {
				title: '列表页',
				foods: user.assets || []
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('assets/add', {
		title: '新增页',
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
		_assets = new Assert(assetsObj);

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
					res.redirect('/assets/detail/' + food._id);
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