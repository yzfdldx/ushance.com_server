'use strict';

var express = require('express');
var router = express.Router();
var City = require('./city.js');
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

var checkFn = function checkFn(e, query, res) {
  if (!query || !query[e]) {
    res.send({
      result: 'error',
      errorCode: 403,
      message: e + '\u4E0D\u80FD\u4E3A\u7A7A'
    });
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

router.get('/my/address.json', function (req, res, next) {
  // 地址
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  checkFn('ID', query, res);
  var address = query.address ? query.address : null;
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
      var select2 = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + ('USE_ID = ' + query.ID);
      connecting.query(select2, function (err, result) {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '修改失败, 没查询到有该用户'
            });
          }
          var select = 'update my_web.USE set ' + ('address = \'' + query.address + '\'') + (' where USE_ID = ' + query.ID);
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '地址修改成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '地址修改失败'
              });
            }
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
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number' + ' from ' + 'my_web.order' + ' where ' + ('state != 1 and order_type = 1 and USE_ID = ' + query.id);
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
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number' + ' from ' + 'my_web.order' + ' where ' + ('state = 1 and order_type = 1 and USE_ID = ' + query.id);
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
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number' + ' from ' + 'my_web.order' + ' where ' + ('state != 1 and order_type = 2 ' + (query.id ? ' and USE_ID = ' + query.id : ''));
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
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number' + ' from ' + 'my_web.order' + ' where ' + ('state != 1 and order_type = 1 and USE_ID = ' + query.id);
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
  // 新增订单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  checkFn('ID', query, res);
  checkFn('ADDRESS', query, res);
  checkFn('GIVE_ID', query, res);
  checkFn('payment', query, res);
  checkFn('type', query, res);
  checkFn('device_id', query, res);
  checkFn('device_name', query, res);
  checkFn('number', query, res);
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
      var select2 = 'select ' + 'USE_ID, USE_NAME, address' + ' from ' + 'my_web.USE' + ' where ' + ('USE_ID = ' + query.GIVE_ID);
      connecting.query(select2, function (err, result) {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '新增失败'
            });
          }
          var Item = result[0];
          var select = 'INSERT INTO my_web.order (' + 'USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, state, process, message, payment, type, device_id, device_name, order_type, number' + ') VALUES ( ' + ('\'' + (query.ID ? query.ID : '') + '\', \'' + (Item.USE_NAME ? Item.USE_NAME : '') + '\', ') + ('\'' + (Item.address ? Item.address[0] : '') + '\', \'' + (query.GIVE_ID ? query.GIVE_ID : '') + '\', ') + ('\'' + (query.GIVE_NAME ? query.GIVE_NAME : '') + '\', \'' + (query.GIVE_ADDRESS ? query.GIVE_ADDRESS : '') + '\', ') + ('\'' + time + '\', 0, ') + ('\'' + (query.process ? query.process : '') + '\', \'' + (query.message ? query.message : '') + '\', ') + ('\'' + (query.payment ? query.payment : 0) + '\', \'' + (query.type ? query.type : 0) + '\', ') + ('\'' + (query.device_id ? query.device_id : 0) + '\', \'' + (query.device_name ? query.device_name : '') + '\', ') + ('1, \'' + (query.number ? query.number : 0) + '\')');
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '新增订单成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '新增订单失败'
              });
            }
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

router.get('/my/order/addPublishOrder.json', function (req, res, next) {
  // 新增发单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  checkFn('ID', query, res);
  checkFn('NAME', query, res);
  checkFn('ADDRESS', query, query, res);
  checkFn('payment', query, res);
  checkFn('device_name', query, res);
  checkFn('number', query, res);
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
      var select2 = 'select ' + 'USE_ID, USE_NAME, address' + ' from ' + 'my_web.USE' + ' where ' + ('USE_ID = ' + query.GIVE_ID);
      connecting.query(select2, function (err, result) {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '新增失败'
            });
          }
          var Item = result[0];
          var select = 'INSERT INTO my_web.order (' + 'USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, process, message, payment, state, type, device_id, device_name, order_type, number' + ') VALUES ( ' + ('\'' + (query.ID ? query.ID : '') + '\', \'' + (Item.USE_NAME ? Item.USE_NAME : '') + '\', ') + ('\'' + (Item.address ? Item.address[0] : '') + '\', \'\', ') + '\'\', \'\', ' + ('\'' + time + '\', ') + ('\'\', \'' + (query.message ? query.message : '') + '\', ') + ('\'' + (query.payment ? query.payment : 0) + '\', 0, ') + '0, 0, ' + ('\'' + (query.device_name ? query.device_name : 0) + '\', 2,') + (' ' + (query.number ? query.number : 0) + ')');
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '新增发单成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '新增发单失败'
              });
            }
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

