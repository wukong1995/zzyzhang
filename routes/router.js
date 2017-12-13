const User = require('../app/controller/account');
const Admin = require('../app/controller/admin');
const Assets = require('../app/controller/assets');
const Bond = require('../app/controller/bond');
const Borrowing = require('../app/controller/borrowing');
const Payment = require('../app/controller/payment');
const Share = require('../app/controller/share');
const Wishlist = require('../app/controller/wishlist');
const Comment = require('../app/controller/comment');

module.exports = function(app) {
  // pre handle user
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, token');

    app.locals.user = req.session.user;
    next();
  });

  // User
  app.get('/', User.showSignin);
  app.post('/user/signup', User.signup);
  app.post('/user/signin', User.signin);
  app.get('/logout', User.logout);
  app.get('/user/detail', User.signinRequired, User.detail);
  app.get('/user/change', User.signinRequired, User.showChange);
  app.get('/user/changepassword', User.signinRequired, User.showChangepwd);
  app.post('/user/changeprofile', User.changeprofile);
  app.post('/user/forgetpwd', User.forgetpwd);
  app.post('/user/changepwd', User.changepwd);

  // mobile 接口
  app.get('/user/detailmo', User.signinRequired, User.detailMO);
  app.post('/user/changepromo', User.signinRequired, User.changeproMO);

  // 用户首页
  app.get('/index', User.signinRequired, function(req, res) {
    res.render('index', {
      title: '用户主页'
    });
  });


  // Admin -- 超级管理员权限
  app.get('/admin/list', User.adminRequired, Admin.list);
  app.get('/admin/result', User.adminRequired, Admin.result);
  app.get('/admin/detail/:id', User.adminRequired, Admin.detail);
  app.get('/admin/edit', User.adminRequired, Admin.edit);

  // Assets-- 资产
  app.get('/assets/list', User.signinRequired, Assets.list);
  app.get('/assets/result', User.signinRequired, Assets.result);
  app.get('/assets/detail/:id', User.signinRequired, Assets.detail);
  app.get('/assets/add', User.signinRequired, Assets.add);
  app.get('/assets/edit/:id', User.signinRequired, Assets.edit);
  app.post('/assets/action/save', User.signinRequired, Assets.save);
  app.delete('/assets/list/del', User.signinRequired, Assets.del);

  // Assets  -- app接口
  app.get('/assets/detailmo/:id', User.signinRequired, Assets.detailMO);
  app.post('/assets/savemo', User.signinRequired, Assets.saveMO);

  // bond -- 债券
  app.get('/bond/list', User.signinRequired, Bond.list);
  app.get('/bond/result', User.signinRequired, Bond.result);
  app.get('/bond/detail/:id', User.signinRequired, Bond.detail);
  app.get('/bond/add', User.signinRequired, Bond.add);
  app.get('/bond/edit/:id', User.signinRequired, Bond.edit);
  app.post('/bond/action/save', User.signinRequired, Bond.save);
  app.delete('/bond/list/del', User.signinRequired, Bond.del);

  // bond  -- app接口
  app.get('/bond/detailmo/:id', User.signinRequired, Bond.detailMO);
  app.post('/bond/savemo', User.signinRequired, Bond.saveMO);

  // borrowing -- 借贷
  app.get('/borrowing/list', User.signinRequired, Borrowing.list);
  app.get('/borrowing/result', User.signinRequired, Borrowing.result);
  app.get('/borrowing/detail/:id', User.signinRequired, Borrowing.detail);
  app.get('/borrowing/add', User.signinRequired, Borrowing.add);
  app.get('/borrowing/edit/:id', User.signinRequired, Borrowing.edit);
  app.post('/borrowing/action/save', User.signinRequired, Borrowing.save);
  app.delete('/borrowing/list/del', User.signinRequired, Borrowing.del);

  // borrowing  -- app接口
  app.get('/borrowing/detailmo/:id', User.signinRequired, Borrowing.detailMO);
  app.post('/borrowing/savemo', User.signinRequired, Borrowing.saveMO);

  // payment -- 收支
  app.get('/payment/list', User.signinRequired, Payment.list);
  app.get('/payment/result', User.signinRequired, Payment.result);
  app.get('/payment/detail/:id', User.signinRequired, Payment.detail);
  app.get('/payment/add', User.signinRequired, Payment.add);
  app.get('/payment/edit/:id', User.signinRequired, Payment.edit);
  app.post('/payment/action/save', User.signinRequired, Payment.save);
  app.delete('/payment/list/del', User.signinRequired, Payment.del);
  app.get('/payment/monthbill', User.signinRequired, Payment.monthBill);

  // payment -- app接口
  app.get('/payment/detailmo/:id', User.signinRequired, Payment.detailMO);
  app.post('/payment/savemo', User.signinRequired, Payment.saveMO);

  // share -- 股票
  app.get('/share/list', User.signinRequired, Share.list);
  app.get('/share/result', User.signinRequired, Share.result);
  app.get('/share/detail/:id', User.signinRequired, Share.detail);
  app.get('/share/add', User.signinRequired, Share.add);
  app.get('/share/edit/:id', User.signinRequired, Share.edit);
  app.post('/share/action/save', User.signinRequired, Share.save);
  app.delete('/share/list/del', User.signinRequired, Share.del);

  // share  -- app接口
  app.get('/share/detailmo/:id', User.signinRequired, Share.detailMO);
  app.post('/share/savemo', User.signinRequired, Share.saveMO);

  // wishlist -- 心愿单
  app.get('/wishlist/list', User.signinRequired, Wishlist.list);
  app.get('/wishlist/result', User.signinRequired, Wishlist.result);
  app.get('/wishlist/detail/:id', User.signinRequired, Wishlist.detail);
  app.get('/wishlist/add', User.signinRequired, Wishlist.add);
  app.get('/wishlist/edit/:id', User.signinRequired, Wishlist.edit);
  app.post('/wishlist/action/save', User.signinRequired, Wishlist.save);
  app.get('/wishlist/action/buy', User.signinRequired, Wishlist.buy);
  app.delete('/wishlist/list/del', User.signinRequired, Wishlist.del);

  // wishlist  -- app接口
  app.get('/wishlist/detailmo/:id', User.signinRequired, Wishlist.detailMO);
  app.post('/wishlist/savemo', User.signinRequired, Wishlist.saveMO);

  // comment
  app.get('/comment/list', User.adminRequired, Comment.list);
  app.get('/comment/result', User.adminRequired, Comment.result);
  app.get('/comment/detail/:id', User.adminRequired, Comment.detail);
  app.delete('/comment/list/del', User.signinRequired, Comment.del);
  app.post('/comment/savemo', User.signinRequired, Comment.saveMO);

  // catch 404 and error handler
  app.use(function(req, res, next) {
    const err = new Error('404 Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    console.log(err);

    // render the error page
    res.status(err.status || 500);
    if (err.status === 404) {
      res.render('404.pug', {
        title: '页面不存在'
      });
      return;
    }

    if (err) {
      res.render('500.pug', {
        title: '出错了'
      });
      return;
    }

    next();
  });
};
