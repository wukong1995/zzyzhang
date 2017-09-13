jQuery(function($) {

  $('#header_portrait').ace_file_input({
    style: 'well',
    btn_choose: 'Change avatar',
    btn_change: null,
    no_icon: 'ace-icon fa fa-picture-o',
    thumbnail: 'large',
    droppable: true,

    allowExt: ['jpg', 'jpeg', 'png', 'gif'],
    allowMime: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
  });

  $('.date-picker').datepicker({
    weekStart: 1
  });

  $('#form_submit').on('click', function(event) {
    event.preventDefault();
    /* Act on the event */

    $('#Form').submit();
  });
});
