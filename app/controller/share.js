const _ = require('underscore');
const Share = require('../model/share');
const User = require('../model/account');
const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(16).required(),
  count: Joi.string().required(),
  first_price: Joi.string().required().regex(/^\\d+(\\.\\d+)?$/),
  last_price: Joi.string().required().regex(/^\\d+(\\.\\d+)?$/),
});

exports.detail = function(req, res, next) {
  if (!req.params || !req.params.id) {
    res.redirect('/share/list');
    return;
  }

  const id = req.params.id;
  Share.findById(id, function(err, share) {
    if (err) {
      return next(err);
    }
    if (share == null) {
      err = new Error('Not Fount');
      err.status = 404;
      return next(err);
    }
    res.render('share/detail', {
      title: '股票详情页',
      share: share
    });
  });
};

exports.list = function(req, res) {
  var user = req.session.user;
  res.render('share/list', {
    title: '股票列表页',
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
      path: 'share',
      select: 'name count first_price last_price income meta',
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
      totalCount = user.share.length;
      var results = user.share.slice(start, start + limit);
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
  res.render('share/add', {
    title: '股票新增页',
    share: {
      name: '',
      count: '',
      first_price: '',
      last_price: '',
      remark: ''
    }
  });
};

exports.edit = function(req, res) {
  if (!req.params || !req.params.id) {
    res.redirect('/share/list');
    return;
  }

  var id = req.params.id;
  Share.findById(id, function(err, share) {
    res.render('share/add', {
      title: '股票编辑页',
      share: share
    });
  });
};

exports.save = function(req, res) {
  if (!req.body || !req.body.share) {
    res.redirect('/share/add');
    return;
  }
  const shareObj = req.body.share;
  const id = shareObj._id;
  const { error } = Joi.validate(shareObj, schema);

  if (error !== null) {
    if (id) {
      res.redirect('/share/edit/' + id);
    } else {
      res.redirect('/share/add');
    }
    return;
  }

  shareObj.income = parseInt(shareObj.count) * (parseInt(shareObj.last_price) - parseInt(shareObj.first_price));
  var _share;

  if (id) {
    Share.findById(id, function(err, share) {
      if (err) {
        console.log(err);
      }
      _share = _.extend(share, shareObj);
      _share.save(function(err, share) {
        if (err) {
          console.log(err);
        }
        // 重定向请求
        res.redirect('/share/detail/' + share._id);
      });
    });
  } else {
    var user_id = req.session.user._id;
    shareObj.account = user_id;
    _share = new Share(shareObj);

    _share.save(function(err, share) {
      if (err) {
        console.log(err);
      }

      User.findById(user_id, function(err, user) {
        if (err) {
          console.log(err);
        }
        user.share.push(share._id);
        user.save(function(err) {
          if (err) {
            console.log(err);
          }
          res.redirect('/share/detail/' + share._id);
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

  Share.remove({
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
            share: id
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
