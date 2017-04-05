var User = require('../model/account');
var _ = require('underscore');

// showSignin
exports.showSignin = function(req, res) {
	res.render('signin', {
		title: '登录页面',
		error: req.session.error,
		signupmsg: req.session.signupmsg
	});
}

// signup
exports.signup = function(req, res) {
	var _user = req.body.newuser;

	User.findOne({
		name: _user.name
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0,
				message: '服务器错误！'
			});
		}
		if (user) {
			res.json({
				error_code:0,
				success: 0,
				message: '用户名已存在！'
			});
		} else {
			var user = new User(_user);
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code:0,
						success: 0,
						message: '注册失败，请重试！'
					});
				}
				res.json({
						error_code:0,
						success: 0,
						message: '恭喜你，注册成功！'
					});
			})
		}
	})
}

// forgetpwd
exports.forgetpwd = function(req, res) {
	var _user = req.param('user')
	var usernObj;

	User.findOne({
		name: _user.name,
		email: _user.email,
		telphone: _user.telphone
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0, // 成功
				message: '服务器错误'
			});
		}
		if (user) {
			user.password = '123456';

			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code:1,
						success: 0, // 成功
						message: '服务器错误'
					});
				}
				console.log("password change")
				res.json({
					error_code:0,
					success: 1 ,// 成功
					message: '重置成功！'
				});
			});
		} else {
			res.json({
				error_code:0,
				success: 0,
				message: '没有此账户！'
			});
		}
	})
}

// signin
exports.signin = function(req, res) {

	var _user = req.body.user;
	if (_user.name.length > 16) {
		res.json({
			error_code:0,
			success: 0,
			message: '用户名太长！'
		});
	}
	if (!/^[a-zA-Z0-9]{6,16}$/.test(_user.password)) {
		res.json({
			error_code:0,
			success: 0,
			message: '密码格式不正确！'
		});
	}

	User.findOne({
		name: _user.name
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0,
				message: '服务器错误！'
			});
		}
		if (!user) {
			console.log("no user");

			res.json({
				error_code:0,
				success: 0,
				message: '找不到该用户！'
			});
			console.log()
		} else {
			if (user.state == 1) {
				console.log("user freeze");

				res.json({
					error_code:0,
					success: 0,
					message: '账户已冻结！'
				});
			}
			user.comparePassword(_user.password, function(err, isMatch) {
				if (err) {
					console.log(err);
					res.json({
						error_code:1,
						success: 0,
						message: '服务器错误！'
					});
				}

				if (isMatch) {
					req.session.user = {
						_id: user._id,
						name: user.name,
						role: user.role
					};
					console.log(user.name, "success");
					res.json({
						error_code:0,
						success: 1,
						message: '登录成功！'
					});
				} else {
					console.log("password is not matched");
					res.json({
						error_code:0,
						success: 0,
						message: '密码不匹配！'
					});
				}
			});
		}
	});
}

// changepwd
exports.changepwd = function(req, res) {
	if (req.session.user) {
		var userId = req.session.user._id;
	} else {
		var userId = req.headers['token'];
	}
	var _user = req.body.user;

	User.findById(userId, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0,
				message: '服务器错误！'
			});
		}
		if (user) {
			user.comparePassword(_user.pwd, function(err, isMatch) {
				if (err) {
					console.log(err);
					res.json({
						error_code:1,
						success: 0,
						message: '服务器错误！'
					});
				}
				if (isMatch) {
					user.password = _user.newpwd;
					user.save(function(err, user) {
						if (err) {
							console.log(err);
							res.json({
								error_code:1,
								success: 0,
								message: '服务器错误！'
							});
						}
						delete req.session.user;
						res.json({
							error_code:0,
							success: 1,
							message: '修改成功！'
						});
					});
					
				} else {
					res.json({
						error_code:0,
						success: 0,
						message: '原密码不正确！'
					});
				}
			});

		} else {
			res.json({
				success: 0,
				ismatch: false,
				message: '请重新登录'
			});
		}
	});
};

// detail
exports.detail = function(req, res) {
	var user = req.session.user;

	User.findOne({
		_id: user._id
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		res.render('account/detail', {
			title: '用户列表',
			user: user
		});
	});
}

// showChangepwd
exports.showChangepwd = function(req, res) {
	res.render('account/changepwd', {
		title: '修改密码页面',
	})
}

//showChange
exports.showChange = function(req, res) {
	var user = req.session.user
	if (!user) {
		return res.redirect('/signin')
	}

	User.findOne({
		_id: user._id
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		res.render('account/change', {
			title: '修改资料页面',
			user: user
		});
	});
}

// changeprofile
exports.changeprofile = function(req, res) {
	var id = req.session.user._id;
	var _user = req.body.user;
	var userObj;

	User.findById(id, function(err, user) {
		if (err) {
			console.log(err)
		}
		userObj = _.extend(user, _user);
		userObj.save(function(err, user) {
			if (err) {
				console.log(err)
			}
			// 重定向请求
			res.redirect('/user/detail');
		})
	})
}

// logout
exports.logout = function(req, res) {
	delete req.session.user;
		//delete app.locals.user
	res.redirect('/')
}

// midware for user
exports.signinRequired = function(req, res, next) {
	var user = req.session.user;
	//检查post的信息或者url查询参数或者头信息
	var token = req.body.token || req.query.token || req.headers['token'];
	if (!user && !token) {
		return res.redirect('/signin');
	}
	next();
}

/* 中间件 */
exports.adminRequired = function(req, res, next) {
	var user = req.session.user;
	if (user.role < 10) {
		return res.redirect('/')
	}
	next();
}

// App接口：登录

// App接口：注册


// App接口：忘记密码与PC端相同

// App接口：用户详情页
exports.detailMO = function(req, res) {
	var userId = req.headers['token'];

	User.findOne({
		_id: userId
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0,
				msg:'找不到该用户'
			});
		}
		res.json({
			error_code:0,
			success: 1,
			msg:'成功',
			user: user
		});
	});
}

// App接口：修改密码

// App接口：修改个人资料
exports.changeproMO = function(req, res) {
	var id = req.headers['token'];
	var _user = req.body.user;
	var userObj;

	User.findById(id, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0,
				msg:'找不到该用户'
			});
		}
		userObj = _.extend(user, _user);
		userObj.save(function(err, user) {
			if (err) {
				console.log(err);
				res.json({
					error_code:0,
					success: 0,
					msg:'保存出错'
				});
			}

			res.json({
				error_code:0,
				success: 1,
				msg:'保存成功'
			});
		})
	})
}