var _ = require('underscore')
var mongoose = require('mongoose');
var Bond = require('../model/bond');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	Bond.findById(id, function(err, bond) {
		res.render('bond/detail', {
			title: '债券详情页',
			bond: bond
		})
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
	var page = req.body.page ? parseInt(req.body.page) : 1;
	var start = req.body.start ? parseInt(req.body.start) : 0;
	var limit = req.body.limit ? parseInt(req.body.limit) : 15;
	var keyword = req.body.keyword ? req.body.keyword : '';

	var totalCount = 0;
	if (req.session.user) {
		var userId = req.session.user._id;
	} else {
		var userId = req.headers['token'];
	}

	User.findOne({
			_id: userId
		}).populate({
			path: 'bond',
			select: 'name code purchase yield income meta',
			match: {
				name: new RegExp(keyword, "i")
			},
			options:{
				sort: { 'meta.createAt': -1 }
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			totalCount = user.bond.length;
			var results = user.bond.slice(start, start + limit);
			res.json({
				page: (page + 1),
				bond: results || [],
				totalCount: totalCount
			})
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
	})
};

exports.edit = function(req, res) {
	var id = req.params.id

	Bond.findById(id, function(err, bond) {
		res.render('bond/add', {
			title: '债券编辑页',
			bond: bond
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.bond._id;
	var bondObj = req.body.bond;
	bondObj.income = parseFloat(bondObj.purchase) * parseFloat(bondObj.yield);
	var _bond;

	if (id) {
		Bond.findById(id, function(err, bond) {
			if (err) {
				console.log(err)
			}
			_bond = _.extend(bond, bondObj);
			_bond.save(function(err, bond) {
				if (err) {
					console.log(err)
				}
				// 重定向请求
				res.redirect('/bond/detail/' + bond._id)
			})
		})
	} else {
		var user_id = req.session.user._id;
		bondObj.account = user_id;
		_bond = new Bond(bondObj);

		_bond.save(function(err, bond) {
			if (err) {
				console.log(err);
			}

			User.findById(user_id, function(err, user) {
				if (err) {
					console.log(err);
				}
				user.bond.push(bond._id)
				user.save(function(err, user) {
					if (err) {
						console.log(err)
					}
					res.redirect('/bond/detail/' + bond._id);
				});
			});

		});
	}
}

exports.del = function(req, res) {
	var id = req.query.id;
	if (id) {
		Bond.remove({
			_id: id
		}, function(err, movie) {
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
		})
	}
}