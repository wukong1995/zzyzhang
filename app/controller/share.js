var _ = require('underscore')
var mongoose = require('mongoose');
var Share = require('../model/share');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

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
			path: 'share',
			select: 'name count first_price last_price income meta',
			match: {
				name: new RegExp(keyword, "i")
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			totalCount = user.share.length;
			var results = user.share.slice(start, start + limit);
			res.json({
				page: (page + 1),
				share: results || [],
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
	var id = req.params.id

	Share.findById(id, function(err, share) {
		res.render('share/add', {
			title: '股票编辑页',
			share: share
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.share._id;
	var shareObj = req.body.share;
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
	var id = req.query.id;
	if (id) {
		Share.remove({
			_id: id
		}, function(err, share) {
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