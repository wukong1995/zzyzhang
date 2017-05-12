var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var morgan = require('morgan');
var jwt = require("jsonwebtoken");
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

/* 连接数据库 */
var dbUrl = 'mongodb://wangpp:admin888@123.206.124.111:27017/account';
mongoose.connect(dbUrl, {
	server: {
		auto_reconnect: true
	}
});
var db = mongoose.connection;
db.on('error', function() {
	console.log("数据库连接错误");
	mongoose.connect(dbUrl, {
		server: {
			auto_reconnect: true
		}
	});
});
db.on('open', function() {
	console.log("数据库连接成功");
});
db.on('close', function() {
	mongoose.connect(dbUrl, {
		server: {
			auto_reconnect: true
		}
	});
});
/* 连接数据库终 */

var port = process.env.PORT || 3000;

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
var routes = require('./routes/router')(app);

if ('development' === app.get('env')) {
	app.set('showStackError', true)
	app.use(morgan(':method :url :status'))
	app.locals.pretty = true
	mongoose.set('debug', true)
}

app.listen(port, function() {
	console.log("listen on port " + port);
});


// forever start -l forever.log -o out.log -e err.log -a app.js