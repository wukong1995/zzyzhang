const Payment = require('../model/payment');
const User = require('../model/account');
const Joi = require('joi');
const mongoose = require('mongoose');

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(16).required(),
  product_type: Joi.string().required(),
  price: Joi.string().required().regex(/^\d+(\.\d+)?$/),
  type: Joi.string(),
  remark: Joi.string()
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
    const user_id = req.session.user._id;

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
    console.log('缺少参数');
    res.redirect('/payment/add');
    return;
  }
  const paymentObj = req.body.payment;

  const { error } = Joi.validate(paymentObj, schema);

  if (error !== null) {
    console.log('验证数据错误', error);
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
  var user_id = req.session.user._id;

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

exports.monthBill = function(req, res) {
  var year = new Date().getFullYear();
  var month = new Date().getMonth() + 1;
  var date = req.query.date;
  if (date) {
    year = date.split('-')[0];
    month = date.split('-')[1];
  }
  date = new Date(year, month, 0);

  Payment
    .aggregate()
    .match({
      'meta.createAt': {
        $gte: new Date(year + '-' + month + '-01'),
        $lt: new Date(year + '-' + month + '-' + date.getDate())
      },
      'account': new mongoose.Types.ObjectId(req.session.user._id)
    })
    .group({
      _id: '$type',
      data: {
        $sum: '$price'
      }
    })
    .exec(function(err, payment) {
      if (err) {
        console.log(err);
        res.json({
          error_code: 1,
          success: 0,
          msg: '数据库查询出错'
        });
        return;
      }
      payment.forEach(function(item) {
        if (item._id == 0) {
          item.label = '收入(' + item.data + ')';
        } else {
          item.label = '支出(' + item.data + ')';
        }
      });

      res.json({
        error_code: 0,
        success: 1,
        msg: '查询成功',
        data: payment
      });
      return;
    });
};
