var User = require('../app/controller/account');
var Admin = require('../app/controller/admin');
var Assets = require('../app/controller/assets');
var Bond = require('../app/controller/bond');
var Borrowing = require('../app/controller/borrowing');
var Payment = require('../app/controller/payment');
var Share = require('../app/controller/share');
var Wishlist = require('../app/controller/wishlist');

module.exports = function(app) {
	// pre handle user
	app.use(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST,DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, token');

		app.locals.user = req.session.user;
		next()
	})

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

	app.get('/index', User.signinRequired, function(req, res) {
		res.render('index', {
			title: '主页'
		});
	});


	// Admin -- 超级管理员权限
	app.get('/admin/list', User.adminRequired, Admin.list);
	app.post('/admin/result', User.signinRequired, Admin.result);
	app.get('/admin/detail/:id', User.adminRequired, Admin.detail);
	app.post('/admin/edit', User.adminRequired, Admin.edit);

	// Assets-- 资产
	app.get('/assets/list', User.signinRequired, Assets.list);
	app.post('/assets/result', User.signinRequired, Assets.result);
	app.get('/assets/detail/:id', User.signinRequired, Assets.detail);
	app.get('/assets/add', User.signinRequired, Assets.add);
	app.get('/assets/edit/:id', User.signinRequired, Assets.edit);
	app.post('/assets/action/save', User.signinRequired, Assets.save);
	app.delete('/assets/list', User.signinRequired, Assets.del);

	// bond -- 债券
	app.get('/bond/list', User.signinRequired, Bond.list);
	app.post('/bond/result', User.signinRequired, Bond.result);
	app.get('/bond/detail/:id', User.signinRequired, Bond.detail);
	app.get('/bond/add', User.signinRequired, Bond.add);
	app.get('/bond/edit/:id', User.signinRequired, Bond.edit);
	app.post('/bond/action/save', User.signinRequired, Bond.save);
	app.delete('/bond/list', User.signinRequired, Bond.del);

	// borrowing -- 借贷
	app.get('/borrowing/list', User.signinRequired, Borrowing.list);
	app.post('/borrowing/result', User.signinRequired, Borrowing.result);
	app.get('/borrowing/detail/:id', User.signinRequired, Borrowing.detail);
	app.get('/borrowing/add', User.signinRequired, Borrowing.add);
	app.get('/borrowing/edit/:id', User.signinRequired, Borrowing.edit);
	app.post('/borrowing/action/save', User.signinRequired, Borrowing.save);
	app.delete('/borrowing/list', User.signinRequired, Borrowing.del);

	// payment -- 收支
	app.get('/payment/list', User.signinRequired, Payment.list);
	app.post('/payment/result', User.signinRequired, Payment.result);
	app.get('/payment/detail/:id', User.signinRequired, Payment.detail);
	app.get('/payment/add', User.signinRequired, Payment.add);
	app.get('/payment/edit/:id', User.signinRequired, Payment.edit);
	app.post('/payment/action/save', User.signinRequired, Payment.save);
	app.delete('/payment/list', User.signinRequired, Payment.del);

	app.post('/payment/detail', User.signinRequired, Payment.detailMO);

	// share -- 股票
	app.get('/share/list', User.signinRequired, Share.list);
	app.post('/share/result', User.signinRequired, Share.result);
	app.get('/share/detail/:id', User.signinRequired, Share.detail);
	app.get('/share/add', User.signinRequired, Share.add);
	app.get('/share/edit/:id', User.signinRequired, Share.edit);
	app.post('/share/action/save', User.signinRequired, Share.save);
	app.delete('/share/list', User.signinRequired, Share.del);

	// wishlist -- 心愿单
	app.get('/wishlist/list', User.signinRequired, Wishlist.list);
	app.post('/wishlist/result', User.signinRequired, Wishlist.result);
	app.get('/wishlist/detail/:id', User.signinRequired, Wishlist.detail);
	app.get('/wishlist/add', User.signinRequired, Wishlist.add);
	app.get('/wishlist/edit/:id', User.signinRequired, Wishlist.edit);
	app.post('/wishlist/action/save', User.signinRequired, Wishlist.save);
	app.post('/wishlist/action/buy', User.signinRequired, Wishlist.buy);
	app.delete('/wishlist/list', User.signinRequired, Wishlist.del);


	app.get('*', function(req, res) {
		res.render('404.jade', {
			title: '页面不存在'
		})
	});

}