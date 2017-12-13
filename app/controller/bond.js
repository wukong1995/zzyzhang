const _ = require('underscore');
const Bond = require('../model/bond');
const User = require('../model/account');
const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().alphanum().min(1).max(16).required(),
  code: Joi.string().required().regex(/^[\\d]{6}$/),
  purchase: Joi.string().required().regex(/^\\d+(\\.\\d+)?$/),
  yield: Joi.number().required().regex(/^(\\-)?\\d+(\\.\\d+)?$/),
});

exports.detail = function(req, res, next) {
  if (!req.params || !req.params.id) {
    res.redirect('/bond/list');
    return;
  }
  var id = req.params.id;
  Bond.findById(id, function(err, bond) {
    if (err) {
      return next(err);
    }
    if (bond == null) {
      err = new Error('Not Fount');
      err.status = 404;
      return next(err);
    }
    res.render('bond/detail', {
      title: '债券详情页',
      bond: bond
    });
  });
};

exports.list = function(req, res) {
  var user = req.session.user;
  res.render('bond/list', {
    title: '债券列表页',
    user: user
  });
};

exports.result = function(req, res) {

  //判断是否是第一页，并把请求的页数转换成 number 类型
  var page = req.query.page ? parseInt(req.query.page) : 1;
  var start = req.query.start ? parseInt(req.query.start) : 0;
  var limit = req.query.limit ? parseInt(req.query.limit) : 15;
  var keyword = req.query.keyword ? req.query.keyword : '';

  var totalCount = 0;
  var user_id = '';
  if (req.session.user) {
    user_id = req.session.user._id;
  } else {
    user_id = req.headers['token'];
  }

  User
    .findOne({
      _id: user_id
    }).populate({
      path: 'bond',
      select: 'name code purchase yield income meta',
      match: {
        name: new RegExp(keyword, 'i')
      },
      options: {
        sort: {
          'meta.createAt': -1
        }
      }
    })
    .exec(function(err, user) {
      if (err) {
        console.log(err);
        res.json({
          success: 0,
          msg: '服务器错误'
        });
        return;
      }
      totalCount = user.bond.length;
      var results = user.bond.slice(start, start + limit);
      res.json({
        success: 1,
        page: (page + 1),
        data: results || [],
        totalCount: totalCount
      });
    });
};

exports.add = function(req, res) {
  // res.sendFile()直接输出html文件
  res.render('bond/add', {
    title: '债券新增页',
    bond: {
      name: '',
      code: '',
      price: '',
      interest_rate: '',
    }
  });
};

exports.edit = function(req, res) {
  if (!req.params || !req.params.id) {
    res.redirect('/bond/list');
    return;
  }
  var id = req.params.id;

  Bond.findById(id, function(err, bond) {
    res.render('bond/add', {
      title: '债券编辑页',
      bond: bond
    });
  });
};

exports.save = function(req, res) {
  if (!req.body || !req.body.bond) {
    console.log('缺少参数	');
    res.redirect('/bond/add');
    return;
  }
  var id = req.body.bond._id;
  var bondObj = req.body.bond;
  const { error } = Joi.validate(bondObj, schema);

  if (error !== null) {
    console.log('缺少参数 ');
    if (id) {
      res.redirect('/bond/edit/' + id);
    } else {
      res.redirect('/bond/add');
    }
    return;
  }

  bondObj.income = parseFloat(bondObj.purchase) * parseFloat(bondObj.yield);
  var _bond;

  if (id) {
    Bond.findById(id, function(err, bond) {
      if (err) {
        console.log(err);
        res.redirect('/bond/edit/' + id);
      }
      _bond = _.extend(bond, bondObj);
      _bond.save(function(err, bond) {
        if (err) {
          console.log(err);
          res.redirect('/bond/edit/' + id);
        }
        // 重定向请求
        res.redirect('/bond/detail/' + bond._id);
      });
    });
  } else {
    var user_id = req.session.user._id;
    bondObj.account = user_id;
    _bond = new Bond(bondObj);

    _bond.save(function(err, bond) {
      if (err) {
        console.log(err);
        res.redirect('/bond/add');
      }

      User.findById(user_id, function(err, user) {
        if (err) {
          console.log(err);
          res.redirect('/bond/add');
        }
        user.bond.push(bond._id);
        user.save(function(err) {
          if (err) {
            console.log(err);
            res.redirect('/bond/add');
          }
          res.redirect('/bond/detail/' + bond._id);
        });
      });

    });
  }
};

exports.del = function(req, res) {
  if (!req.query || !req.query.id) {
    res.json({
      success: 0,
      msg: '无传递参数id'
    });
    return;
  }

  var id = req.query.id;
  var user_id = '';

  if (req.session.user) {
    user_id = req.session.user._id;
  } else {
    user_id = req.headers['token'];
  }

  Bond.remove({
    _id: id
  }, function(err) {
    if (err) {
      console.log(err);
      res.json({
        success: 0
      });
    } else {
      User
        .update({
          _id: user_id
        }, {
          '$pull': {
            bond: id
          }
        })
        .exec(function(err) {
          if (err) {
            console.log(err);
            res.json({
              error_code: 1,
              success: 0,
              msg: '数据未查询到用户'
            });
            return;
          }
          res.json({
            error_code: 0,
            success: 1
          });
        });
    }
  });
};
