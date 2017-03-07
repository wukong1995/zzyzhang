var _ = require('underscore')
var mongoose = require('mongoose');
var Share = require('../model/share');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	Share.findById(id, function(err, share) {
		res.render('share/detail', {
			title: '详情页',
			share: share
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
			path: 'share'
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			var index = (page - 1) * count;
			totalPage = Math.ceil(user.share.length / count);
			var results = user.share.slice(index, index + count);
			console.log(results)

			// 渲染视图模板
			res.render('share/list', {
				title: '列表页',
				share: results || [],
				currentPage: page,
				totalPage: totalPage,
				user: user
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('share/add', {
		title: '新增页',
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
	var id = req.params.id

	Share.findById(id, function(err, share) {
		res.render('share/add', {
			title: '编辑页',
			share: share
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.share._id;
	var shareObj = req.body.share;
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
		_share = new share(shareObj);

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
					res.redirect('/share/detail/' + food._id);
				});
			});

		});
	}
}

exports.del = function(req, res) {
	var id = req.query.id;
	if (id) {
		Share.remove({
			_id: id
		}, function(err, share) {
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