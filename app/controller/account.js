const User = require('../model/account');
const { errMsg } = require('./commen');
const _ = require('underscore');
const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().alphanum().min(4).max(16).required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().regex(/^[a-zA-Z0-9]{6,16}$/),
  telephone: Joi.number().required().regex(/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/),
});

// showSignin
exports.showSignin = function(req, res) {
  res.render('signin', {
    title: '登录页面',
    error: req.session.error,
    signupmsg: req.session.signupmsg
  });
};

// signup
exports.signup = function(req, res) {
  if (!req.body) {
    res.json(errMsg('未发送数据！'));
    return;
  }
  const _user = req.body;
  const { error } = Joi.validate(_user, schema);

  if (error !== null) {
    return res.json(errMsg(error));
  }

  User.findOne({
    name: _user.name
  }, function(err, user) {
    if (err) {
      console.log(err);
      res.json(errMsg('服务器错误！', 1));
      return;
    }
    if (user) {
      res.json(errMsg('用户名已存在！'));
      return;
    } else {
      let new_user = new User(_user);
      new_user.save(function(err) {
        if (err) {
          console.log(err);
          res.json(errMsg('注册失败，请重试！'));
          return;
        }
        res.json(errMsg('恭喜你，注册成功！', 0, 1));
        return;
      });
    }
  });
};

// forgetpwd
exports.forgetpwd = function(req, res) {
  if (!req.body) {
    res.json(errMsg('未发送数据！'));
    return;
  }
  var _user = req.body;

  const { error } = Joi.validate(_user, schema.without('password'));
  if (error !== null) {
    return res.json(errMsg(error));
  }

  User.findOne({
    name: _user.name,
    email: _user.email,
    telephone: _user.telephone
  }, function(err, user) {
    if (err) {
      console.log(err);
      res.json(errMsg('服务器错误', 1));
      return;
    }
    if (user) {
      user.password = '123456';

      user.save(function(err) {
        if (err) {
          console.log(err);
          res.json(errMsg('服务器错误', 1));
          return;
        }
        console.log('password change');
        res.json({
          error_code: 0,
          success: 1,
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
  });
};

// signin
exports.signin = function(req, res) {
  const _user = req.body;
  const { error } = Joi.validate(_user, schema.without('email', 'telephone'));
  if (error !== null) {
    return res.json(errMsg(error));
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
      console.log('no user');

      res.json({
        error_code: 0,
        success: 0,
        message: '找不到该用户！'
      });
      return;
    } else {
      if (user.state == 1) {
        console.log('user freeze');

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
          console.log(user.name, 'success');
          res.json({
            error_code: 0,
            success: 1,
            message: '登录成功！',
            user: user
          });
          return;
        } else {
          console.log('password is not matched');

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
};

// changepwd
exports.changepwd = function(req, res) {
  var user_id = req.session.user._id;

  var _user = req.body;
  const newSchema = Joi.object().keys({
    pwd: Joi.string().regex(/^[a-zA-Z0-9]{6,16}$/).required(),
    newpwd: Joi.string().regex(/^[a-zA-Z0-9]{6,16}$/).required(),
  });

  const { error } = Joi.validate(_user, newSchema);
  if (error !== null) {
    return res.json(errMsg(error));
  }

  User.findById(user_id, function(err, user) {
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
          user.save(function(err) {
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
  }, ['name', 'password', 'telephone', 'email', 'Head_portrait', 'real_name', 'sex', 'birth',
    'signature', 'role', 'state', 'meta'
  ], function(err, user) {
    if (err) {
      console.log(err);
    }
    res.render('account/detail', {
      title: '用户列表',
      account: user
    });
  });
};

// showChangepwd
exports.showChangepwd = function(req, res) {
  res.render('account/changepwd', {
    title: '修改密码页面',
  });
};

//showChange
exports.showChange = function(req, res) {
  var user = req.session.user;
  if (!user) {
    return res.redirect('/signin');
  }

  User.findOne({
    _id: user._id
  }, function(err, user) {
    if (err) {
      console.log(err);
    }
    res.render('account/change', {
      title: '修改资料页面',
      user: user
    });
  });
};

// changeprofile
exports.changeprofile = function(req, res) {
  const id = req.session.user._id;

  if (req.body == undefined || req.body.user == undefined) {
    res.redirect('account/change');
    return;
  }
  const _user = req.body.user;
  const { error } = Joi.validate(_user, schema.without('name', 'telephone'));
  if (error !== null) {
    return res.json(errMsg(error));
  }


  User.findById(id, function(err, user) {
    if (err) {
      console.log(err);
    }
    const userObj = _.extend(user, _user);
    userObj.save(function(err) {
      if (err) {
        console.log(err);
        res.redirect('account/change');
        return;
      }
      // 重定向请求
      res.redirect('/user/detail');
    });
  });
};

// logout
exports.logout = function(req, res) {
  delete req.session.user;
  //delete app.locals.user
  res.redirect('/');
};

// midware for user
exports.signinRequired = function(req, res, next) {
  var user = req.session.user;
  if (!user) {
    console.log('用户未登录');
    return res.redirect('/');
  }
  next();
};

/* 中间件 */
exports.adminRequired = function(req, res, next) {
  var user = req.session.user;
  if (user.role < 10) {
    return res.redirect('');
  }
  next();
};
