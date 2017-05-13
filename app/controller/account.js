var User = require('../model/account');
var Commen = require('./commen');
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
	if (!req.body) {
		res.json({
			error_code: 0,
			success: 0,
			message: '未发送数据！'
		});
		return;
	}
	var _user = req.body;

	if (_user.name == undefined || _user.email == undefined || _user.telphone == undefined || _user.password == undefined) {
		res.json({
			error_code: 0,
			success: 0,
			message: '填写字段不完整！'
		});
		return;
	}

	var result = Commen.checkField([
		[_user.name, '/^[\\S]+$/', '用户名不能为空'],
		[_user.name, '/^.{4,16}$/', '用户名长度为4-16位'],
		[_user.email, '/^[\\S]+$/', '邮箱不能为空'],
		[_user.telphone, '/^[\\S]+$/', '电话不能为空'],
		[_user.password, '/^[\\S]+$/', '密码不能为空'],
		[_user.email, '/^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$/', '邮箱格式不正确'],
		[_user.telphone, '/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/', '联系方式格式不正确'],
		[_user.password, '/^[A-Z 0-9 a-z]{6,16}$/', '密码应由6-16位的数字或字母组成']
	]);

	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			message: result.msg
		});
		return;
	} else {
		result = null;
	}

	User.findOne({
		name: _user.name
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				message: '服务器错误！'
			});
			return;
		}
		if (user) {
			res.json({
				error_code: 0,
				success: 0,
				message: '用户名已存在！'
			});
			return;
		} else {
			var user = new User(_user);
			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code: 0,
						success: 0,
						message: '注册失败，请重试！'
					});
					return;
				}
				res.json({
					error_code: 0,
					success: 1,
					message: '恭喜你，注册成功！'
				});
				return;
			})
		}
	})
}

// forgetpwd
exports.forgetpwd = function(req, res) {
	if (!req.body) {
		res.json({
			error_code: 0,
			success: 0,
			message: '未发送数据！'
		});
		return;
	}
	var _user = req.body;
	var usernObj;

	if (_user.name == undefined || _user.email == undefined || _user.telphone == undefined) {
		res.json({
			error_code: 0,
			success: 0,
			message: '填写字段不完整！'
		});
		return;
	}

	var result = Commen.checkField([
		[_user.name, '/^[\\S]+$/', '用户名不能为空'],
		[_user.name, '/^.{4,16}$/', '用户名长度为4-16位'],
		[_user.email, '/^[\\S]+$/', '邮箱不能为空'],
		[_user.telphone, '/^[\\S]+$/', '电话不能为空'],
		[_user.email, '/^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$/', '邮箱格式不正确'],
		[_user.telphone, '/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/', '联系方式格式不正确'],
	]);
	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			message: result.msg
		});
		return;
	} else {
		result = null;
	}

	User.findOne({
		name: _user.name,
		email: _user.email,
		telphone: _user.telphone
	}, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0, // 成功
				message: '服务器错误'
			});
			return;
		}
		if (user) {
			user.password = '123456';

			user.save(function(err, user) {
				if (err) {
					console.log(err);
					res.json({
						error_code: 1,
						success: 0, // 成功
						message: '服务器错误'
					});
					return;
				}
				console.log("password change")
				res.json({
					error_code: 0,
					success: 1, // 成功
					message: '重置成功！'
				});
				return;
			});
		} else {
			res.json({
				error_code: 0,
				success: 0,
				message: '没有此账户！'
			});
			return;
		}
	})
}