router.get('/my/order/acceptPublishOrder.json', function (req, res, next) {
  // 接单
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  checkFn('ID', query, res);
  checkFn('GIVE_ID', query, res);
  checkFn('GIVE_NAME', query, res);
  checkFn('GIVE_ADDRESS', query, res);
  checkFn('device_id', query, res);
  checkFn('device_name', query, res);
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
      var select2 = 'select ' + '*' + ' from ' + 'my_web.order' + ' where ' + ('id = ' + query.ID);
      connecting.query(select2, function (err, result) {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '接单失败, 没查询到有该发单'
            });
          }
          var Item = result[0];
          if (Item.device_name !== query.device_name) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '接单失败，该设备不能接此单，请先确认设备名称'
            });
          }
          var select = 'update my_web.order set ' + ('GIVE_ID = \'' + query.GIVE_ID + '\', GIVE_NAME = \'' + query.GIVE_NAME + '\', ') + ('GIVE_ADDRESS = \'' + query.GIVE_ADDRESS + '\', device_id = \'' + query.device_id + '\', ') + 'order_type = 1' + (' where id = ' + query.ID);
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '接单成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '接单失败'
              });
            }
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

// 设备 ***********************************
router.get('/my/getDeviceList.json', function (req, res, next) {
  // 查询设备
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
      var select = 'select ' + '*' + ' from ' + 'my_web.device' + ('' + (query.type ? ' where tab_type = \'' + query.type + '\'' : ''));
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

router.get('/my/addDevice.json', function (req, res, next) {
  // 新增设备
  var mysql = require('mysql');
  var query = req.query;
  var pool = mysql.createPool(host);
  checkFn('USE_ID', query, res);
  checkFn('USE_NAME', query, res);
  checkFn('USE_address', query, res);
  checkFn('type', query, res);
  checkFn('dedail_type', query, res);
  checkFn('tab_type', query, res);
  checkFn('name', query, res);
  checkFn('price', query, res);
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
      var select = 'INSERT INTO my_web.device (' + 'USE_ID, USE_NAME, address, name, parameter, detail, message, abbreviat, img, test_parameter, type, dedail_type, tab_type, price' + ') VALUES ( ' + ('\'' + query.USE_ID + '\', \'' + query.USE_NAME + '\', ') + ('\'' + query.USE_address + '\', \'' + query.name + '\', ') + ('\'' + (query.parameter ? query.parameter : '') + '\', \'' + (query.detail ? query.detail : '') + '\', ') + ('\'' + (query.message ? query.message : '') + '\', \'' + (query.abbreviat ? query.abbreviat : '') + '\', ') + ('\'' + (query.img ? query.img : '') + '\', \'' + (query.test_parameter ? query.test_parameter : '{}') + '\', ') + ('\'' + query.type + '\', \'' + query.dedail_type + '\', ') + ('\'' + query.tab_type + '\', ' + query.price) + ')';
      connecting.query(select, function (err, result) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '新增设备成功'
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '新增设备失败'
          });
        }
      });
    }
  });
});

// 商品 ***********************************
router.get('/my/getGoodsList.json', function (req, res, next) {
  // 查询商品
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
      var select = 'select ' + '*' + ' from ' + 'my_web.goods';
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

// 城市 *******************************
router.get('/city.json', function (req, res, next) {
  // 查询城市
  if (City && City.City) {
    res.send({
      result: 'succeed',
      data: City.City,
      errorCode: 200,
      message: '查询成功'
    });
  } else {
    res.send({
      data: [],
      result: 'error',
      errorCode: err,
      message: '查询失败'
    });
  }
});

module.exports = router;