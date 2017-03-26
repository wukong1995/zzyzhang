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
	var _user = req.body.newuser

	User.findOne({
		name: _user.name
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		if (user) {
			req.session.error = '用户名已存在';
			delete req.session.signupmsg;
			return res.redirect('/')
		} else {
			var user = new User(_user);
			user.save(function(err, user) {
				if (err) {
					console.log(err)
					req.session.error = '保存失败，请重试';
					delete req.session.signupmsg;
				}
				delete req.session.error;
				req.session.signupmsg = '恭喜你，注册成功';
				console.log(req.session.signupmsg)
				res.redirect('/');
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
			console.log(err)
		}
		if (user) {
			user.password = '123456';

			user.save(function(err, user) {
				if (err) {
					console.log(err)
				}
				console.log("password change")
				res.json({
					success: 1 // 成功
				})
			})
		} else {
			res.json({
				success: 0,
				message: '没有此账户！'
			})
		}
	})
}

// signin
exports.signin = function(req, res) {
	delete req.session.signupmsg;
	var _user = req.body.user;
	if (_user.name.length > 16) {
		req.session.error = '用户名太长';
		return res.redirect('/');
	}
	if (!/^[a-zA-Z0-9]{6,16}$/.test(_user.password)) {
		req.session.error = '密码格式不正确';
		return res.redirect('/');
	}

	User.findOne({
		name: _user.name
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		if (!user) {
			console.log("no user");
			req.session.error = '找不到该用户'
			return res.redirect('/');
		}
		if (user.state == 1) {
			console.log("user freeze");
			req.session.error = '账户已冻结'
			return res.redirect('/');
		}
		user.comparePassword(_user.password, function(err, isMatch) {
			if (err) {
				console.log(err)
			}

			if (isMatch) {
				delete req.session.error;
				delete req.session.signupmsg;
				req.session.user = {
					name: user.name,
					role: user.role
				};
				console.log(user.name, "success");
				return res.redirect('/index');
			} else {
				console.log("password is not matched");
				req.session.error = '密码不匹配'
				return res.redirect('/')
			}
		});

	})
}

// 判断是否重名
exports.isExit = function(req, res) {
	var name = req.query.name;
	User.findOne({
		name: name
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				success: 0,
				isExit: true,
				message: '失败'
			});

		}
		if (!user) {
			res.json({
				success: 1, // 成功
				isExit: false,
				message: '成功'
			});
		} else {
			res.json({
				success: 1,
				isExit: true,
				message: '成功'
			});
		}


	})
}

// changepwd
exports.changepwd = function(req, res) {
	var user = req.session.user
	var usernObj;

	User.findOne({
		name: _user._id
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		if (user) {
			user.comparePassword(_user.pwd, function(err, isMatch) {
				if (err) {
					console.log(err)
				}

				if (isMatch) {
					console.log("change pwdsuccess");
					return res.redirect('/');
				} else {
					console.log("password is not matched");
					req.session.error = '密码不匹配'
					return res.redirect('/user/changepassword')
				}
			});
		} else {
			console.log("修改密码出错，请重试！");
			return res.redirect('/signup')
		}
	})
};

// detail
exports.detail = function(req, res) {
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
	delete req.session.user
		//delete app.locals.user
	res.redirect('/')
}

// midware for user
exports.signinRequired = function(req, res, next) {
	var user = req.session.user
	if (!user) {
		return res.redirect('/signin')
	}
	next();
}

/* 中间件 */
exports.adminRequired = function(req, res, next) {
	var user = req.session.user
	if (user.role < 10) {
		return res.redirect('/')
	}
	next();
}