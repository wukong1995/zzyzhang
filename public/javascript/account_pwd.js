/* global bootbox, window, alert */
jQuery(function($) {
  bootbox.setDefaults('locale', 'zh_CN');

  function checkForm() {
    if ($('#pwd').val() == '') {
      $('#pwd').tips({
        msg: '请输入原密码',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#pwd').focus();
      return false;
    }

    if (!/^[a-zA-Z0-9]{6,16}$/.test($('#pwd').val())) {
      $('#pwd').tips({
        msg: '密码由6-16位的字母、数字组成',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#pwd').focus();
      return false;
    }
    if ($('#newpwd').val() == '') {
      $('#newpwd').tips({
        msg: '请输入新密码',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#newpwd').focus();
      return false;
    }

    if (!/^[a-zA-Z0-9]{6,16}$/.test($('#newpwd').val())) {
      $('#newpwd').tips({
        msg: '密码由6-16位的字母、数字组成',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#newpwd').focus();
      return false;
    }
    if ($('#confirmpwd').val() == '') {
      $('#confirmpwd').tips({
        msg: '请再次输入密码',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#confirmpwd').focus();
      return false;
    }
    if ($('#confirmpwd').val() != $('#newpwd').val()) {
      $('#confirmpwd').tips({
        msg: '两次输入密码一致',
        side: 3,
        bg: '#AE81FF',
        time: 1,
      });
      $('#confirmpwd').focus();
      return false;
    }
    return true;
  }


  $('#form_submit').on('click', function() {
    if(checkForm()) {
      $.ajax({
        url: '/user/changepwd',
        type: 'post',
        dataType: 'json',
        data: {
          user:{
            pwd:$('#pwd').val(),
            newpwd:$('#newpwd').val()
          }
        },
        success: function (res) {
          if(res.success == 0) {
            bootbox.alert(res.message);
          } else {
            bootbox.alert('修改密码成功，请重新登录！');
            window.location.href = '/';
          }
        },
        error: function () {
          alert('请求错误！');
        }
      });
    }
  });
});
