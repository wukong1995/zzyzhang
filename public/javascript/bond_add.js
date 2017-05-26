$(function() {
	$('#form_submit').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */

		if ($('#bond_name').val() == "") {
			$('#bond_name').tips({
				msg: '请输入债券名字',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_name').focus();
			return false;
		}
		if ($('#bond_code').val() == "") {
			$('#bond_code').tips({
				msg: '请选择债券代码',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_code').focus();
			return false;
		}
		if ($('#bond_purchase').val() == "") {
			$('#bond_purchase').tips({
				msg: '请输入债券买入价格',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_purchase').focus();
			return false;
		}
		if (parseInt($('#bond_purchase').val()) == 0) {
			$('#bond_purchase').tips({
				msg: '买入需大于零',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_purchase').focus();
			return false;
		}
		if (!/^\d+(\.\d+)?$/.test($('#bond_purchase').val())) {
			$('#bond_purchase').tips({
				msg: '只能为大于零的数',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_purchase').focus();
			return false;
		}
		if (parseInt($('#bond_purchase').val()) > 1000000000) {
			$('#bond_purchase').tips({
				msg: '不能超过一亿',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_purchase').focus();
			return false;
		}

		if ($('#bond_yield').val() == "") {
			$('#bond_yield').tips({
				msg: '请输入债券收益率',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_yield').focus();
			return false;
		}
		if (!/^(\-)?\d+(\.\d+)?$/.test($('#bond_yield').val())) {
			$('#bond_yield').tips({
				msg: '债券收益率只能是数字',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_yield').focus();
			return false;
		}
		if (parseInt($('#bond_yield').val()) > 1) {
			$('#bond_yield').tips({
				msg: '不能超过一万',
				side: 3,
				bg: '#AE81FF',
				time: 1,
			});
			$('#bond_yield').focus();
			return false;
		}

		$('#bond_form').submit();
	});
});