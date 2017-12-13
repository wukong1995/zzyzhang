exports.errMsg = function(message = '服务器发生错误', error_code = 0, success = 0) {
  return {
    error_code,
    success,
    message
  };
};
