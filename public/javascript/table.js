jQuery(function($) {
	$(document).on('click', 'th input:checkbox', function() {
		var that = this;
		$(this).closest('table').find('tr > td:first-child input:checkbox')
			.each(function() {
				this.checked = that.checked;
				$(this).closest('tr').toggleClass('selected');
			});
	});
	var baseUrl = window.location.pathname;
	$("#page").on('keyup', function(event) {
		var event = event || window.event;
		if (event.keyCode == 13) {
			var p = $(this).val();
			var totalPage = parseInt($('#total_page').html());
			if (p > totalPage) {
				$(this).val(totalPage);
				return false;
			} else {
				window.location.href = baseUrl + "?p=" + p;
			}
		}
	});
	$('.delete_btn').on('click', function(e) {
		bootbox.confirm("确定要删除吗?", function(result) {
			if (result) {
				e = e || window.event;
				var target = $(e.target.parentNode);
				var id = target.data('id');
				var tr = $('#i-' + id);

				$.ajax({
						type: 'DELETE',
						url: baseUrl + '?id=' + id,
					})
					.success(function(results) {
						if (results.success === 1) {
							if (tr.length > 0) {
								tr.remove()
							}
							bootbox.alert('删除成功！');
						} else {
							bootbox.alert('删除失败，请重试！');
						}
					})
					.error(function(err) {
						bootbox.alert(err)
					});
			}
		});
	});
});