'use strict';

var express = require('express');
var router = express.Router();
// const ajax = require('../../public/js/ajax.js');
var Data = require('./data');
var DFormat = function DFormat(value) {
  // 日期Filter
  var Str = value;
  var ZeorFn = function ZeorFn(a) {
    var b = void 0;
    if (a < 10) {
      b = '0' + a;
    } else {
      b = '' + a;
    }
    return b;
  };
  try {
    var oDate = void 0;
    var onoff = false;
    if (Str) {
      oDate = new Date(Str);
    } else {
      oDate = new Date();
    }
    var year = oDate.getFullYear();
    var month = oDate.getMonth() + 1;
    var date = oDate.getDate();
    var Hours = oDate.getHours();
    var Minutes = oDate.getMinutes();
    var Seconds = oDate.getSeconds();
    return year + '-' + ZeorFn(month) + '-' + ZeorFn(date) + ' ' + (ZeorFn(Hours) + ':' + ZeorFn(Minutes) + ':' + ZeorFn(Seconds));
  } catch (err) {
    // alert('代码出错请联系：yzflhez@126.com')
    return value;
  }
};

var host = {
  host: '149.129.177.101',
  port: 3306,
  database: 'my_web', // 数据库
  user: 'yzf',
  password: 'Yzf-1234'
  // 个人信息 ***************************
  // 登录
};router.get('/my/load.json', function (req, res, next) {
  // 登录
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        message: '数据库连接失败'
      });
    } else {
      // 链接成功
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + ('USE_NAME = "' + query.name + '" and USE_PASSWORD = "' + query.password + '"');
      connecting.query(select, function (err, result) {
        if (!err && result[0]) {
          res.send({
            result: 'succeed',
            data: result
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者密码错误'
          });
        }
      });
    }
  });
});
// 注册
router.get('/my/register.json', function (req, res, next) {
  // 注册
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        message: '数据库连接失败'
      });
    } else {
      // 链接成功
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + ('USE_NAME = "' + query.name + '" and USE_EMAIL = "' + query.Email + '"');
      connecting.query(select, function (err, result) {
        var time = DFormat();
        if (!err && !result[0]) {
          var select2 = 'INSERT INTO my_web.USE (USE_NAME, USE_PASSWORD, USE_EMAIL, USE_MESSAGE, USE_ODER, CREATE_DATE) VALUES ( \'' + query.name + '\', \'' + query.password + '\', \'' + query.Email + '\', \'' + (query.massage ? query.massage : '') + '\', \'1\', \'' + time + '\')';
          connecting.query(select2, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '注册失败'
              });
            }
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者邮箱已经存在'
          });
        }
      });
    }
  });
});

// 我的 *********************************
// 订单处理 ***********************************
router.get('/my/order/getNowOrder.json', function (req, res, next) {
  // 查询现在进行中的订单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        message: '数据库连接失败'
      });
    } else {
      // 链接成功
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name' + ' from ' + 'my_web.order' + ' where ' + ('state != 1 and order_type = 1 and USE_ID = ' + query.id);
      connecting.query(select, function (err, result) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '查询成功'
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败'
          });
        }
      });
    }
  });
});

router.get('/my/order/getFinishOrder.json', function (req, res, next) {
  // 查询完成的订单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        message: '数据库连接失败'
      });
    } else {
      // 链接成功
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name' + ' from ' + 'my_web.order' + ' where ' + ('state = 1 and order_type = 1 and USE_ID = ' + query.id);
      connecting.query(select, function (err, result) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '查询成功'
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败'
          });
        }
      });
    }
  });
});

router.get('/my/order/getPublishOrder.json', function (req, res, next) {
  // 查询我的发单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        message: '数据库连接失败'
      });
    } else {
      // 链接成功
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name' + ' from ' + 'my_web.order' + ' where ' + ('state != 1 and order_type = 2 ' + (query.id ? ' and USE_ID = ' + query.id : ''));
      connecting.query(select, function (err, result) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '查询成功'
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败'
          });
        }
      });
    }
  });
});

router.get('/my/order/getAcceptOrder.json', function (req, res, next) {
  // 查询我的接单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        message: '数据库连接失败'
      });
    } else {
      // 链接成功
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name' + ' from ' + 'my_web.order' + ' where ' + ('state != 1 and order_type = 3 and USE_ID = ' + query.id);
      connecting.query(select, function (err, result) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '查询成功'
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败'
          });
        }
      });
    }
  });
});

// 新增
router.get('/my/order/addOrder.json', function (req, res, next) {
  // 查询我的接单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        message: '数据库连接失败'
      });
    } else {
      // 链接成功
      var time = DFormat();
      var select = 'INSERT INTO my_web.order (USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name CREATE_DATE) VALUES ( \'' + query.name + '\', \'' + query.password + '\', \'' + query.Email + '\', \'' + (query.massage ? query.massage : '') + '\', \'1\', \'' + time + '\')';
      var select2 = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name' + ' from ' + 'my_web.order' + ' where ' + ('state != 1 and order_type = 3 and USE_ID = ' + query.id);
      connecting.query(select, function (err, result) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '查询成功'
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败'
          });
        }
      });
    }
  });
});

module.exports = router;