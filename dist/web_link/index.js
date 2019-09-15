'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
// 个人信息 ***************************
// 登录
router.get('/my/load.json', function (req, res, next) {
  // 登录
  var mysql = require('mysql');
  var query = req.query;
  var host = {
    host: '149.129.177.101',
    port: 3306,
    database: 'my_web', // 数据库
    user: 'yzf',
    password: 'Yzf-1234'
  };
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
  var host = {
    host: '149.129.177.101',
    port: 3306,
    database: 'my_web', // 数据库
    user: 'yzf',
    password: 'Yzf-1234'
  };
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

// 测试 *********************************
router.get('/test_net.json', function (req, res, next) {
  // 测试连接
  var mysql = require('mysql');
  var query = req.query;
  var host = {
    host: 'localhost',
    port: 3306,
    database: 'yzf168', // 数据库
    user: 'root',
    password: ''
  };
  var pool = mysql.createPool(query.host ? {
    host: query.host.host ? query.host.host : 'localhost',
    port: 3306,
    database: query.host.database ? query.host.database : 'yzf168', // 数据库
    user: query.host.user ? query.host.user : 'root',
    password: query.host.password ? query.host.password : ''
  } : host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        host: query.host
      });
    } else {
      // 链接成功
      res.send({
        result: 'succeed',
        data: '链接成功'
      });
    }
  });
});

router.get('/test_data.json', function (req, res, next) {
  // 测试数据库
  var mysql = require('mysql');
  var host = {
    host: 'localhost',
    port: 3306,
    database: 'yzf168', // 数据库
    user: 'root',
    password: ''
  };
  var query = req.query;
  var pool = mysql.createPool(query.host ? {
    host: query.host.host ? query.host.host : 'localhost',
    port: 3306,
    database: query.host.database ? query.host.database : 'yzf168', // 数据库
    user: query.host.user ? query.host.user : 'root',
    password: query.host.password ? query.host.password : ''
  } : host);
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err,
        query: query
      });
    } else {
      // 链接成功
      var select = query.data;
      connecting.query(select, function (err, result) {
        if (!err && result[0]) {
          res.send({
            result: 'succeed',
            err: JSON.stringify(err),
            data: result,
            query: query
          });
        } else {
          res.send({
            result: 'error',
            query: query,
            errorCode: err
          });
        }
      });
    }
  });
});

/* GET home page. */
// 用户信息 ****************************
router.get('/load.json', function (req, res, next) {
  // 登录
  var mysql = require('mysql');
  var pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    database: 'yzf168', // 数据库
    user: 'root',
    password: ''
  });
  pool.getConnection(function (err, connecting) {
    if (err) {
      res.send({
        result: 'error',
        errorCode: err
      });
    } else {
      // 链接成功
      var query = req.query;
      var select = 'select ' + '*' + ' from ' + 'users' + ' where ' + ('name = "' + query.name + '" and password = "' + query.password + '"');
      connecting.query(select, function (err, result) {
        if (!err && result[0]) {
          res.send({
            result: 'succeed',
            err: JSON.stringify(err),
            data: result[0]
          });
        } else {
          res.send({
            result: 'error',
            errorCode: '用户名或者密码错误'
          });
        }
      });
    }
  });
});

router.get('/register.json', function (req, res, next) {
  // 注册
  var query = req.query;
  var Json = {};
  Json['headSculpture'] = query.headSculpture ? query.headSculpture : 'https://gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png';
  if (query.name) {
    Json['name'] = query.name;
  }
  if (query.password) {
    Json['password'] = query.password;
  }
  var L = Data.seachIdLoadList().length + 1;
  Json['id'] = L;
  var L2 = Data.addLoadList(Json);
  if (L2 != -1) {
    res.send({
      result: 'succeed',
      data: Json
    });
  } else {
    res.send({
      result: 'error',
      errorCode: 'no find',
      L2: L2
    });
  }
});

// 文章列表 ****************************
router.get('/articleList.json', function (req, res, next) {
  // 查询文章列表
  var query = req.query;
  var data = Data.seachIdArticleList(query.id ? query.id : null);
  var Page = query.page ? parseInt(query.page) : 1;
  if (data) {
    res.send({
      result: 'succeed',
      data: {
        list: data.slice((Page - 1) * 10, Page * 10),
        page: {
          page: Page,
          dataLength: data.length,
          pageSize: query.pageSize ? query.pageSize : 10
        }
      }
    });
  } else {
    res.send({
      result: 'error',
      errorCode: 'no find'
    });
  }
});

// 文章数据详情 ****************************
router.get('/articleJson.json', function (req, res, next) {
  // 查询文章数据详情
  var query = req.query;
  var data = Data.seachIdArticleJson(query.id ? query.id : null);
  if (data) {
    res.send({
      result: 'succeed',
      data: _extends({}, data)
    });
  } else {
    res.send({
      result: 'error',
      errorCode: 'no find'
    });
  }
});

router.get('/editArticleJson.json', function (req, res, next) {
  // 编辑文章数据详情
  var query = req.query;
  var data = {};
  if (query.operate == 'editMessage') {
    data = Data.editArticleJson(query);
  } else if (query.operate == 'add' && query.ownerId) {
    id = query.ownerId + '_' + new Date().getTime();
    var user = Data.seachIdLoadList(query.ownerId);
    var a = Data.addArticleJson({
      id: id,
      ownerId: query.ownerId,
      title: query.data.name,
      name: user.name,
      text: query.data.text,
      share: [{
        url: '#',
        img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
        title: '新浪微博'
      }, {
        url: '#',
        img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
        title: '新浪微博'
      }, {
        url: '#',
        img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
        title: '新浪微博'
      }, {
        url: '#',
        img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
        title: '新浪微博'
      }],
      img: query.data.img ? query.data.img : 'https:\/\/gw.alipayobjects.com/zos/rmsportal/xcTMkCtXIZajsCaOcaaj.jpg',
      time: new Date()
    });
    var b = Data.addArticleList({
      id: id,
      ownerId: query.ownerId,
      title: query.data.name,
      name: user.name,
      text: query.data.cardText,
      src: query.data.cardImg ? query.data.cardImg : 'https:\/\/gw.alipayobjects.com/zos/rmsportal/GQdZUCycJoTkZuAeMMbI.jpg',
      time: new Date()
    });
    if (a != -1) {
      res.send({
        result: 'succeed'
      });
    } else {
      res.send({
        result: 'error'
      });
    }
  }
  // const data2 = Data.seachIdArticleJson(query.id ? query.id : null);
  if (data && data != -1) {
    res.send({
      result: 'succeed',
      data: _extends({}, data)
    });
  } else {
    res.send({
      result: 'error',
      errorCode: 'no find'
    });
  }
});

module.exports = router;