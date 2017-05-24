var User = require('../model/account');

// list
exports.list = function(req, res) {
	var user = req.session.user;
	res.render('admin/list', {
		title: '用户列表页',
		user: req.session.user,
	});
}

// result
exports.result = function(req, res) {

	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.page ? parseInt(req.query.page) : 1;
	var start = req.query.start ? parseInt(req.query.start) : 0;
	var limit = req.query.limit ? parseInt(req.query.limit) : 15;
	var keyword = req.query.keyword ? req.query.keyword : '';
	var role = req.session.user.role;

	User.count({
			role: {
				$lt: role
			}
		})
		.exec(function(err, length) {
			if (err) {
				console.log(err);
				res.json({
					error_code: 1,
					success: 0,
					message: '服务器错误！'
				});
				return;
			}
			User.find({
					role: {
						$lt: role
					},
					name: new RegExp(keyword, "i")
				}, ['name', 'telphone', 'email', 'role', 'state'])
				.limit(limit)
				.skip(start)
				.sort({
					'meta.updateAt': -1
				})
				.exec(function(err, users) {
					if (err) {
						console.log(err);
						res.json({
							error_code: 1,
							success: 0,
							message: '服务器错误！'
						});
						return;
					}
					res.json({
						users: users || [],
						totalCount: length || 0
					});
				});
		});
};


// detail
exports.detail = function(req, res, next) {
	if (!req.params || !req.params.id) {
		return res.redirect('/admin/list');
		return;
	}
	var id = req.params.id;
	User.findById(id, function(err, user) {
		console.log(user);
		if (err) {
			return next(err);
		}
		if (user == null) {
			var err = new Error('Not Fount');
			err.status = 404;
			return next(err);
		}
		res.render('admin/detail', {
			title: '用户详情页',
			account: user
		});
	});
};

// 冻结/正常
// detail
exports.edit = function(req, res) {
	if (!req.query || !req.query.id) {
		res.json({
			success: 0,
			message: '缺少参数'
		});
		return;
	}

	var id = req.query.id
	User.findById(id, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				success: 0,
				message: '服务器错误'
			});
		}

		if (user) {
			if (user.state == 0) {
				user.state = 1; // 冻结
			} else {
				user.state = 0; // 正常
			}
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						success: 0,
						state: user.state,
						message: '失败'
					});
				}
				console.log("type change");
				res.json({
					success: 1, // 成功
					state: user.state,
					message: '成功'
				});
			})
		} else {
			console.log("no user");
			res.json({
				success: 0,
				state: user.state,
				message: '找不到该用户！'
			});
		}
	})

};