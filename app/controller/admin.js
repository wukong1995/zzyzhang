var User = require('../model/account');

// list
exports.list = function(req, res) {
	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.p ? parseInt(req.query.p) : 1;
	var count = 10;
	var totalPage = 1;
	User.count({
		role: {
			$lte: 10
		}
	}, function(err, counts) {
		if (err) {
			console.log(err);
		}

		totalPage = Math.ceil(counts / count);
	});

	User.find({
			role: {
				$lte: 10
			}
		}).populate({
			options: {
				limit: 6,
				skip: (page - 1) * count,
			}
		})
		.exec(function(err, users) {
			if (err) {
				console.log(err)
			}
			res.render('admin/list', {
				title: '用户列表',
				users: users,
				currentPage: (page + 1),
				totalPage: totalPage
			})
		});
}

// detail
exports.detail = function(req, res) {
	var id = req.query.id

	// res.sendFile()直接输出html文件
	User.findById(id, function(err, user) {
		res.render('admin/detail', {
			title: '用户详情页',
			user: user
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
				}
				console.log("type change")
				res.json({
					success: 1, // 成功
					message: '成功'
				});
			})
		} else {
			console.log("no user")
			res.json({
				success: 0,
				message: '找不到该用户！'
			});
		}
	})

};