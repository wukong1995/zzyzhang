var _ = require('underscore')
var mongoose = require('mongoose');
var Commen = require('./commen');
var User = require('../model/account');
var Comment = require('../model/comment');

exports.detail = function(req, res) {
	if (!req.params || !req.params.id) {
		res.redirect('/comment/list');
		return;
	}

	// res.sendFile()直接输出html文件
	Comment.find({
			_id: req.params.id
		}).populate({
			path: 'account',
			select: 'name',
		})
		.exec(function(err, comment) {
			res.render('comment/detail', {
				title: '反馈详情页',
				comment: comment
			})
		});
};

exports.list = function(req, res) {
	var user = req.session.user;
	// 渲染视图模板
	res.render('comment/list', {
		title: '反馈列表页',
		user: user
	});
};

exports.result = function(req, res) {

	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.page ? parseInt(req.query.page) : 1;
	var start = req.query.start ? parseInt(req.query.start) : 0;
	var limit = req.query.limit ? parseInt(req.query.limit) : 15;

	var totalCount = 0;
	Comment.count()
		.exec(function(err, length) {
			if (err) {
				console.log(err);
				res.json({
					success: 0,
					msg: '服务器错误'
				});
				return;
			}

			totalCount = length;

			Comment.find()
				.limit(limit)
				.skip(start)
				.populate({
					path: 'account',
					select: 'name',
					options: {
						sort: {
							'meta.createAt': -1
						}
					}
				})
				.exec(function(err, comment) {
					if (err) {
						console.log(err);
						res.json({
							success: 0,
							msg: '服务器错误'
						});
						return;
					}
					res.json({
						success: 1,
						page: (page + 1),
						data: comment || [],
						totalCount: totalCount
					})
				});
		})
};

exports.del = function(req, res) {
	if (!req.query || !req.query.id) {
		res.json({
			success: 0,
			msg: '无传递参数id'
		});
		return;
	}

	Comment.remove({
		_id: id
	}, function(err, comment) {
		if (err) {
			console.log(err);
			res.json({
				success: 0
			});
		} else {
			res.json({
				error_code: 0,
				success: 1
			});
		}
	})

}

// App保存
exports.saveMO = function(req, res) {
	var commentObj = req.body;
	var _comment;

	var user_id = req.headers['token'];
	commentObj.account = user_id;

	_comment = new Comment(commentObj);

	_comment.save(function(err, comment) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				msg: '数据库保存出错'
			});
		}
		res.json({
			error_code: 0,
			success: 1,
			msg: '提交成功'
		});
	});
}