var User = require('../model/account');
var _ = require('underscore');

// showSignin
exports.showSignin = function(req, res) {
	res.render('signin', {
		title: '登录页面',
	})
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
			return res.redirect('/')
		} else {
			var user = new User(_user)
			user.save(function(err, user) {
				if (err) {
					console.log(err)
				}
				res.redirect('/')
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
	var _user = req.body.user

	User.findOne({
		name: _user.name
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		if (!user) {
			console.log("no user")
			return res.redirect('/signup')
		}
		user.comparePassword(_user.password, function(err, isMatch) {
			if (err) {
				console.log(err)
			}

			if (isMatch) {
				req.session.user = user;
				console.log("success");
				return res.redirect('/index');
			} else {
				console.log("password is not matched")
				return res.redirect('/')
			}
		})

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
			usernObj = _.extend(user, _user);
			usernObj.save(function(err, user) {
				if (err) {
					console.log(err)
				}
				console.log("password change")
				res.redirect('/signin');
			})
		} else {
			console.log("没有此用户");
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
	var user = req.session.user
		/*var id = req.query.id;
		if (id) {
			Bond.remove({
				_id: id
			}, function(err, movie) {
				if (err) {
					console.log(err)
				} else {
					res.json({
						success: 1
					})
				}
			})
		}*/

	res.json({
		success: 1
	});
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
	next()
}

/* 中间件 */
exports.adminRequired = function(req, res, next) {
	var user = req.session.user
	if (user.role <= 10) {
		return res.redirect('/signin')
	}
	next()
}