// signin
exports.signin = function(req, res) {

	var _user = req.body;

	if (_user.name == undefined || _user.password == undefined) {
		return res.json({
			error_code: 0,
			success: 0,
			message: '填写字段不完整！'
		});
	}

	var result = Commen.checkField([
		[_user.name, '/^[\\S]+$/', '用户名不能为空'],
		[_user.name, '/^.{4,16}$/', '用户名长度为4-16位'],
		[_user.password, '/^[\\S]+$/', '密码不能为空'],
		[_user.password, '/^[A-Z 0-9 a-z]{6,16}$/', '密码应由6-16位的数字或字母组成']
	]);
	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			message: result.msg
		});
		return;
	} else {
		result = null;
	}

	User.findOne({
		name: _user.name
	}, ['name', 'password', 'role'], function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				message: '服务器错误！'
			});
			return;
		}
		if (!user) {
			console.log("no user");

			res.json({
				error_code: 0,
				success: 0,
				message: '找不到该用户！'
			});
			return;
		} else {
			if (user.state == 1) {
				console.log("user freeze");

				res.json({
					error_code: 0,
					success: 0,
					message: '账户已冻结！'
				});
				return;
			}
			user.comparePassword(_user.password, function(err, isMatch) {
				if (err) {
					console.log(err);
					res.json({
						error_code: 1,
						success: 0,
						message: '服务器错误！'
					});
					return;
				}

				if (isMatch) {
					req.session.user = {
						_id: user._id,
						name: user.name,
						role: user.role
					};
					console.log(user.name, "success");
					res.json({
						error_code: 0,
						success: 1,
						message: '登录成功！',
						user: user
					});
					return;
				} else {
					console.log("password is not matched");

					res.json({
						error_code: 0,
						success: 0,
						message: '密码不匹配！'
					});
					return;
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

	var _user = req.body;

	if (_user.newpwd == undefined || _user.pwd == undefined) {
		return res.json({
			error_code: 0,
			success: 0,
			message: '填写字段不完整！'
		});
	}

	var result = Commen.checkField([
		[_user.pwd, '/^[\\S]+$/', '原密码不能为空'],
		[_user.pwd, '/^[A-Z 0-9 a-z]{6,16}$/', '密码应由6-16位的数字或字母组成'],
		[_user.newpwd, '/^[\\S]+$/', '新密码不能为空'],
		[_user.newpwd, '/^[A-Z 0-9 a-z]{6,16}$/', '密码应由6-16位的数字或字母组成']
	]);
	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			message: result.msg
		});
		return;
	} else {
		result = null;
	}

	User.findById(userId, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				message: '服务器错误！'
			});
			return;
		}
		if (user) {
			user.comparePassword(_user.pwd, function(err, isMatch) {
				if (err) {
					console.log(err);
					res.json({
						error_code: 1,
						success: 0,
						message: '服务器错误！'
					});
					return;
				}
				if (isMatch) {
					user.password = _user.newpwd;
					user.save(function(err, user) {
						if (err) {
							console.log(err);
							res.json({
								error_code: 1,
								success: 0,
								message: '服务器错误！'
							});
							return;
						}
						delete req.session.user;
						res.json({
							error_code: 0,
							success: 1,
							message: '修改成功！'
						});
						return;
					});

				} else {
					res.json({
						error_code: 0,
						success: 0,
						message: '原密码不正确！'
					});
					return;
				}
			});

		} else {
			res.json({
				success: 0,
				ismatch: false,
				message: '请重新登录'
			});
			return;
		}
	});
};

// detail
exports.detail = function(req, res) {
	var user = req.session.user;

	User.findOne({
		_id: user._id
	}, ['name', 'password', 'telphone', 'email', 'Head_portrait', 'real_name', 'sex', 'birth',
		'signature', 'role', 'state', 'meta'
	], function(err, user) {
		if (err) {
			console.log(err);
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
		return res.redirect('/signin');
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

	if (req.body == undefined || req.body.user == undefined) {
		res.redirect('account/change');
		return;
	}
	var _user = req.body.user;

	var result = Commen.checkField([
		[_user.name, '/^[\\S]+$/', '用户名不能为空'],
		[_user.name, '/^.{4,16}$/', '用户名长度为4-16位'],
		[_user.email, '/^[\\S]+$/', '邮箱不能为空'],
		[_user.email, '/^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$/', '邮箱格式不正确'],
		[_user.telphone, '/^[\\S]+$/', '电话不能为空'],
		[_user.telphone, '/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/', '联系方式格式不正确']
	]);
	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			message: result.msg
		});
		return;
	} else {
		result = null;
	}
	var userObj;

	User.findById(id, function(err, user) {
		if (err) {
			console.log(err)
		}
		userObj = _.extend(user, _user);
		userObj.save(function(err, user) {
			if (err) {
				console.log(err);
				res.redirect('account/change');
				return;
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
		return res.redirect('/');
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
	}, ['name', 'password', 'telphone', 'email', 'Head_portrait', 'real_name', 'sex', 'birth',
		'signature', 'role'
	], function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				msg: '找不到该用户'
			});
		}
		res.json({
			error_code: 0,
			success: 1,
			message: '成功',
			user: user
		});
	});
}

// App接口：修改密码

// App接口：修改个人资料
exports.changeproMO = function(req, res) {
	var id = req.headers['token'];

	if (req.body == undefined) {
		res.json({
			error_code: 0,
			success: 0,
			message: '未发送数据'
		});
		return;
		return;
	}
	var _user = req.body;

	var result = Commen.checkField([
		[_user.name, '/^[\\S]+$/', '用户名不能为空'],
		[_user.name, '/^.{4,16}$/', '用户名长度为4-16位'],
		[_user.email, '/^[\\S]+$/', '邮箱不能为空'],
		[_user.telphone, '/^[\\S]+$/', '电话不能为空'],
		[_user.email, '/^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$/', '邮箱格式不正确'],
		[_user.telphone, '/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/', '联系方式格式不正确']
	]);
	if (result.flag === false) {
		res.json({
			error_code: 0,
			success: 0,
			message: result.msg
		});
		return;
	} else {
		result = null;
	}
	var userObj;

	User.findById(id, function(err, user) {
		if (err) {
			console.log(err);
			res.json({
				error_code: 1,
				success: 0,
				message: '找不到该用户'
			});
			return;
		}
		userObj = _.extend(user, _user);
		userObj.save(function(err, user) {
			if (err) {
				console.log(err);
				res.json({
					error_code: 0,
					success: 0,
					message: '保存出错'
				});
				return;
			}

			res.json({
				error_code: 0,
				success: 1,
				message: '保存成功'
			});
			return;
		})
	})
}