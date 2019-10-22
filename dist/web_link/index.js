'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
  if (query && e) {
    var onoff = true;
    e.forEach(function (i) {
      if (!query[i]) {
        res.send({
          result: 'error',
          errorCode: 200,
          message: i + '\u4E0D\u80FD\u4E3A\u7A7A'
        });
        onoff = false;
      }
    });
    return onoff;
  }
  return false;
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
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['name', 'password'], query, res)) {
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
              var Item = result[0];
              var address = Item.address;
              if (address && typeof address === 'string') {
                try {
                  Item.address = JSON.parse(address);
                } catch (error) {
                  // 
                }
              }
              res.send({
                result: 'succeed',
                data: [Item]
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});
// 注册
router.get('/my/register.json', function (req, res, next) {
  // 注册
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['name', 'Email', 'password'], query, res)) {
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

router.get('/my/address.json', function (req, res, next) {
  // 地址
  try {
    var mysql = require('mysql');
    var query = req.query;
    var pool = mysql.createPool(host);
    if (checkFn(['ID'], query, res)) {
      var address = query.address ? query.address : '';
      if ((typeof address === 'undefined' ? 'undefined' : _typeof(address)) === 'object') {
        address = JSON.stringify(address);
      }
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
              console.log(3232);
              res.send({
                result: 'error',
                errorCode: err,
                message: 'ok'
              });
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 我的 *********************************
// 订单处理 ***********************************
router.get('/my/order/getNowOrder.json', function (req, res, next) {
  // 查询现在进行中的订单
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['id'], query, res)) {
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

router.get('/my/order/getFinishOrder.json', function (req, res, next) {
  // 查询完成的订单
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['id'], query, res)) {
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

router.get('/my/order/getPublishOrder.json', function (req, res, next) {
  // 查询发单
  try {
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
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

router.get('/my/order/getAcceptOrder.json', function (req, res, next) {
  // 查询我的接单
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['id'], query, res)) {
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 新增
router.get('/my/order/addOrder.json', function (req, res, next) {
  // 新增订单
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['ID', 'NAME', 'ADDRESS', 'GIVE_ID', 'payment', 'type', 'device_id', 'device_name', 'number', 'test_parameter'], query, res)) {
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
          var select2 = 'select ' + '*' + ' from ' + 'my_web.device' + ' where ' + ('id = ' + query.device_id);
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
              var select = 'INSERT INTO my_web.order (' + 'test_parameter, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, state, process, message, payment, type, device_id, device_name, order_type, number, payData' + ') VALUES ( ' + ('\'' + (query.test_parameter ? query.test_parameter : {}) + '\', ') + ('\'' + (query.ID ? query.ID : '') + '\', \'' + (query.NAME ? query.NAME : '') + '\', ') + ('\'' + (query.ADDRESS ? query.ADDRESS : '') + '\', \'' + (Item.USE_ID ? Item.USE_ID : '') + '\', ') + ('\'' + (Item.USE_NAME ? Item.USE_NAME : '') + '\', \'' + (Item.address ? Item.address : '') + '\', ') + ('\'' + time + '\', 0, ') + ('\'' + (query.process ? query.process : '') + '\', \'' + (query.message ? query.message : '') + '\', ') + ('\'' + (query.payment ? query.payment : 0) + '\', \'' + (query.type ? query.type : 0) + '\', ') + ('\'' + (query.device_id ? query.device_id : 0) + '\', \'' + (query.device_name ? query.device_name : '') + '\', ') + ('1, \'' + (query.number ? query.number : 0) + '\',') + ('\'' + (query.payData ? query.payData : {}) + '\', ') + ')';
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

router.get('/my/order/addPublishOrder.json', function (req, res, next) {
  // 新增发单
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['ID', 'NAME', 'ADDRESS', 'payment', 'device_name', 'number'], query, res)) {
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

router.get('/my/order/acceptPublishOrder.json', function (req, res, next) {
  // 接单
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['ID', 'GIVE_ID', 'GIVE_NAME', 'GIVE_ADDRESS', 'device_id', 'device_name'], query, res)) {
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 删除单子
router.get('/my/order/deleteOrder.json', function (req, res, next) {
  // 删除单子
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['ID'], query, res)) {
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
          var select = 'DELETE FROM my_web.order WHERE id = ' + query.ID;
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '删除成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '删除失败'
              });
            }
          });
        }
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 编辑单子
router.get('/my/order/editOrder.json', function (req, res, next) {
  // 编辑单子
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['ID'], query, res)) {
      var pool = mysql.createPool(host);
      checkFn('ID', query, res);
      pool.getConnection(function (err, connecting) {
        if (err) {
          res.send({
            result: 'error',
            errorCode: err,
            message: '数据库连接失败'
          });
        } else {
          // 链接成功
          var str = '';
          if (query.message) {
            str += str ? ', message = \'' + query.message + '\'' : 'message = \'' + query.message + '\'';
          } else if (query.number) {
            str += str ? ', number = ' + query.number : 'number = ' + query.number;
          } else if (query.USE_ADDRESS) {
            str += str ? ', USE_ADDRESS = \'' + query.USE_ADDRESS + '\'' : 'USE_ADDRESS = \'' + query.USE_ADDRESS + '\'';
          } else if (query.payData) {
            str += str ? ', payData = \'' + query.payData + '\'' : 'payData = \'' + query.payData + '\'';
          }
          var select = 'update my_web.order set ' + str + (' where id = ' + query.ID);
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '编辑成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '编辑失败'
              });
            }
          });
        }
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 设备 ***********************************
router.get('/my/getDeviceList.json', function (req, res, next) {
  // 查询设备
  try {
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
        var select = 'select ' + '*' + ' from ' + 'my_web.device';
        if (query.type && query.id) {
          select = 'select ' + '*' + ' from ' + 'my_web.device' + (' where tab_type = \'' + query.type + '\' and id = \'' + query.id + '\'');
        } else if (query.type) {
          select = 'select ' + '*' + ' from ' + 'my_web.device' + (' where tab_type = \'' + query.type + '\'');
        } else if (query.id) {
          select = 'select ' + '*' + ' from ' + 'my_web.device' + (' where id = \'' + query.id + '\'');
        }
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
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

router.get('/my/addDevice.json', function (req, res, next) {
  // 新增设备
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['USE_ID', 'USE_NAME', 'USE_address', 'type', 'dedail_type', 'tab_type', 'name', 'price'], query, res)) {
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
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 删除设备
router.get('/my/order/deleteDevice.json', function (req, res, next) {
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['ID'], query, res)) {
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
          var select = 'DELETE FROM my_web.device WHERE id = ' + query.ID;
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '删除成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '删除失败'
              });
            }
          });
        }
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 编辑设备
router.get('/my/order/editDevice.json', function (req, res, next) {
  try {
    var mysql = require('mysql');
    var query = req.query;
    if (checkFn(['ID'], query, res)) {
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
          var str = '';
          if (query.name) {
            str += str ? ', name = \'' + query.name + '\'' : 'name = \'' + query.name + '\'';
          } else if (query.parameter) {
            str += str ? ', parameter = \'' + query.parameter + '\'' : 'name = \'' + query.parameter + '\'';
          } else if (query.detail) {
            str += str ? ', detail = \'' + query.detail + '\'' : 'detail = \'' + query.detail + '\'';
          } else if (query.abbreviat) {
            str += str ? ', abbreviat = \'' + query.abbreviat + '\'' : 'abbreviat = \'' + query.abbreviat + '\'';
          } else if (query.img) {
            str += str ? ', img = \'' + query.img + '\'' : 'img = \'' + query.img + '\'';
          } else if (query.test_parameter) {
            str += str ? ', test_parameter = \'' + query.test_parameter + '\'' : 'test_parameter = \'' + query.test_parameter + '\'';
          } else if (query.type) {
            str += str ? ', type = \'' + query.type + '\'' : 'type = \'' + query.type + '\'';
          } else if (query.dedail_type) {
            str += str ? ', dedail_type = \'' + query.dedail_type + '\'' : 'dedail_type = \'' + query.dedail_type + '\'';
          } else if (query.tab_type) {
            str += str ? ', tab_type = \'' + query.tab_type + '\'' : 'tab_type = \'' + query.tab_type + '\'';
          } else if (query.address) {
            str += str ? ', address = \'' + query.address + '\'' : 'address = \'' + query.address + '\'';
          } else if (query.price) {
            str += str ? ', price = ' + query.price : 'price = ' + query.price;
          } else if (query.message) {
            str += str ? ', message = \'' + query.message + '\'' : 'message = \'' + query.message + '\'';
          }
          var select = 'update my_web.device set ' + str + (' where id = ' + query.ID);
          connecting.query(select, function (err, result) {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '编辑成功'
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '编辑失败'
              });
            }
          });
        }
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 商品 ***********************************
router.get('/my/getGoodsList.json', function (req, res, next) {
  // 查询商品
  try {
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
        if (query.id) {
          select = 'select ' + '*' + ' from ' + 'my_web.goods' + (' where id = \'' + query.id + '\'');
        }
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
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

// 城市 *******************************
router.get('/city.json', function (req, res, next) {
  // 查询城市
  try {
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
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误'
    });
  }
});

module.exports = router;