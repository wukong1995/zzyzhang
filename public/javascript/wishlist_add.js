$(function() {
  $('#form_submit').on('click', function(event) {
    event.preventDefault();
    /* Act on the event */
    if ($('#wishlist_name').val() == '') {
      $('#wishlist_name').tips({
        msg: '请输入心愿名字',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#wishlist_name').focus();
      return false;
    }
    if ($('#wishlist_price').val() == '') {
      $('#wishlist_price').tips({
        msg: '请输入价格',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#wishlist_price').focus();
      return false;
    }
    if (parseInt($('#wishlist_price').val()) == 0) {
      $('#wishlist_price').tips({
        msg: '价格需大于零',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#wishlist_price').focus();
      return false;
    }
    if (!/^\d+(\.\d+)?$/.test($('#wishlist_price').val())) {
      $('#wishlist_price').tips({
        msg: '价格只能为大于零的数',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#share_first_price').focus();
      return false;
    }
    if (parseInt($('#wishlist_price').val()) > 1000000000) {
      $('#wishlist_price').tips({
        msg: '不能超过一亿',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#wishlist_price').focus();
      return false;
    }

    $('#wishlist_form').submit();
  });
});
