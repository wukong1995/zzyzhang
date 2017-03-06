var _ = require('underscore')
var mongoose = require('mongoose');
var Bond = require('../model/bond');
var User = require('../model/account');

exports.detail = function(req, res) {
	var id = req.params.id

	// res.sendFile()直接输出html文件
	bond.findById(id, function(err, bond) {
		res.render('bond/detail', {
			title: '详情页',
			bond: bond
		})
	});
};

exports.list = function(req, res) {

	User.findOne({
			_id: req.session.user._id
		}).populate({
			path: 'bond',
			options: {
				limit: 10
			}
		})
		.exec(function(err, user) {
			if (err) {
				console.log(err)
			}
			// 渲染视图模板
			res.render('bond/list', {
				title: '列表页',
				bonds: user.bond || []
			})
		});
};

exports.add = function(req, res) {
	// res.sendFile()直接输出html文件
	res.render('bond/add', {
		title: '新增页',
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
			title: '编辑页',
			bond: bond
		})
	});
};

exports.save = function(req, res) {
	var id = req.body.bond._id;
	var bondObj = req.body.bond;
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
					res.redirect('/bond/detail/' + food._id);
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
				console.log(bond)
			} else {
				res.json({
					success: 1
				})
			}
		})
	}
}