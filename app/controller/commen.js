// 单独判断
function checkOne(rule) {
// array(验证值,正则表达,错误提示)
  if (!rule || Object.prototype.toString.call(rule) != '[object Array]' || rule.length < 3) {
    return {
      flag: false,
      msg: '验证规则出错'
    };
  }
  var val = rule[0].replace(/^\s+|\s+$/g, '');
  var regExp = eval(rule[1]);
  if (!regExp.test(val)) {
    val = null;
    regExp = null;

    return {
      flag: false,
      msg: rule[2]
    };
  }

  val = null;
  regExp = null;
  return {
    flag: true,
    msg: '验证成功'
  };
}

// 只能用正则表达式进行判断
exports.checkField = function(rules) {
  var succ = true; // 标志
  var res = null; // 最终返回结果
  rules.forEach(function(value) {
    if (succ === true) {
      res = checkOne(value);
      if (res.flag == false) {
        succ = false;
      }
    }
  });
  return res;
};

exports.errMsg = function(message = '服务器发生错误', error_code = 0, success = 0) {
  return {
    error_code,
    success,
    message
  };
};
