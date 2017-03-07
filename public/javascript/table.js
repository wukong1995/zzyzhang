jQuery(function($) {
	$(document).on('click', 'th input:checkbox', function() {
		var that = this;
		$(this).closest('table').find('tr > td:first-child input:checkbox')
			.each(function() {
				this.checked = that.checked;
				$(this).closest('tr').toggleClass('selected');
			});
	});

});