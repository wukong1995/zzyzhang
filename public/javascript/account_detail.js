jQuery(function($) {

	//editables on first profile page
	$.fn.editable.defaults.mode = 'inline';
	$.fn.editableform.loading = "<div class='editableform-loading'><i class='ace-icon fa fa-spinner fa-spin fa-2x light-blue'></i></div>";
	$.fn.editableform.buttons = '<button type="submit" class="btn btn-info editable-submit"><i class="ace-icon fa fa-check"></i></button>' +
		'<button type="button" class="btn editable-cancel"><i class="ace-icon fa fa-times"></i></button>';

	///////////////////////////////////////////
	$('#user-profile-1')
		.find('input[type=file]').ace_file_input({
			style: 'well',
			btn_choose: 'Change avatar',
			btn_change: null,
			no_icon: 'ace-icon fa fa-picture-o',
			thumbnail: 'large',
			droppable: true,

			allowExt: ['jpg', 'jpeg', 'png', 'gif'],
			allowMime: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
		})
		.end().find('button[type=reset]').on(ace.click_event, function() {
			$('#user-profile-3 input[type=file]').ace_file_input('reset_input');
		})
		.end().find('.date-picker').datepicker().next().on(ace.click_event, function() {
			$(this).prev().focus();
		})
});