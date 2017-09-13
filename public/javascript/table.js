jQuery(function($) {
  bootbox.setDefaults('locale', 'zh_CN');

  $(document).on('click', 'th input:checkbox', function() {
    var that = this;
    $(this).closest('table').find('tr > td:first-child input:checkbox')
      .each(function() {
        this.checked = that.checked;
        $(this).closest('tr').toggleClass('selected');
      });
  });
  var baseUrl = window.location.href;

  $('#sample').on('click', '.delete_btn', function(e) {
    bootbox.confirm('确定要删除吗?', function(result) {
      if (result) {
        e = e || window.event;
        var target = $(e.target).closest('a');
        var id = target.data('id');
        var tr = $(e.target).closest('tr');

        $.ajax({
          type: 'DELETE',
          url: baseUrl + '/del?id=' + id
        })
          .success(function(results) {
            if (results.success === 1) {
              if (tr.length > 0) {
                tr.remove();
              }
              bootbox.alert('删除成功！');
            } else {
              bootbox.alert('删除失败，请重试！');
            }
          })
          .error(function(err) {
            bootbox.alert(err);
          });
      }
    });
  });
});
