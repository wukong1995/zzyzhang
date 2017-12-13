const _ = require('underscore');
const Assets = require('../model/assets');
const User = require('../model/account');
const Joi = require('joi');
const schema = Joi.object().keys({
  name: Joi.string().alphanum().min(1).max(16).required(),
  type: Joi.string().required(),
  price: Joi.string().required().regex(/^\\d+(\\.\\d+)?$/),
});

exports.detail = function(req, res, next) {
  if (!req.params || !req.params.id) {
    res.redirect('/assets/list');
    return;
  }
  var id = req.params.id;
  Assets.findById(id, function(err, assets) {
    if (err) {
      return next(err);
    }
    if (assets == null) {
      err = new Error('Not Fount');
      err.status = 404;
      return next(err);
    }
    res.render('assets/detail', {
      title: '资产详情页',
      assets: assets
    });
  });
};

exports.list = function(req, res) {
  var user = req.session.user;
  // 渲染视图模板
  res.render('assets/list', {
    title: '资产列表页',
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
      path: 'assets',
      select: 'name type price meta',
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
      totalCount = user.assets.length;
      var results = user.assets.slice(start, start + limit);
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
  res.render('assets/add', {
    title: '添加资产',
    assets: {
      name: '',
      type: '',
      price: '',
      remark: '',
    }
  });
};

exports.edit = function(req, res, next) {
  if (!req.params || !req.params.id) {
    res.redirect('/assets/list');
    return;
  }
  var id = req.params.id;
  Assets.findById(id, function(err, assets) {
    if (err) {
      return next(err);
    }
    if (assets == null) {
      err = new Error('Not Fount');
      err.status = 404;
      return next(err);
    }
    res.render('assets/add', {
      title: '资产编辑页',
      assets: assets
    });
  });
};

exports.save = function(req, res) {
  if (!req.body || !req.body.assets) {
    console.log('未为传递参数');
    res.redirect('/assets/add');
    return;
  }
  var assetsObj = req.body.assets;
  var id = assetsObj.id;

  if (assetsObj.name == undefined || assetsObj.type == undefined || assetsObj.price == undefined) {
    console.log('未为传递参数');
    if (id) {
      res.redirect('/assets/edit/' + id);
    } else {
      res.redirect('/assets/add');
    }
    return;
  }

  const { error } = Joi.validate(assetsObj, schema.without('password'));
  if (error !== null) {
    if (id) {
      res.redirect('/assets/edit/' + id);
    } else {
      res.redirect('/assets/add');
    }
  }

  if (id) {
    Assets.findById(id, function(err, assets) {
      if (err) {
        console.log(err);
        res.redirect('/assets/edit/' + id);
      }

      const _assets = _.extend(assets, assetsObj);
      _assets.save(function(err, assets) {
        if (err) {
          console.log(err);
          res.redirect('/assets/edit/' + id);
        }
        // 重定向请求
        res.redirect('/assets/detail/' + assets._id);
      });
    });
  } else {

    var user_id = req.session.user._id;
    assetsObj.account = user_id;
    const _assets = new Assets(assetsObj);

    _assets.save(function(err, assets) {
      if (err) {
        console.log(err);
        res.redirect('/assets/add');
      }
      User.findById(user_id, function(err, user) {
        if (err) {
          console.log(err);
          res.redirect('/assets/add');
        }

        user.assets.push(assets._id);
        user.save(function(err) {
          if (err) {
            console.log(err);
            res.redirect('/assets/add');
          }
          res.redirect('/assets/detail/' + assets._id);
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

  Assets.remove({
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
            assets: id
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
