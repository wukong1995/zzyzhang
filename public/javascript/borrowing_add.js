$(function() {
	$('#form_submit').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		if ($('#borrowing_other').val() == "") {
			$('#borrowing_other').tips({
				msg: '请输入对方名字',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_other').focus();
			return false;
		}
		if ($('#borrowing_other').val().length > 20) {
			$('#borrowing_other').tips({
				msg: '输入名字不符合要求',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_other').focus();
			return false;
		}
		if ($('#borrowing_telphone').val() == "") {
			$('#borrowing_telphone').tips({
				msg: '请输入对方手机号码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_telphone').focus();
			return false;
		}
		if (!/^1(3|4|5|7|8)[0-9]\d{8}$/.test($('#borrowing_telphone').val())) {
			$('#borrowing_telphone').tips({
				msg: '请输入正确的手机号码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_telphone').focus();
			return false;
		}
		if ($('#borrowing_price').val() == "") {
			$('#borrowing_price').tips({
				msg: '请输入金额',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_price').focus();
			return false;
		}
		if (parseInt($('#borrowing_price').val()) == 0) {
			$('#borrowing_price').tips({
				msg: '金额需大于零',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_price').focus();
			return false;
		}
		if (!/^\d+(\.\d+)?$/.test($('#borrowing_price').val())) {
			$('#borrowing_price').tips({
				msg: '只能为大于零的数',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_price').focus();
			return false;
		}
		if (parseInt($('#borrowing_price').val()) > 1000000000) {
			$('#borrowing_price').tips({
				msg: '不能超过一亿',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#borrowing_price').focus();
			return false;
		}


		$('#borrowing_form').submit();
	});
});