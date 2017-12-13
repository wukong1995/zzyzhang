const _ = require('underscore');
const Borrowing = require('../model/borrowing');
const User = require('../model/account');
const Joi = require('joi');

const schema = Joi.object().keys({
  other: Joi.string().min(1).max(16).required(),
  telephone: Joi.string().required().regex(/^((0\\d{2,3}-\\d{7,8})|(1[3584]\\d{9}))$/),
  type: Joi.string().required(),
  price: Joi.string().required().regex(/^\\d+(\\.\\d+)?$/),
});

exports.detail = function(req, res, next) {
  if (!req.params || !req.params.id) {
    res.redirect('/borrowing/list');
    return;
  }
  var id = req.params.id;
  Borrowing.findById(id, function(err, borrowing) {
    if (err) {
      return next(err);
    }
    if (borrowing == null) {
      err = new Error('Not Fount');
      err.status = 404;
      return next(err);
    }
    res.render('borrowing/detail', {
      title: '借贷详情页',
      borrowing: borrowing
    });
  });
};

exports.list = function(req, res) {
  var user = req.session.user;
  res.render('borrowing/list', {
    title: '借贷列表页',
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
  const user_id = req.session.user._id;

  User
    .findOne({
      _id: user_id
    }).populate({
      path: 'borrowing',
      select: 'other telephone price type meta',
      match: {
        other: new RegExp(keyword, 'i')
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
      totalCount = user.borrowing.length;
      var results = user.borrowing.slice(start, start + limit);
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
  res.render('borrowing/add', {
    title: '借贷新增页',
    borrowing: {
      name: '',
      price: ''
    }
  });
};

exports.edit = function(req, res) {
  if (!req.params || !req.params.id) {
    res.redirect('/borrowing/list');
    return;
  }
  var id = req.params.id;

  Borrowing.findById(id, function(err, borrowing) {
    res.render('borrowing/add', {
      title: '借贷编辑页',
      borrowing: borrowing
    });
  });
};

exports.save = function(req, res) {
  if (!req.body || !req.body.borrowing) {
    console.log('缺少参数	');
    res.redirect('/borrowing/add');
    return;
  }
  var borrowingObj = req.body.borrowing;
  var id = borrowingObj._id;

  const { error } = Joi.validate(borrowingObj, schema);

  if (error !== null) {
    console.log('缺少参数 ');
    if (id) {
      res.redirect('/borrowing/edit/' + id);
    } else {
      res.redirect('/borrowing/add');
    }
    return;
  }

  var _borrowing;
  if (id) {
    Borrowing.findById(id, function(err, borrowing) {
      if (err) {
        console.log(err);
        res.redirect('/borrowing/edit/' + id);
      }
      _borrowing = _.extend(borrowing, borrowingObj);
      _borrowing.save(function(err, borrowing) {
        if (err) {
          console.log(err);
          res.redirect('/borrowing/edit/' + id);
        }
        // 重定向请求
        res.redirect('/borrowing/detail/' + borrowing._id);
      });
    });
  } else {
    var user_id = req.session.user._id;
    borrowingObj.account = user_id;
    _borrowing = new Borrowing(borrowingObj);

    _borrowing.save(function(err, borrowing) {
      if (err) {
        console.log(err);
        res.redirect('/borrowing/add');
      }

      User.findById(user_id, function(err, user) {
        if (err) {
          console.log(err);
          res.redirect('/borrowing/add');
        }
        user.borrowing.push(borrowing._id);
        user.save(function(err) {
          if (err) {
            console.log(err);
            res.redirect('/borrowing/add');
          }
          res.redirect('/borrowing/detail/' + borrowing._id);
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
  var user_id = req.session.user._id;

  Borrowing.remove({
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
            borrowing: id
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

