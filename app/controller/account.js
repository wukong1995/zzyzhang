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
			});
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
			req.session.error = '账户已冻结';
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
					_id: user._id,
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

// 验证密码
exports.verifypwd = function(req, res) {
	var pwd = req.body.pwd;

	User.findById(req.session.user._id, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				success: 0,
				ismatch: false,
				message: '重置密码出错，请重试！'
			});
		}

		if (user) {
			user.comparePassword(pwd, function(err, isMatch) {
				if (err) {
					console.log(err);
					res.json({
						success: 0,
						ismatch: false,
						message: '重置密码出错，请重试！'
					});
				}
				if (isMatch) {
					res.json({
						success: 1,
						ismatch: true,
						message: '原密码正确！'
					});
				} else {
					res.json({
						success: 1,
						ismatch: false,
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
	})
}

// changepwd
exports.changepwd = function(req, res) {
	var _user = req.body.user;

	User.findById(req.session.user._id, function(err, user) {
		if (err) {
			console.log(err)
		}
		if (user) {
			user.password = _user.newpwd;
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					return res.redirect('/user/changepassword');
				}
				console.log("changepwd success");
				delete req.session.user;
				return res.redirect('/');
			});
		} else {
			console.log("修改密码出错，请重试！");
			return res.redirect('/user/changepassword')
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
	delete req.session.user
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
exports.signinMO = function(req, res) {
	var _user = req.body.user;

	if (_user.name.length > 16) {
		res.json({
			error_code:0,
			success: 0,
			msg:'用户名太长'
		});
	}
	if (!/^[a-zA-Z0-9]{6,16}$/.test(_user.password)) {
		res.json({
			error_code:0,
			success: 0,
			msg:'密码格式不正确'
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
				msg:'数据库查询出错'
			});
		}
		if (!user) {
			console.log("no user");
			res.json({
				error_code:0,
				success: 0,
				msg:'找不到该用户'
			});
		}
		if (user.state == 1) {
			console.log("user freeze");
			res.json({
				error_code:0,
				success: 0,
				msg:'账户已冻结'
			});
		}
		user.comparePassword(_user.password, function(err, isMatch) {
			if (err) {
				console.log(err);
				res.json({
					error_code:1,
					success: 0,
					msg:'账户已冻结'
				});
			}

			if (isMatch) {
				console.log(user.name, "success");
				res.json({
					error_code:0,
					success: 1,
					msg:'登录成功',
					user:user
				});
			} else {
				console.log("password is not matched");
				res.json({
					error_code:0,
					success: 0,
					msg:'密码不匹配'
				});
			}
		});
	})
}

// App接口：注册
exports.signupMO = function(req, res) {
	var _user = req.body.user;

	if (_user.name.length > 16) {
		res.json({
			error_code:0,
			success: 0,
			msg:'用户名太长'
		});
	}
	if (!/^[a-zA-Z0-9]{6,16}$/.test(_user.password)) {
		res.json({
			error_code:0,
			success: 0,
			msg:'密码格式不正确'
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
				msg:'数据库查询出错'
			});
		}
		if (user) {
			res.json({
				error_code:0,
				success: 0,
				msg:'用户名已存在'
			});
		} else {
			var user = new User(_user);
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code:1,
						success: 0,
						msg:'保存失败，请重试'
					});
				}
				res.json({
					error_code:0,
					success: 1,
					msg:'恭喜你，注册成功'
				});
			})
		}
	})
}

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
exports.changepwd = function(req, res) {
	var _user = req.body.user;
	var userId = req.headers['token'];


	User.findById(userId, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code:1,
				success: 0,
				msg:'找不到该用户'
			});
		}
		if (user) {
			user.password = _user.newpwd;
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code:1,
						success: 0,
						msg:'保存出错'
					});
				}
				console.log("changepwd success");
				res.json({
					error_code:0,
					success: 1,
					msg:'修改成功'
				});
			});
		} else {
			res.json({
				error_code:1,
				success: 0,
				msg:'找不到该用户'
			});
		}
	});
};

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