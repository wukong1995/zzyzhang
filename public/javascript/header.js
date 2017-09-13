$(function() {
  $('.sidebar li').on('click', function() {
    // event.preventDefault();
    /* Act on the event */
    $('.sidebar li.active').each(function(index, el) {
      $(el).removeClass('active');
    });
    $(this).addClass('active');
  });
});