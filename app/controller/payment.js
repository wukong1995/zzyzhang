const Payment = require('../model/payment');
const User = require('../model/account');
const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().alphanum().min(1).max(16).required(),
  product_type: Joi.string().required(),
  price: Joi.number().required().regex(/^\\d+(\\.\\d+)?$/),
});

exports.detail = function(req, res, next) {
  try {

    if (!req.params || !req.params.id) {
      res.redirect('/payment/list');
      return;
    }

    var id = req.params.id;
    Payment.findById(id, function(err, payment) {
      if (err) {
        return next(err);
      }
      if (payment == null) {
        err = new Error('Not Fount');
        err.status = 404;
        return next(err);
      }
      res.render('payment/detail', {
        title: '详情页',
        payment: payment
      });
    });
  } catch (err) {
    return next(err);
  }
};

exports.list = function(req, res, next) {
  try {
    var user = req.session.user;
    res.render('payment/list', {
      title: '列表页',
      user: user
    });
  } catch (err) {
    return next(err);
  }
};

exports.result = function(req, res, next) {
  try {

    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = req.query.page ? parseInt(req.query.page) : 0;
    var start = req.query.start ? parseInt(req.query.start) : 0;
    var limit = req.query.limit ? parseInt(req.query.limit) : 15;
    var keyword = req.query.keyword ? req.query.keyword : '';
    var user_id = '';
    if (req.session.user) {
      user_id = req.session.user._id;
    } else {
      user_id = req.headers['token'];
    }

    var totalCount = 0;

    User
      .findOne({
        _id: user_id
      }).populate({
        path: 'payment',
        select: 'name type price product_type meta',
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
        totalCount = user.payment.length;

        var results = user.payment.slice(start, start + limit);
        res.json({
          page: (page + 1),
          data: results || [],
          totalCount: totalCount
        });
      });
  } catch (err) {
    return next(err);
  }
};

exports.add = function(req, res, next) {
  try {
    res.render('payment/add', {
      title: '新增页',
      payment: {
        name: '',
        price: '',
        type: '',
        product_type: '',
        remrk: ''
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.edit = function(req, res, next) {
  if (!req.params || !req.params.id) {
    res.redirect('/payment/list');
    return;
  }
  var id = req.params.id;

  Payment.findById(id, function(err, payment) {
    if (err) {
      return next(err);
    }
    res.render('payment/add', {
      title: '编辑页',
      payment: payment
    });
  });
};

exports.save = function(req, res) {
  if (!req.body || !req.body.payment) {
    res.redirect('/payment/add');
    return;
  }
  const paymentObj = req.body.payment;

  const { error } = Joi.validate(paymentObj, schema);

  if (error !== null) {
    res.redirect('/payment/add');
    return;
  }


  var _payment;
  var user_id = req.session.user._id;
  paymentObj.account = user_id;
  _payment = new Payment(paymentObj);

  _payment.save(function(err, payment) {
    if (err) {
      console.log(err);
    }

    User.findById(user_id, function(err, user) {
      if (err) {
        console.log(err);
      }
      user.payment.push(payment._id);
      user.save(function(err) {
        if (err) {
          console.log(err);
        }
        res.redirect('/payment/detail/' + payment._id);
      });
    });
  });
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

  Payment.remove({
    _id: id
  }, function(err) {
    if (err) {
      console.log(err);
      res.json({
        error_code: 1,
        success: 0
      });
      return;
    } else {
      User
        .update({
          _id: user_id
        }, {
          '$pull': {
            payment: id
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
