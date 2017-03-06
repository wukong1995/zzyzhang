$(function() {
	$('.delBtn').on('click', function() {
		var tr = $(this).parent().parent();
		$.ajax({
			url: '/person/action/del?id=' + $(this).attr('data-id'),
			type: 'DELETE',
			dataType: 'json',
			success: function(res) {
				if (res.success == 1) {
					alert('删除成功!');
					tr.remove();
				}
			},
			error: function(err) {
				alert("删除失败！");
			}
		});
	});
})