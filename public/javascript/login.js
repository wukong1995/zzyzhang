jQuery(function($) {
	$(document).on('click', '.toolbar a[data-target]', function(e) {
		e.preventDefault();
		var target = $(this).data('target');
		$('.widget-box.visible').removeClass('visible'); //hide others
		$(target).addClass('visible'); //show target
	});

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

	function checkSigninForm() {
		if ($('#name').val() == "") {
			$('#name').tips({
				msg: '请输入用户名',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#name').focus();
			return false;
		}
		if ($('#name').val().length > 16) {
			$('#name').tips({
				msg: '用户名太长',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#name').focus();
			return false;
		}
		if ($('#password').val() == "") {
			$('#password').tips({
				msg: '请输入密码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#password').focus();
			return false;
		}
		if (!/^[a-zA-Z0-9]{6,16}$/.test($('#password').val())) {
			$('#password').tips({
				msg: '密码由6-16位的字母、数字组成',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#password').focus();
			return false;
		}
		return true;
	}
	function checkSignupForm() {
		if ($('#new_name').val() == "") {
			$('#new_name').tips({
				msg: '请输入用户名',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_name').focus();
			return false;
		}
		if ($('#new_name').val().length > 16) {
			$('#new_name').tips({
				msg: '用户名太长',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_name').focus();
			return false;
		}

		if ($('#new_email').val() == "") {
			$('#new_email').tips({
				msg: '请输入邮箱',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_email').focus();
			return false;
		}
		if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test($('#new_email').val())) {
			$('#new_email').tips({
				msg: '请正确输入邮箱',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_email').focus();
			return false;
		}

		if ($('#new_tel').val() == "") {
			$('#new_tel').tips({
				msg: '请输入手机号码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_tel').focus();
			return false;
		}
		if (!/^1(3|4|5|7|8)[0-9]\d{8}$/.test($('#new_tel').val())) {
			$('#new_tel').tips({
				msg: '请输入正确的手机号码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_tel').focus();
			return false;
		}

		if ($('#new_pwd').val() == "") {
			$('#new_pwd').tips({
				msg: '请输入密码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_pwd').focus();
			return false;
		}

		if (!/^[a-zA-Z0-9]{6,16}$/.test($('#new_pwd').val())) {
			$('#new_pwd').tips({
				msg: '密码由6-16位的字母、数字组成',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_pwd').focus();
			return false;
		}
		if ($('#new_pwd_confirm').val() == "") {
			$('#new_pwd_confirm').tips({
				msg: '请再次输入密码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_pwd_confirm').focus();
			return false;
		}
		if ($('#new_pwd_confirm').val() != $('#new_pwd').val()) {
			$('#new_pwd_confirm').tips({
				msg: '两次输入密码一致',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#new_pwd_confirm').focus();
			return false;
		}
		return true;
	}

	$('#signin_submit').on('click', function() {
		if(checkSigninForm()) {
			$.ajax({
          url: '/user/signin',
          type: 'post',
          dataType: 'json',
          data: {
              user:{
              	name:$('#name').val(),
								password:$('#pwd').val()
              }
          },
          success: function (res) {
              if(res.success == 0) {
                  bootbox.alert(res.message);
              } else {
                  window.location.href = '/index';
              }
          },
          error: function (err) {
             alert('请求错误！');
          }
      });
		}
	});


	$('#signup_submit').on('click', function() {
		if(checkSignupForm()) {
			$.ajax({
          url: '/user/signup',
          type: 'post',
          dataType: 'json',
          data: {
              newuser:{
              	name:$('#new_name').val(),
								email:$('#new_email').val(),
								telphone:$('#new_tel').val(),
								password:$('#new_pwd').val()
              }
          },
          success: function (res) {
              bootbox.alert(res.message);
          },
          error: function (err) {
             alert('请求错误！');
          }
      });
		}
		
	});

	$('#forget_submit').on('click', function() {
		if ($('#forget_name').val() == "") {
			$('#forget_name').tips({
				msg: '请输入用户名',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#forget_name').focus();
			return false;
		}
		if ($('#forget_name').val().length > 16) {
			$('#forget_name').tips({
				msg: '用户名太长',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#forget_name').focus();
			return false;
		}
		if ($('#forget_email').val() == "") {
			$('#forget_email').tips({
				msg: '请输入注册时填写的邮箱',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#forget_email').focus();
			return false;
		}
		if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test($('#forget_email').val())) {
			$('#forget_email').tips({
				msg: '请正确输入邮箱',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#forget_email').focus();
			return false;
		}


		if ($('#forget_tel').val() == "") {
			$('#forget_tel').tips({
				msg: '请输入注册时填写的手机号',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#forget_tel').focus();
			return false;
		}
		if (!/^1(3|4|5|7|8)[0-9]\d{8}$/.test($('#forget_tel').val())) {
			$('#forget_tel').tips({
				msg: '请输入正确的手机号码',
				side: 3,
				bg: '#AE81FF',
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