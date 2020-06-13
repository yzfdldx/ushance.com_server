var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require('url');

// 开发环境或者部署 -- 在root -> web-server -> ushance.com_server 里面
var dev = 'routes';
var pre = 'dist';
var this_dev = dev;

// 页面配置文件
var index = require('./' + this_dev + '/index'); // pc首页
var dataCenter = require('./' + this_dev + '/dataCenter'); // 数据中心页面
// 接口配置文件
var web_index = require('./' + this_dev + '/web_link/index'); // pc首页
var web_accept = require('./' + this_dev + '/web_link/accept'); // accept
var web_file = require('./' + this_dev + '/web_link/file'); // file
var web_resume = require('./' + this_dev + '/web_link/resume'); // resume
// 支付宝支付
var zfb_sdk = require('./' + this_dev + '/zfb_sdk/index');
// 微信支付
var weixing_sdk = require('./' + this_dev + '/weixing_sdk/index');
// 网银支付
var wangyin_sdk = require('./' + this_dev + '/wangyin_sdk/index');

/* erha_app */
var erha = require('./' + this_dev + '/erha/index');
/* 题目考试_app */
var exam = require('./' + this_dev + '/exam/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.text({type: '*/xml'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.set(header('Access-Control-Allow-Origin:*'));
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Origin", "*.ushance.com");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
//     else  next();
// });
let getClientIp = function (req) {
  return req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || '';
};
var {
  DFormat,
  checkAddLink, MQ_ok,
} = require('./routes/common.js');
var hostType = 'www';
var hostType = 'www';
app.use((req, res, next)=>{
  try {
    // 日志
    var Arr = [
      {
        key: 'ip',
        default: ip,
        defaultSet: true,
      },
      {
        key: 'host',
        // default: req.host,
        default: req.headers.origin,
        defaultSet: true,
      },
      {
        key: 'url',
        default: u ? JSON.stringify(u) : '',
        defaultSet: true,
      },
      {
        key: 'time',
        default: DFormat(),
        defaultSet: true,
      }
    ];
    var str = checkAddLink(Arr, {});
    var select = `INSERT INTO my_web.web_host ` + str;
    MQ_ok(select, null, (result) => {
      //
    })
    // page
    var host = req.host.split('.')[0];
    hostType = host ? host : 'www';
    if (hostType === 'www') {
      index(req, res, next)
    } else if (hostType === 'data_center') {
      dataCenter(req, res, next)
    } else {
      next();
    }
  } catch (error) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// app.use('/', index);
// app.use('/users', users);

// 线上要部署的页面请求
app.use('/web/index', web_index);
app.use('/web/accept', web_accept);
app.use('/web/file', web_file);
app.use('/web/resume', web_resume);

// 支付宝支付
app.use('/zfb_sdk', zfb_sdk);
// 微信支付
app.use('/weixing_sdk', weixing_sdk);
// 网银支付
app.use('/wangyin_sdk', wangyin_sdk);

/* erha */
app.use('/erha', erha);
/* exam */
app.use('/exam', exam);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
