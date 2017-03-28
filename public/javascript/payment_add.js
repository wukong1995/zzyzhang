$(function() {
	$('input[name="payment[type]"]').on('click', function(event) {
		console.log($('input[name="payment[type]"]:checked').val())

		if ($('input[name="payment[type]"]:checked').val() == 0) {
			$('#payment_type_1').css('display', 'none');
			$('#payment_type_0').css('display', 'block');
		} else {
			$('#payment_type_0').css('display', 'none');
			$('#payment_type_1').css('display', 'block');
		}
	});

	$('#form_submit').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		if ($('#payment_name').val() == "") {
			$('#payment_name').tips({
				msg: '请输入收支名字',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#payment_name').focus();
			return false;
		}
		if ($('#payment_price').val() == "") {
			$('#payment_price').tips({
				msg: '请输入金额',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#payment_price').focus();
			return false;
		}
		if (parseInt($('#payment_price').val()) == 0) {
			$('#payment_price').tips({
				msg: '金额需大于零',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#payment_price').focus();
			return false;
		}
		if (!/^\d+(\.\d+)?$/.test($('#payment_price').val())) {
			$('#payment_price').tips({
				msg: '只能为大于零的数',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#payment_price').focus();
			return false;
		}


		$('#payment_form').submit();
	});
});