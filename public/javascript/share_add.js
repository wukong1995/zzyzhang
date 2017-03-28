$(function() {
	$('#form_submit').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		if ($('#share_name').val() == "") {
			$('#share_name').tips({
				msg: '请输入股票名字',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_name').focus();
			return false;
		}
		if ($('#share_count').val() == "") {
			$('#share_count').tips({
				msg: '请输入股数',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_count').focus();
			return false;
		}
		if (parseInt($('#share_count').val()) == 0) {
			$('#share_count').tips({
				msg: '股数需大于零',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_count').focus();
			return false;
		}
		if (!/^\d+$/.test($('#share_count').val())) {
			$('#share_count').tips({
				msg: '股数只能为大于零的数',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_count').focus();
			return false;
		}
		if ($('#share_first_price').val() == "") {
			$('#share_first_price').tips({
				msg: '请输入买入价格',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_first_price').focus();
			return false;
		}
		if (parseInt($('#share_first_price').val()) == 0) {
			$('#share_first_price').tips({
				msg: '买入价格需大于零',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_first_price').focus();
			return false;
		}
		if (!/^\d+(\.\d+)?$/.test($('#share_first_price').val())) {
			$('#share_first_price').tips({
				msg: '买入价格只能为大于零的数',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_first_price').focus();
			return false;
		}
		if ($('#share_last_price').val() == "") {
			$('#share_last_price').tips({
				msg: '请输入卖出价格',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_last_price').focus();
			return false;
		}
		if (parseInt($('#share_last_price').val()) == 0) {
			$('#share_last_price').tips({
				msg: '卖出价格需大于零',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_last_price').focus();
			return false;
		}
		if (!/^\d+(\.\d+)?$/.test($('#share_last_price').val())) {
			$('#share_last_price').tips({
				msg: '卖出价格只能为大于零的数',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#share_last_price').focus();
			return false;
		}

		$('#share_form').submit();
	});
});