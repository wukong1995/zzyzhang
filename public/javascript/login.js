jQuery(function($) {
	$(document).on('click', '.toolbar a[data-target]', function(e) {
		e.preventDefault();
		var target = $(this).data('target');
		$('.widget-box.visible').removeClass('visible'); //hide others
		$(target).addClass('visible'); //show target
	});
});



//you don't need this, just used for changing background
jQuery(function($) {
	$('#btn-login-dark').on('click', function(e) {
		$('body').attr('class', 'login-layout');
		$('#id-text2').attr('class', 'white');
		$('#id-company-text').attr('class', 'blue');

		e.preventDefault();
	});
	$('#btn-login-light').on('click', function(e) {
		$('body').attr('class', 'login-layout light-login');
		$('#id-text2').attr('class', 'grey');
		$('#id-company-text').attr('class', 'blue');

		e.preventDefault();
	});
	$('#btn-login-blur').on('click', function(e) {
		$('body').attr('class', 'login-layout blur-login');
		$('#id-text2').attr('class', 'white');
		$('#id-company-text').attr('class', 'light-blue');

		e.preventDefault();
	});

	$('#signin_submit').on('click', function() {
		if ($('#name').val() == "") {
			$('#name').tips({
				msg: '请输入用户名',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#name').focus();
			return false;
		}
		if ($('#password').val() == "") {
			$('#password').tips({
				msg: '请输入密码',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#password').focus();
			return false;
		}
		$('#signin_form').submit();
	});

	$('#signup_submit').on('click', function() {
		if ($('#new_name').val() == "") {
			$('#new_name').tips({
				msg: '请输入用户名',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#new_name').focus();
			return false;
		}
		if ($('#new_email').val() == "") {
			$('#new_email').tips({
				msg: '请输入密码',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#new_email').focus();
			return false;
		}
		if ($('#new_tel').val() == "") {
			$('#new_tel').tips({
				msg: '请输入手机号码',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#new_tel').focus();
			return false;
		}
		if ($('#new_pwd').val() == "") {
			$('#new_pwd').tips({
				msg: '请输入密码',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#new_pwd').focus();
			return false;
		}
		if ($('#new_pwd_confirm').val() == "") {
			$('#new_pwd_confirm').tips({
				msg: '请再次输入密码',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#new_pwd_confirm').focus();
			return false;
		}
		if ($('#new_pwd_confirm').val() != $('#new_pwd').val()) {
			$('#new_pwd_confirm').tips({
				msg: '两次输入密码一致',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#new_pwd_confirm').focus();
			return false;
		}
		$('#signup_form').submit();
	});

	$('#forget_submit').on('click', function() {
		if ($('#forget_name').val() == "") {
			$('#forget_name').tips({
				msg: '请输入用户名',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#forget_name').focus();
			return false;
		}
		if ($('#forget_email').val() == "") {
			$('#forget_email').tips({
				msg: '请输入密码',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#forget_email').focus();
			return false;
		}
		if ($('#forget_tel').val() == "") {
			$('#forget_tel').tips({
				msg: '请输入密码',
				side: 3,
				bg: '#438eb9',
				time: 1,
			});
			$('#forget_tel').focus();
			return false;
		}

		var user = {
			name: $('#forget_name').val(),
			email: $('#forget_email').val(),
			telphone: $('#forget_tel').val()
		};

		$.ajax({
			url: '/user/forgetpwd',
			type: 'POST',
			dataType: 'json',
			data: {
				user: user
			},
			success: function(res) {
				if (res.success == 1) {
					bootbox.alert("密码已重置为123456！请及时修改密码！");
				} else if (res.success == 0) {
					bootbox.alert(res);
				}
			},
			error: function(err) {
				bootbox.alert("重置密码出错，请重试！");
			}
		});
	});

});