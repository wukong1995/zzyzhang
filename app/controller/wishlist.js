const _ = require('underscore');
const Wishlist = require('../model/wishlist');
const User = require('../model/account');
const Payment = require('../model/payment');
const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(16).required(),
  product_type: Joi.string().required(),
  price: Joi.string().required().regex(/^\\d+(\\.\\d+)?$/),
});

exports.detail = function(req, res, next) {
  if (!req.params || !req.params.id) {
    res.redirect('/wishlist/list');
    return;
  }
  var id = req.params.id;
  Wishlist.findById(id, function(err, wishlist) {
    if (err) {
      return next(err);
    }
    if (wishlist == null) {
      err = new Error('Not Fount');
      err.status = 404;
      return next(err);
    }
    res.render('wishlist/detail', {
      title: '心愿详情页',
      wishlist: wishlist
    });
  });
};

exports.list = function(req, res) {
  var user = req.session.user;
  res.render('wishlist/list', {
    title: '心愿列表页',
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
  var user_id = req.session.user._id;

  User
    .findOne({
      _id: user_id
    }).populate({
      path: 'wishlist',
      select: 'name product_type price meta',
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
      }
      totalCount = user.wishlist.length;
      var results = user.wishlist.slice(start, start + limit);
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
  res.render('wishlist/add', {
    title: '心愿新增页',
    wishlist: {
      name: '',
      price: ''
    }
  });
};

exports.edit = function(req, res) {
  if (!req.params || !req.params.id) {
    res.redirect('/wishlist/list');
    return;
  }
  var id = req.params.id;

  Wishlist.findById(id, function(err, wishlist) {
    res.render('wishlist/add', {
      title: '心愿编辑页',
      wishlist: wishlist
    });
  });
};

exports.save = function(req, res) {
  if (!req.body || !req.body.wishlist) {
    res.redirect('/wishlist/add');
    return;
  }
  const wishlistObj = req.body.wishlist;
  const id = wishlistObj._id;
  const { error } = Joi.validate(wishlistObj, schema);

  if (error !== null) {
    if (id) {
      res.redirect('/wishlist/edit/' + id);
    } else {
      res.redirect('/wishlist/add');
    }
    return;
  }

  var _wishlist;

  if (id) {
    Wishlist.findById(id, function(err, wishlist) {
      if (err) {
        console.log(err);
      }
      _wishlist = _.extend(wishlist, wishlistObj);
      _wishlist.save(function(err, wishlist) {
        if (err) {
          console.log(err);
        }
        // 重定向请求
        res.redirect('/wishlist/detail/' + wishlist._id);
      });
    });
  } else {
    var user_id = req.session.user._id;
    wishlistObj.account = user_id;
    _wishlist = new Wishlist(wishlistObj);

    _wishlist.save(function(err, wishlist) {
      if (err) {
        console.log(err);
      }

      User.findById(user_id, function(err, user) {
        if (err) {
          console.log(err);
        }
        user.wishlist.push(wishlist._id);
        user.save(function(err) {
          if (err) {
            console.log(err);
          }
          res.redirect('/wishlist/detail/' + wishlist._id);
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

  Wishlist.remove({
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
            wishlist: id
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

exports.buy = function(req, res) {
  if (!req.query || !req.query.id) {
    res.json({
      success: 0,
      msg: '无传递参数id'
    });
    return;
  }
  var id = req.query.id;
  var user_id = req.session.user._id;

  if (id) {
    Wishlist.findById(id, function(err, wishlist) {
      Wishlist.remove({
        _id: id
      }, function(err) {
        if (err) {
          console.log(err);
          res.json({
            success: 0
          });
        } else {

          User.update({
            _id: user_id
          }, {
            '$pull': {
              wishlist: id
            }
          });

          var payment = {
            type: 1,
            name: wishlist.name,
            price: wishlist.price,
            product_type: wishlist.product_type,
            remark: wishlist.remark,
            account: wishlist.account
          };

          var _payment = new Payment(payment);
          _payment.save(function(err, payment) {
            if (err) {
              console.log(err);
              res.json({
                success: 0
              });
            }
            User.findById(user_id, function(err, user) {
              if (err) {
                console.log(err);
                res.json({
                  success: 0
                });
              }
              user.payment.push(payment._id);
              user.save(function(err) {
                if (err) {
                  console.log(err);
                  res.json({
                    success: 0
                  });
                } else {
                  res.json({
                    success: 1
                  });
                }
              });
            });
          });
        }
      });
    });
  }
};

