const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

/* 连接数据库 */
const dbUrl = 'mongodb://wangpp:admin888@123.206.124.111:27017/account';
mongoose.connect(dbUrl, {
  server: {
    auto_reconnect: true
  }
});
const db = mongoose.connection;
db.on('error', function() {
  console.log('数据库连接错误');
  mongoose.connect(dbUrl, {
    server: {
      auto_reconnect: true
    }
  });
});
db.on('open', function() {
  console.log('数据库连接成功');
});
db.on('close', function() {
  mongoose.connect(dbUrl, {
    server: {
      auto_reconnect: true
    }
  });
});
/* 连接数据库终 */

const port = process.env.PORT || 3000;

app.set('port', port);
app.set('views', path.join(__dirname, 'app/view/pages'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use(session({
  secret: 'Accounting',
  store: new MongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}));

app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');

// 引入路由文件
require('./routes/router')(app);

// production
if ('development' === app.get('env')) {
  app.set('showStackError', true);
  app.use(morgan(':method :url :status'));
  app.locals.pretty = true;
  mongoose.set('debug', true);
}

app.listen(port, function() {
  console.log('listen on port ' + port);
});
