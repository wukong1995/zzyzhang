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
	var page = req.body.page ? parseInt(req.body.page) : 1;
	var start = req.body.start ? parseInt(req.body.start) : 0;
	var limit = req.body.limit ? parseInt(req.body.limit) : 15;
	var keyword = req.body.keyword ? req.body.keyword : '';
	var role = req.session.user.role;

	User.count({
			role: {
				$lt: role
			}
		})
		.exec(function(err, length) {
			if (err) {
				console.log(err)
			}
			User.find({
					role: {
						$lt: role
					},
					name: new RegExp(keyword, "i")
				}, ['name', 'telphone', 'email', 'role', 'state'])
				.limit(limit)
				.skip(start)
				.sort({'meta.updateAt':-1})
				.exec(function(err, users) {
					if (err) {
						console.log(err)
					}
					res.json({
						users: users || [],
						totalCount: length || 0
					});
				});
		});
};


// detail
exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	User.findById(id, function(err, user) {
		res.render('admin/detail', {
			title: '用户详情页',
			account: user,
			user: req.session.user
		})
	});
};

// 冻结/正常
// detail
exports.edit = function(req, res) {
	var id = req.query.id
	User.findById(id, function(err, user) {
		if (err) {
			console.log(err)
		}

		if (user) {
			if (user.state == 0) {
				user.state = 1; // 冻结
			} else {
				user.state = 0; // 正常
			}
			user.save(function(err, user) {
				if (err) {
					console.log(err)
					res.json({
						success: 0, // 成功
						state: user.state,
						message: '失败'
					});
				}
				console.log("type change")
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