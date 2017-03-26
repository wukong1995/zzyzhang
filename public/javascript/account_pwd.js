jQuery(function($) {
	bootbox.setDefaults("locale", "zh_CN");

	function ismatch() {
		$.ajax({
				async: false,
				type: 'POST',
				url: '/user/verifypwd',
				data: {
					pwd: $('#pwd').val()
				}
			})
			.success(function(res) {
				console.log()
				if (res.ismatch) {
					return true;
				} else {
					bootbox.alert(res.message);
					return false;
				}
			})
			.error(function(err) {
				bootbox.alert(err);
				return false;
			});
	}


	$('#form_submit').on('click', function() {
		if ($('#pwd').val() == "") {
			$('#pwd').tips({
				msg: '请输入原密码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#pwd').focus();
			return false;
		}

		if (!/^[a-zA-Z0-9]{6,16}$/.test($('#pwd').val())) {
			$('#pwd').tips({
				msg: '密码由6-16位的字母、数字组成',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#pwd').focus();
			return false;
		}
		if ($('#newpwd').val() == "") {
			$('#newpwd').tips({
				msg: '请输入新密码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#newpwd').focus();
			return false;
		}

		if (!/^[a-zA-Z0-9]{6,16}$/.test($('#newpwd').val())) {
			$('#newpwd').tips({
				msg: '密码由6-16位的字母、数字组成',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#newpwd').focus();
			return false;
		}
		if ($('#confirmpwd').val() == "") {
			$('#confirmpwd').tips({
				msg: '请再次输入密码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#confirmpwd').focus();
			return false;
		}
		if ($('#confirmpwd').val() != $('#newpwd').val()) {
			$('#confirmpwd').tips({
				msg: '两次输入密码一致',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#confirmpwd').focus();
			return false;
		}
		// 判断用户名是否注册
		if (!ismatch()) {
			return false;
		}

		$('#form').submit();

	});

});