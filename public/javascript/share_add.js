$(function() {
	$('#form_submit').on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		// if ($('#assets_name').val() == "") {
		// 	$('#assets_name').tips({
		// 		msg: '请输入资产名字',
		// 		side: 3,
		// 		bg: '#438eb9',
		// 		time: 1,
		// 	});
		// 	$('#assets_name').focus();
		// 	return false;
		// }


		$('#share_form').submit();
	});
});