var express = require('express');
var router = express.Router();
const City = require('./city.js');
const Mysql = require('mysql');
const DFormat = (value) => { // 日期Filter
  const Str = value;
  const ZeorFn = (a) => {
    let b;
    if (a < 10) {
      b = `0${a}`;
    } else {
      b = `${a}`;
    }
    return b;
  };
  try{
    let oDate;
    let onoff = false;
    if (Str) {
      oDate = new Date(Str);
    } else {
      oDate = new Date();
    }
    const year = oDate.getFullYear();
    const month = oDate.getMonth() + 1;
    const date = oDate.getDate();
    const Hours = oDate.getHours();
    const Minutes = oDate.getMinutes();
    const Seconds = oDate.getSeconds();
    return `${year}-${ZeorFn(month)}-${ZeorFn(date)} ` +
    `${ZeorFn(Hours)}:${ZeorFn(Minutes)}:${ZeorFn(Seconds)}`;
  } catch (err) {
    // alert('代码出错请联系：yzflhez@126.com')
    return value
  }
};

const checkFn = (e, query, res) => {
  if (query && e) {
    let onoff = true;
    e.forEach(i => {
      if (!query[i] && onoff) {
        res.send({
          result: 'error',
          errorCode: 200,
          message: `${i}不能为空`,
        });
        onoff = false;
      }
    });
    return onoff
  }
  return false
}
// var host = {
//   host: '149.129.177.101',
//   port: 3306,
//   database: 'my_web', // 数据库
//   user: 'yzf',
//   password: 'Yzf-1234',
// }
var host = {
  host: '39.100.225.94', // 149.129.177.101
  port: 3306,
  database: 'my_web', // 数据库
  user: 'yzflhez',
  password: 'Yzf-1234',
}
// 个人信息 ***************************
function rand(min,max) {
  return Math.floor(Math.random()*(max-min))+min;
}
// 安全码
let adminCode = {};
router.post('/my/adminCode.json', async (req, res, next) => {
  try {
    const query = req.body;
    // const query = req.query;
    if (checkFn(['id'], query, res)) {
      const Code = rand(111111, 999999);
      const now_code = `${query.id}_${Code}`;
      adminCode[query.id] = now_code;
      setTimeout(() => {
        delete adminCode[query.id];
      }, 100000)
      res.send({
        data: now_code,
        result: 'succeed',
        errorCode: 200,
        message: '',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

router.post('/my/check_adminCode.json', async (req, res, next) => {
  try {
    const query = req.body;
    // const query = req.query;
    if (checkFn(['id', 'check'], query, res)) {
      if (`${query.check}` === `${adminCode[query.id]}`) {
        delete adminCode[query.id];
        var connection = Mysql.createConnection(host);
        connection.connect();
        var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = "${query.id}"`
        connection.query(select, function(err, result, fields) {
          if (!err && result[0]) {
            const Item = result[0];
            const address = Item.address;
            if (address && typeof(address) === 'string') {
              try {
                Item.address =JSON.parse(address);
              } catch (error) {
                // 
              }
            }
            delete Item.USE_PASSWORD;
            if (Item.money_cart) {
              Item.money_cart = JSON.parse(Item.money_cart);
            }
            res.send({
              result: 'succeed',
              data: [Item],
            });
          } else {
            res.send({
              result: 'error',
              errorCode: err,
              message: '验证未通过',
            });
          }
        });
        connection.end();
      } else {
        res.send({
          result: 'error',
          errorCode: 200,
          message: '验证未通过',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

// 短信验证
let messageCode = {};
router.post('/my/message.json', async (req, res, next) => {
  try {
    const query = req.body;
    // const query = req.query;
    var RPCClient = require('@alicloud/pop-core').RPCClient;
    if (checkFn(['phone', 'id'], query, res)) {
      const accessKeyId = 'LTAI4FnGoeswkBXBjhYHqH1y'
      const secretAccessKey = 'Skqqu37k3XNOSkTvLfpzjxsRtjze6J'
      var client = new RPCClient({
        accessKeyId: accessKeyId,
        accessKeySecret: secretAccessKey,
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
      });
      const Code = rand(111111, 999999);
      var params = {
        "RegionId": "cn-hangzhou",
        "PhoneNumbers": `${query.phone}`,
        "SignName": "ushance",
        "TemplateCode": "SMS_175465012",
        "TemplateParam": `{code: ${Code}}`,
        "OutId": "流水号"
      }
      client.request('SendSms', params).then((result) => {
        if (result && result.Code === 'OK') {
          messageCode[query.id] = Code;
          setTimeout(() => {
            delete messageCode[query.id];
          }, 500000)
        }
        res.send({
          data: result,
          result: result && result.Code === 'OK' ? 'succeed' : 'error',
          errorCode: 200,
          message: result.Message,
        });
      }, (ex) => {
        res.send({
          result: 'error',
          errorCode: 'err',
          message: ex,
        });
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});
// 登录
router.post('/my/load.json', function(req, res, next) { // 登录 - ok
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['name', 'password'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_NAME = "${query.name}" and USE_PASSWORD = "${query.password}"`
      connection.query(select, function(err, result, fields) {
        if (!err && result[0]) {
          const Item = result[0];
          const address = Item.address;
          if (address && typeof(address) === 'string') {
            try {
              Item.address =JSON.parse(address);
            } catch (error) {
              // 
            }
          }
          delete Item.USE_PASSWORD;
          if (Item.money_cart) {
            Item.money_cart = JSON.parse(Item.money_cart);
          }
          res.send({
            result: 'succeed',
            data: [Item],
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者密码错误',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/my/phoneLoad.json', function(req, res, next) { // 登录 - ok
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['phone', 'check'], query, res)) {
      if (`${query.check}` === `${messageCode[query.phone]}`) {
        delete messageCode[query.phone];
        var connection = Mysql.createConnection(host);
        connection.connect();
        var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `phone = "${query.phone}"`
        connection.query(select, function(err, result, fields) {
          if (!err && result[0]) {
            const Item = result[0];
            const address = Item.address;
            if (address && typeof(address) === 'string') {
              try {
                Item.address =JSON.parse(address);
              } catch (error) {
                // 
              }
            }
            delete Item.USE_PASSWORD;
            if (Item.money_cart) {
              Item.money_cart = JSON.parse(Item.money_cart);
            }
            res.send({
              result: 'succeed',
              data: [Item],
            });
          } else {
            res.send({
              result: 'error',
              errorCode: 200,
              message: '该电话用户不存在',
            });
          }
        });
        connection.end();
      } else {
        res.send({
          result: 'error',
          errorCode: 200,
          message: '验证码没通过，请重试',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 403,
      message: '未知错误',
    });
  }
});
router.post('/my/weixin_load.json', function(req, res, next) { // 登录 - ok
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['name', 'password'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_NAME = "${query.name}" and USE_PASSWORD = "${query.password}"`
      connection.query(select, function(err, result, fields) {
        if (!err && result[0]) {
          const Item = result[0];
          const address = Item.address;
          if (address && typeof(address) === 'string') {
            try {
              Item.address =JSON.parse(address);
            } catch (error) {
              // 
            }
          }
          delete Item.USE_PASSWORD;
          if (Item.money_cart) {
            Item.money_cart = JSON.parse(Item.money_cart);
          }
          res.send({
            result: 'succeed',
            data: [Item],
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者密码错误',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/my/detail.json', function(req, res, next) { // 查看详情 - ok
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = "${query.id}"`
      connection.query(select, function(err, result, fields) {
        if (!err && result[0]) {
          const Item = result[0];
          const address = Item.address;
          if (address && typeof(address) === 'string') {
            try {
              Item.address = JSON.parse(address);
            } catch (error) {
              // 
            }
          }
          if (Item.money_cart) {
            Item.money_cart = JSON.parse(Item.money_cart);
          }
          delete Item.USE_PASSWORD;
          res.send({
            result: 'succeed',
            data: Item,
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '不存在该用户',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
// 注册
router.post('/my/register.json', function(req, res, next) { // 注册 - test
  try {
    const mysql = require('mysql');
    // const query = req.query;
    const query = req.body;
    if (checkFn(['name', 'Email', 'password', 'phone', 'check'], query, res)) {
      const head = query.head ? query.head : 'https://oss.aliyuncs.com/aliyun_id_photo_bucket/default_handsome.jpg'
      if (`${query.check}` === `${messageCode[query.phone]}`) {
        var connection = Mysql.createConnection(host);
        connection.connect();
        var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_NAME = "${query.name}" or USE_EMAIL = "${query.Email}" or phone = "${query.phone}"`
        connection.query(select,(err, result) => {
          const time = DFormat();
          if (!err && !result[0]) {
            var select2 = `INSERT INTO my_web.USE (USE_NAME, USE_PASSWORD, USE_EMAIL, USE_ODER, CREATE_DATE, phone, head) VALUES ( '${query.name}', '${query.password}', '${query.Email}', '1', '${time}', '${query.phone}', '${head}')`
            var connection2 = Mysql.createConnection(host);
            connection2.connect();
            connection2.query(select2,(err, result) => {
              if (!err) {
                res.send({
                  result: 'succeed',
                  data: result,
                });
              } else {
                res.send({
                  result: 'error',
                  errorCode: err,
                  message: '注册失败',
                });
              }
            });
            connection2.end();
          } else {
            res.send({
              result: 'error',
              errorCode: 200,
              message: '用户名、邮箱或者电话已经存在',
            });
          }
        });
        connection.end();
      } else {
        res.send({
          result: 'error',
          errorCode: 200,
          message: '验证码没通过，请重试',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 403,
      message: '未知错误',
    });
  }
});

router.post('/my/editAddress.json', function(req, res, next) { // 新增地址 - test
  try {
    // const mysql = require('mysql');
    // const query = req.query;
    const query = req.body;
    // var pool = mysql.createPool(host);
    if (checkFn(['id', 'address'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      const time = DFormat();
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = ${query.id}`
      connection.query(select, function(err, result, fields) {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '修改失败, 没查询到有该用户',
            });
          } else {
            const address = result[0] && result[0].address ? JSON.parse(result[0].address) : [];
            const Arr = [];
            const Address = JSON.parse(query.address);
            if (query.key || query.key === 0) { // 编辑
              address.forEach((e, k) => {
                if (`${k}` === `${query.key}`) {
                  if (Address.default) {
                    Arr.unshift({
                      ...Address,
                    })
                  } else {
                    Arr.push({
                      ...Address,
                    })
                  }
                } else if (Address.default) {
                  Arr.push({
                    ...e,
                    default: undefined,
                  })
                } else {
                  Arr.push({
                    ...e,
                  })
                }
              });
            } else { // 新建一个地址
              address.forEach(e => {
                if (Address.default) {
                  Arr.push({
                    ...e,
                    default: undefined,
                  })
                } else {
                  Arr.push({
                    ...e,
                  })
                }
              });
              if (Address.default) {
                Arr.unshift(Address);
              } else {
                Arr.push(Address);
              }
            }
            var connection2 = Mysql.createConnection(host);
            connection2.connect();
            var select = `update my_web.USE set ` +
            `address = '${JSON.stringify(Arr)}'` +
            ` where USE_ID = ${query.id}`;
            connection2.query(select,(err, result) => {
              if (!err) {
                res.send({
                  result: 'succeed',
                  data: result,
                  errorCode: 200,
                  message: '地址修改成功',
                });
              } else {
                res.send({
                  result: 'error',
                  errorCode: err,
                  message: '地址修改失败',
                });
              }
            });
            connection2.end();
          }
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/getAddress.json', function(req, res, next) { // 地址 - test
  try {
    const mysql = require('mysql');
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + 'address' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = ${query.id}`
      connection.query(select, function(err, result, fields) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result[0] && result[0].address ? JSON.parse(result[0].address) : null,
            errorCode: 200,
            message: '查询成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/my/deleteAddress.json', function(req, res, next) { // 删除地址 - test
  try {
    const mysql = require('mysql');
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'key'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      const time = DFormat();
      var select2 = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = ${query.id}`
      connection.query(select2, function(err, result, fields) {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '删除失败, 没查询到有该用户',
            });
          } else {
            const address = result[0] && result[0].address ? JSON.parse(result[0].address) : [];
            address.splice(query.key, 1);
            var select = `update my_web.USE set ` +
            `address = '${JSON.stringify(address)}'` +
            ` where USE_ID = ${query.id}`;
            var connection2 = Mysql.createConnection(host);
            connection2.connect();
            connection2.query(select,(err, result) => {
              if (!err) {
                res.send({
                  result: 'succeed',
                  data: result,
                  errorCode: 200,
                  message: '地址删除成功',
                });
              } else {
                res.send({
                  result: 'error',
                  errorCode: err,
                  message: '地址删除失败',
                });
              }
            });
            connection2.end();
          }
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 用户交流
router.post('/my/editMessage.json', function(req, res, next) { // 发送消息 - test
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'message'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = ${query.id}`;
      const time = DFormat();
      connection.query(select, function(err, result, fields) {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '修改失败, 没查询到有该用户',
            });
          } else {
            const address = result[0] && result[0].message ? JSON.parse(result[0].message) : [];
            const Address = query.message;
            address.push({
              type: query.type ? query.type : 'Q',
              time: time,
              title: Address,
            })
            var select2 = `update my_web.USE set ` +
            `message = '${JSON.stringify(address)}'` +
            ` where USE_ID = ${query.id}`;
            var connection2 = Mysql.createConnection(host);
            connection2.connect();
            connecting2.query(select2,(err, result) => {
              if (!err) {
                res.send({
                  result: 'succeed',
                  data: result,
                  errorCode: 200,
                  message: '发送成功',
                });
              } else {
                res.send({
                  result: 'error',
                  errorCode: err,
                  message: '发送失败',
                });
              }
            });
            connection2.end();
          }
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/getMessage.json', function(req, res, next) { // 获取消息列表 - test
  try {
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + 'message' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = ${query.id}`
      connection.query(select, function(err, result, fields) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result[0] && result[0].message ? JSON.parse(result[0].message) : null,
            errorCode: 200,
            message: '查询成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/my/getUserLIst.json', function(req, res, next) { // 获取用户列表 - test
  try {
    // const query = req.query;
    var connection = Mysql.createConnection(host);
    connection.connect();
    var select = 'select ' + 'USE_ID, USE_NAME' + ' from ' + 'my_web.USE'
    connection.query(select, function(err, result, fields) {
      if (!err) {
        res.send({
          result: 'succeed',
          data: result.filter(e => e.USE_ID !== 1),
          errorCode: 200,
          message: '查询成功',
        });
      } else {
        res.send({
          result: 'error',
          errorCode: err,
          message: '查询失败',
        });
      }
    });
    connection.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/my/deleteMessage.json', function(req, res, next) { // 删除消息 - test
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = `update my_web.USE set ` +
          `message = '[]'` +
          ` where USE_ID = ${query.id}`;
      connection.query(select, function(err, result, fields) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '删除成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '删除失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/my/messageCall.json', async (req, res, next) => { // 用户交流短信通知
  try {
    const query = req.body;
    // const query = req.query;
    if (checkFn(['name'], query, res)) {
      var RPCClient = require('@alicloud/pop-core').RPCClient;
      const accessKeyId = 'LTAI4FnGoeswkBXBjhYHqH1y'
      const secretAccessKey = 'Skqqu37k3XNOSkTvLfpzjxsRtjze6J'
      var client = new RPCClient({
        accessKeyId: accessKeyId,
        accessKeySecret: secretAccessKey,
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
      });
      const time = DFormat();
      var params = {
        "RegionId": "cn-hangzhou",
        "PhoneNumbers": `18842897729,15711220686,17621181669`,
        "SignName": "ushance",
        "TemplateCode": "SMS_179160279",
        "TemplateParam": JSON.stringify({
          name: query.name,
          time,
          code: 000000,
        }),
        "OutId": "流水号"
      }
      client.request('SendSms', params).then((result) => {
        res.send({
          data: result,
          result: result && result.Code === 'OK' ? 'succeed' : 'error',
          errorCode: 200,
          message: result.Message,
        });
      }, (ex) => {
        res.send({
          result: 'error',
          errorCode: 'err',
          message: ex,
        });
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

// 编辑用户
router.post('/my/editUser.json', function(req, res, next) { // - test
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['ID'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      let str = '';
      if (query.USE_NAME) {
        str += str ? `, USE_NAME = '${query.USE_NAME}'` : `USE_NAME = '${query.USE_NAME}'`
      }
      if (query.USE_EMAIL) {
        str += str ? `, USE_EMAIL = '${query.USE_EMAIL}'` : `USE_EMAIL = '${query.USE_EMAIL}'`
      }
      if (query.USE_MESSAGE) {
        str += str ? `, USE_MESSAGE = ${query.USE_MESSAGE}` : `USE_MESSAGE = ${query.USE_MESSAGE}`
      }
      if (query.money) {
        str += str ? `, money = '${query.money}'` : `money = '${query.money}'`
      }
      if (query.pre_money) {
        str += str ? `, pre_money = '${query.pre_money}'` : `pre_money = '${query.pre_money}'`
      }
      if (query.bill_money) {
        str += str ? `, bill_money = '${query.bill_money}'` : `bill_money = '${query.bill_money}'`
      }
      if (query.money_cart) {
        str += str ? `, money_cart = '${query.money_cart}'` : `money_cart = '${query.money_cart}'`
      }
      if (query.refund_money) {
        str += str ? `, refund_money = '${query.refund_money}'` : `refund_money = '${query.refund_money}'`
      }
      if (query.refund_type) {
        str += str ? `, refund_type = '${query.refund_type}'` : `refund_type = '${query.refund_type}'`
      }
      if (query.refund_cardId) {
        str += str ? `, refund_cardId = '${query.refund_cardId}'` : `refund_cardId = '${query.refund_cardId}'`
      }
      if (query.bill_money_type) {
        str += str ? `, bill_money_type = '${query.bill_money_type}'` : `bill_money_type = '${query.bill_money_type}'`
      }
      if (query.bill_money_data) {
        str += str ? `, bill_money_data = '${query.bill_money_data}'` : `bill_money_data = '${query.bill_money_data}'`
      }
      if (query.head) {
        str += str ? `, head = '${query.head}'` : `head = '${query.head}'`
      }
      var select = `update my_web.USE set ` +
      str +
      ` where USE_ID = ${query.ID}`;
      connection.query(select, function(err, result, fields) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '编辑成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '编辑失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/my/check_User_name.json', function(req, res, next) { // - test
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['ID', 'name'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.USE';
      connection.query(select, function(err, result, fields) {
        if (!err) {
          const ItemId = result ? result.find(e => `${e.USE_ID}` === `${query.ID}`) : null;
          const ItemName = result ? result.filter(e => `${e.USE_ID}` !== `${query.ID}`).find(e => e.USE_NAME === query.name) : null;
          if (ItemId) {
            if (ItemName) {
              res.send({
                result: 'error',
                errorCode: 200,
                message: '存在同名的用户名',
              });
            } else {
              res.send({
                result: 'succeed',
                errorCode: 200,
                message: '编辑成功',
              });
            }
          } else {
            res.send({
              result: 'error',
              data: result,
              errorCode: 200,
              message: '失败，不存在该用户',
            });
          }
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 我的 *********************************
// 订单处理 ***********************************
router.get('/my/order/getOrder.json', function(req, res, next) { // 查询全部订单 - test
  try {
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.order' + ' where ' + `order_type = 1 and USE_ID = ${query.id}` + ' order by id desc'
      if (`${query.id}` === '1') {
        var select = 'select ' + '*' + ' from ' + 'my_web.order' + ' where ' + `order_type = 1` + ' order by id desc'
      }
      connection.query(select, function(err, result, fields) {
        if (!err) {
          let Arr = [];
          if (result) {
            var connection2 = Mysql.createConnection(host);
            connection2.connect();
            var select2 = 'select ' + 'id, name, img' + ' from ' + 'my_web.device';
            connection2.query(select2, function(err2, result2) {
              if (!err) {
                Arr = result.filter(e => !e.hidden).map(e => {
                  let payPrice = 0;
                  let payId = '';
                  let device_img = '';
                  try {
                    const pay = JSON.parse(e.payData);
                    // payPrice = parseFloat(pay.data.total_amount);
                    payPrice = e.payPrice ? parseFloat(e.payPrice) : 0;
                    payId = pay.id;
                  } catch (error) {
                    //
                  }
                  const Item = result2.find(ee => ee.id === e.device_id);
                  return {
                    ...e,
                    payData: undefined,
                    payPrice,
                    payId,
                    hidden: undefined,
                    device_img: Item ? Item.img : null
                  }
                });
                res.send({
                  result: 'succeed',
                  data: Arr,
                  errorCode: 200,
                  message: '查询成功',
                });
              } else {
                res.send({
                  result: 'error',
                  errorCode: err,
                  message: '查询失败',
                });
              }
            })
            connection2.end();
          }
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/order/getNowOrder.json', function(req, res, next) { // 查询现在进行中的订单 - test
  try {
    // const mysql = require('mysql');
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number, test_parameter, payData' + ' from ' + 'my_web.order' + ' where ' + `state != 1 and order_type = 1 and USE_ID = ${query.id}` + ' order by id desc'
      connecting.query(select,(err, result) => {
        if (!err) {
          let Arr = [];
          if (result) {
            Arr = result.map(e => {
              let payPrice = 0;
              try {
                const pay = JSON.parse(e.payData);
                payPrice = parseFloat(pay.data.total_amount);
                // payPrice = parseFloat(pay.price);
              } catch (error) {
                //
              }
              return {
                ...e,
                payData: undefined,
                payPrice
              }
            });
          }
          res.send({
            result: 'succeed',
            data: Arr,
            errorCode: 200,
            message: '查询成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/order/getFinishOrder.json', function(req, res, next) { // 查询完成的订单 - test
  try {
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number' + ' from ' + 'my_web.order' + ' where ' + `state = 1 and order_type = 1 and USE_ID = ${query.id}`;
      connection.query(select, function(err, result, fields) {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '查询成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/order/getPublishOrder.json', function(req, res, next) { // 查询发单 - test
  try {
    const query = req.query;
    var connection = Mysql.createConnection(host);
    connection.connect();
    var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number' + ' from ' + 'my_web.order' + ' where ' + `state != 1 and order_type = 2 ${query.id ? ` and USE_ID = ${query.id}` : ''}`
    connection.query(select,(err, result) => {
      if (!err) {
        res.send({
          result: 'succeed',
          data: result,
          errorCode: 200,
          message: '查询成功',
        });
      } else {
        res.send({
          result: 'error',
          errorCode: err,
          message: '查询失败',
        });
      }
    });
    connection.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/order/getAcceptOrder.json', function(req, res, next) { // 查询我的接单 - test
  try {
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number' + ' from ' + 'my_web.order' + ' where ' + `state != 1 and order_type = 1 and USE_ID = ${query.id}`
      connection.query(select,(err, result) => {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '查询成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/order/getOrderDetail.json', function(req, res, next) { // 查询订单详情 - test
  try {
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + 'id, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, message, payment, type, device_id, device_name, number, test_parameter, payData, state, hidden' + ' from ' + 'my_web.order' + ' where ' + `order_type = 1 and id = ${query.id}` + ' order by id desc';
      connection.query(select,(err, result) => {
        if (!err) {
          let Arr = [];
          if (result) {
            Arr = result.filter(e => !e.hidden).map(e => {
              let payPrice = 0;
              let payId = ''
              try {
                const pay = JSON.parse(e.payData);
                payPrice = parseFloat(pay.data.total_amount);
                payId = pay.id;
              } catch (error) {
                //
              }
              return {
                ...e,
                payData: undefined,
                payPrice,
                payId,
                hidden: undefined
              }
            });
          }
          res.send({
            result: 'succeed',
            data: Arr ? Arr[0] : null,
            errorCode: 200,
            message: '查询成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 新增
router.post('/my/order/addOrder.json', function(req, res, next) { // 新增订单 - test
  try {
    // const mysql = require('mysql');
    // const query = req.query;
    const query = req.body;
    if (checkFn(['ID', 'NAME', 'ADDRESS', 'GIVE_ID', 'payment', 'type', 'device_id', 'device_name', 'number', 'test_parameter', 'payPrice', 'pay_type'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      const time = DFormat();
      var select2 = 'select ' + '*' + ' from ' + 'my_web.device' + ' where ' + `id = ${query.device_id}`;
      connection.query(select2,(err, result) => {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '不存在该设备',
            });
          } else {
            const Item = result[0];
            var select = `INSERT INTO my_web.order (` +
            `test_parameter, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, state, process, message, payment, type, device_id, device_name, order_type, number, payPrice, pay_type, payData` +
            `) VALUES ( ` +
            `'${query.test_parameter ? query.test_parameter : "{}"}', ` +
            `'${query.ID ? query.ID : ''}', '${query.NAME ? query.NAME : ''}', ` +
            `'${query.ADDRESS ? query.ADDRESS : ''}', '${Item.USE_ID ? Item.USE_ID : ''}', ` +
            `'${Item.USE_NAME ? Item.USE_NAME : ''}', '${Item.address ? Item.address : ''}', ` +
            `'${time}', 0, ` +
            `'${query.process ? query.process : ''}', '${query.message ? query.message : ''}', ` +
            `'${query.payment ? query.payment : 0}', '${query.type ? query.type : 0}', ` +
            `'${query.device_id ? query.device_id : 0}', '${query.device_name ? query.device_name : ''}', ` +
            `1, '${query.number ? query.number : 0}',` +
            `'${query.payPrice ? query.payPrice : 0}', '${query.pay_type ? query.pay_type : ''}',` +
            `'${query.payData ? query.payData : "{}"}')`;
            var connection2 = Mysql.createConnection(host);
            connection2.connect();
            connection2.query(select,(err, result) => {
              if (!err) {
                res.send({
                  result: 'succeed',
                  data: result,
                  errorCode: 200,
                  message: '新增订单成功',
                });
              } else {
                res.send({
                  result: 'error',
                  errorCode: err,
                  message: '新增订单失败',
                });
              }
            });
            connection2.end();
          }
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '新增订单失败',
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误2',
    });
  }
});

router.post('/my/order/addJiancaiHuanjingOrder.json', function(req, res, next) { // 新增订单 - test
  try {
    // const mysql = require('mysql');
    // const query = req.query;
    const query = req.body;
    if (checkFn(['ID', 'NAME', 'ADDRESS', 'GIVE_ID', 'payment', 'type', 'number', 'test_parameter', 'payPrice', 'pay_type'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      const time = DFormat();
      const address = '{"address":["浙江省","浙江省-杭州市","浙江省-杭州市-西湖区"],"detail":"五联西苑","name":"志飞","phone":"18842897729","default":true}'
      var select = `INSERT INTO my_web.order (` +
      `test_parameter, USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, state, process, message, payment, type, order_type, number, payPrice, pay_type, payData` +
      `) VALUES ( ` +
      `'${query.test_parameter ? query.test_parameter : "{}"}', ` +
      `'${query.ID ? query.ID : ''}', '${query.NAME ? query.NAME : ''}', ` +
      `'${query.ADDRESS ? query.ADDRESS : ''}', '1', ` +
      `'yzf', '${address}', ` +
      `'${time}', 0, ` +
      `'${query.process ? query.process : ''}', '${query.message ? query.message : ''}', ` +
      `'${query.payment ? query.payment : 0}', '${query.type ? query.type : 0}', ` +
      `1, '${query.number ? query.number : 0}',` +
      `'${query.payPrice ? query.payPrice : 0}', '${query.pay_type ? query.pay_type : ''}',` +
      `'${query.payData ? query.payData : "{}"}')`
      connecting.query(select,(err, result) => {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '新增订单成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '新增订单失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/order/addPublishOrder.json', function(req, res, next) { // 新增发单 - test
  try {
    const query = req.query;
    if (checkFn(['ID', 'NAME', 'ADDRESS', 'payment', 'device_name', 'number'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      const time = DFormat();
      var select2 = 'select ' + 'USE_ID, USE_NAME, address' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = ${query.GIVE_ID}`
      connecting.query(select2,(err, result) => {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '新增失败',
            });
          }
          var connecting2 = Mysql.createConnection(host);
          connecting2.connect();
          const Item = result[0];
          var select = `INSERT INTO my_web.order (` +
          `USE_ID, USE_NAME, USE_ADDRESS, GIVE_ID, GIVE_NAME, GIVE_ADDRESS, CREATE_DATE, process, message, payment, state, type, device_id, device_name, order_type, number` +
          `) VALUES ( ` +
          `'${query.ID ? query.ID : ''}', '${Item.USE_NAME ? Item.USE_NAME : ''}', ` +
          `'${Item.address ? Item.address[0] : ''}', '', ` +
          `'', '', ` +
          `'${time}', ` +
          `'', '${query.message ? query.message : ''}', ` +
          `'${query.payment ? query.payment : 0}', 0, ` +
          `0, 0, ` +
          `'${query.device_name ? query.device_name : 0}', 2,` +
          ` ${query.number ? query.number : 0})`
          connecting2.query(select,(err, result) => {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '新增发单成功',
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '新增发单失败',
              });
            }
          });
          connecting2.end();
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/order/acceptPublishOrder.json', function(req, res, next) { // 接单 - test
  try {
    const query = req.query;
    if (checkFn(['ID', 'GIVE_ID', 'GIVE_NAME', 'GIVE_ADDRESS', 'device_id', 'device_name'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      const time = DFormat();
      var select2 = 'select ' + '*' + ' from ' + 'my_web.order' + ' where ' + `id = ${query.ID}`
      connecting.query(select2,(err, result) => {
        if (!err) {
          if (!result || !result.length) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '接单失败, 没查询到有该发单',
            });
          }
          const Item = result[0];
          if (Item.device_name !== query.device_name) {
            res.send({
              result: 'error',
              errorCode: err,
              message: '接单失败，该设备不能接此单，请先确认设备名称',
            });
          }
          var connecting2 = Mysql.createConnection(host);
          connecting2.connect();
          var select = `update my_web.order set ` +
          `GIVE_ID = '${query.GIVE_ID}', GIVE_NAME = '${query.GIVE_NAME}', ` +
          `GIVE_ADDRESS = '${query.GIVE_ADDRESS}', device_id = '${query.device_id}', ` +
          `order_type = 1` +
          ` where id = ${query.ID}`;
          connecting2.query(select,(err, result) => {
            if (!err) {
              res.send({
                result: 'succeed',
                data: result,
                errorCode: 200,
                message: '接单成功',
              });
            } else {
              res.send({
                result: 'error',
                errorCode: err,
                message: '接单失败',
              });
            }
          });
          connecting2.end();
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '查询失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 删除单子
router.get('/my/order/deleteOrder.json', function(req, res, next) { // 删除单子 - test
  try {
    const query = req.query;
    if (checkFn(['ID'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      var select = `DELETE FROM my_web.order WHERE id = ${query.ID}`;
      connecting.query(select,(err, result) => {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '删除成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '删除失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 编辑单子
router.post('/my/order/editOrder.json', function(req, res, next) { // 编辑单子 - test
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['ID'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      let str = '';
      if (query.message) {
        str += str ? `, message = '${query.message}'` : `message = '${query.message}'`
      }
      if (query.number) {
        str += str ? `, number = ${query.number}` : `number = ${query.number}`
      }
      if (query.USE_ADDRESS) {
        str += str ? `, USE_ADDRESS = '${query.USE_ADDRESS}'` : `USE_ADDRESS = '${query.USE_ADDRESS}'`
      }
      if (query.payData) {
        str += str ? `, payData = '${query.payData}'` : `payData = '${query.payData}'`
      }
      if (query.payment) {
        str += str ? `, payment = '${query.payment}'` : `payment = '${query.payment}'`
      }
      if (query.state) {
        str += str ? `, state = '${query.state}'` : `state = '${query.state}'`
      }
      if (query.hidden) {
        str += str ? `, hidden = '${query.hidden}'` : `hidden = '${query.hidden}'`
      }
      if (query.payPrice) {
        str += str ? `, payPrice = '${query.payPrice}'` : `payPrice = '${query.payPrice}'`
      }
      if (query.pay_type) {
        str += str ? `, pay_type = '${query.pay_type}'` : `pay_type = '${query.pay_type}'`
      }
      var select = `update my_web.order set ` +
      str +
      ` where id = ${query.ID}`;
      connecting.query(select,(err, result) => {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '编辑成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '编辑失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 设备 ***********************************
router.get('/my/getDeviceList.json', function(req, res, next) { // 查询设备 - ok
  try {
    const query = req.query;
    var connection = Mysql.createConnection(host);
    connection.connect();
    var select = 'select ' + '*' + ' from ' + 'my_web.device' + ' order by usable desc , id'
    if (query.type && query.id) {
      select = 'select ' + '*' + ' from ' + 'my_web.device' + ` where tab_type = '${query.type}' and id = '${query.id}'` + ' order by usable desc , id'
    } else if (query.type) {
      select = 'select ' + '*' + ' from ' + 'my_web.device' + ` where tab_type = '${query.type}'` + ' order by usable desc , id'
    } else if (query.id) {
      select = 'select ' + '*' + ' from ' + 'my_web.device' + ` where id = '${query.id}'` + ' order by usable desc , id'
    }
    connection.query(select, function(err, result, fields) {
      if (!err) {
        res.send({
          result: 'succeed',
          data: result,
          errorCode: 200,
          message: '查询成功',
        });
      } else {
        res.send({
          result: 'error',
          errorCode: err,
          message: '查询失败',
        });
      }
    });
    connection.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/my/addDevice.json', function(req, res, next) { // 新增设备 - test
  try {
    const query = req.query;
    if (checkFn(['USE_ID', 'USE_NAME', 'USE_address', 'type', 'dedail_type', 'tab_type', 'name', 'price'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      const time = DFormat();
      var select = `INSERT INTO my_web.device (` +
      `USE_ID, USE_NAME, address, name, parameter, detail, message, abbreviat, img, test_parameter, type, dedail_type, tab_type, price` +
      `) VALUES ( ` +
      `'${query.USE_ID}', '${query.USE_NAME}', ` +
      `'${query.USE_address}', '${query.name}', ` +
      `'${query.parameter ? query.parameter : ''}', '${query.detail ? query.detail : ''}', ` +
      `'${query.message ? query.message : ''}', '${query.abbreviat ? query.abbreviat : ''}', ` +
      `'${query.img ? query.img : ''}', '${query.test_parameter ? query.test_parameter : '{}'}', ` +
      `'${query.type}', '${query.dedail_type}', ` +
      `'${query.tab_type}', ${query.price}` +
      `)`;
      connecting.query(select,(err, result) => {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '新增设备成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '新增设备失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 删除设备
router.get('/my/order/deleteDevice.json', function(req, res, next) { // - test
  try {
    const query = req.query;
    if (checkFn(['ID'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      var select = `DELETE FROM my_web.device WHERE id = ${query.ID}`;
      connecting.query(select,(err, result) => {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '删除成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '删除失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 编辑设备 - test
router.get('/my/order/editDevice.json', function(req, res, next) {
  try {
    const query = req.query;
    if (checkFn(['ID'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      let str = '';
      if (query.name) {
        str += str ? `, name = '${query.name}'` : `name = '${query.name}'`
      } else if (query.parameter) {
        str += str ? `, parameter = '${query.parameter}'` : `name = '${query.parameter}'`
      } else if (query.detail) {
        str += str ? `, detail = '${query.detail}'` : `detail = '${query.detail}'`
      } else if (query.abbreviat) {
        str += str ? `, abbreviat = '${query.abbreviat}'` : `abbreviat = '${query.abbreviat}'`
      } else if (query.img) {
        str += str ? `, img = '${query.img}'` : `img = '${query.img}'`
      } else if (query.test_parameter) {
        str += str ? `, test_parameter = '${query.test_parameter}'` : `test_parameter = '${query.test_parameter}'`
      } else if (query.type) {
        str += str ? `, type = '${query.type}'` : `type = '${query.type}'`
      } else if (query.dedail_type) {
        str += str ? `, dedail_type = '${query.dedail_type}'` : `dedail_type = '${query.dedail_type}'`
      } else if (query.tab_type) {
        str += str ? `, tab_type = '${query.tab_type}'` : `tab_type = '${query.tab_type}'`
      } else if (query.address) {
        str += str ? `, address = '${query.address}'` : `address = '${query.address}'`
      } else if (query.price) {
        str += str ? `, price = ${query.price}` : `price = ${query.price}`
      } else if (query.message) {
        str += str ? `, message = '${query.message}'` : `message = '${query.message}'`
      }
      var select = `update my_web.device set ` +
      str +
      ` where id = ${query.ID}`;
      connecting.query(select,(err, result) => {
        if (!err) {
          res.send({
            result: 'succeed',
            data: result,
            errorCode: 200,
            message: '编辑成功',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '编辑失败',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 商品 ***********************************
router.get('/my/getGoodsList.json', function(req, res, next) { // 查询商品 - test
  try {
    const query = req.query;
    var connecting = Mysql.createConnection(host);
    connecting.connect();
    var select = 'select ' + '*' + ' from ' + 'my_web.goods'
    if (query.id) {
      select = 'select ' + '*' + ' from ' + 'my_web.goods' + ` where id = '${query.id}'`
    }
    connecting.query(select,(err, result) => {
      if (!err) {
        res.send({
          result: 'succeed',
          data: result,
          errorCode: 200,
          message: '查询成功',
        });
      } else {
        res.send({
          result: 'error',
          errorCode: err,
          message: '查询失败',
        });
      }
    });
    connecting.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 城市 *******************************
router.get('/city.json', function(req, res, next) { // 查询城市
  try {
    if (City && City.City) {
      res.send({
        result: 'succeed',
        data: City.City,
        errorCode: 200,
        message: '查询成功',
      });
    } else {
      res.send({
        data: [],
        result: 'error',
        errorCode: err,
        message: '查询失败',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 建材、环境 ***********************************
router.post('/jiancai/getList.json', async (req, res, next) => { // test
  try {
    // const query = req.query;
    const query = req.body;
    if (true) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.jiancai';
      connecting.query(select, (err, result) => {
        if (!err && result) {
          const Json = {};
          result.map(ee => ({
            id: ee.id,
            step1: ee.step1 ? ee.step1.split('\n').join('') : '',
            step2: ee.step2 ? ee.step2.split('\n').join('') : '',
            step3: ee.step3 ? ee.step3.split('\n').join('') : '',
            step4: ee.step4 ? ee.step4.split('\n').join('') : '',
          })).forEach(e => {
            if (Json[e.step1] && Json[e.step1][e.step2] && Json[e.step1][e.step2][e.step3]) {
              Json[e.step1][e.step2][e.step3].push(e.step4);
            } else if (Json[e.step1] && Json[e.step1][e.step2]) {
              Json[e.step1][e.step2][e.step3] = [e.step4];
            } else if (Json[e.step1]) {
              const te = {};
              te[e.step3] = [e.step4];
              Json[e.step1][e.step2] = te;
            } else {
              const te = {};
              te[e.step3] = [e.step4];
              const te2 = {};
              te2[e.step2] = te;
              Json[e.step1] = te2;
            }
          });
          res.send({
            result: 'succeed',
            data: Json,
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者密码错误',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/jiancai/getDetail.json', async (req, res, next) => { // test
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['data'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.jiancai';
      connecting.query(select, (err, result) => {
        if (!err && result) {
          let Data = [];
          try {
            Data = JSON.parse(query.data);
          } catch (error) {
            //
          }
          const Arr = [];
          const result_Now = result.map(ee => ({
            id: ee.id,
            step1: ee.step1 ? ee.step1.split('\n').join('') : '',
            step2: ee.step2 ? ee.step2.split('\n').join('') : '',
            step3: ee.step3 ? ee.step3.split('\n').join('') : '',
            step4: ee.step4 ? ee.step4.split('\n').join('') : '',
            result1: ee.result1 ? ee.result1.split('\n').join('') : '',
            result2: ee.result2 ? ee.result2.split('\n').join('') : '',
            result3: ee.result3 ? ee.result3.split('\n').join('') : '',
            result4: ee.result4,
          }))
          Data.forEach(e => {
            if (e.step4) {
              const Arr2 = e.step4.split(',');
              Arr2.forEach(e3 => {
                const It = result_Now.find(e2 => e2.step1 === e.step1 && e2.step2 === e.step2 && e2.step3 === e.step3 && e2.step4 === e3);
                if (It) {
                  Arr.push({
                    ...It
                  })
                }
              })
            }
          })
          res.send({
            a:Data,
            result: 'succeed',
            data: Arr,
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者密码错误',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/huanjing/getList.json', async (req, res, next) => { // test
  try {
    // const query = req.query;
    const query = req.body;
    if (true) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.huanjing';
      connecting.query(select, (err, result) => {
        if (!err && result) {
          const Json = {};
          result.map(ee => ({
            step1: ee.step1 ? ee.step1.split('\n').join('') : '',
            step2: ee.step2 ? ee.step2.split('\n').join('') : '',
          })).forEach(e => {
            if (Json[e.step1]) {
              Json[e.step1].push(e.step2);
            } else {
              Json[e.step1] = [e.step2];
            }
          });
          res.send({
            result: 'succeed',
            data: Json,
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者密码错误',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/huanjing/getDetail.json', async (req, res, next) => { // test
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['data'], query, res)) {
      var connecting = Mysql.createConnection(host);
      connecting.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.huanjing';
      connecting.query(select, (err, result) => {
        if (!err && result) {
          let Data = [];
          try {
            Data = JSON.parse(query.data);
          } catch (error) {
            //
          }
          const result_Now = result.map(ee => ({
            id: ee.id,
            step1: ee.step1 ? ee.step1.split('\n').join('') : '',
            step2: ee.step2 ? ee.step2.split('\n').join('') : '',
            result1: ee.result1 ? ee.result1.split('\n').join('') : '',
            result2: ee.result2,
          }))
          const Arr = [];
          Data.forEach(e => {
            if (e.step2) {
              const Arr2 = e.step2.split(',');
              Arr2.forEach(e3 => {
                const It = result_Now.find(e2 => e2.step1 === e.step1 && e2.step2 === e3);
                if (It) {
                  Arr.push({
                    ...It
                  })
                }
              })
            }
          })
          res.send({
            result: 'succeed',
            aa: result_Now,
            data: Arr,
          });
        } else {
          res.send({
            result: 'error',
            errorCode: err,
            message: '用户名或者密码错误',
          });
        }
      });
      connecting.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 首页
router.get('/bangdan/deviceList.json', function(req, res, next) { // 设备榜单 - test
  try {
    const query = req.query;
    var connecting = Mysql.createConnection(host);
    connecting.connect();
    var select = 'select ' + '*' + ' from ' + 'my_web.device where usable = 1' + ' order by id desc LIMIT 10'
    connecting.query(select,(err, result) => {
      if (!err) {
        res.send({
          result: 'succeed',
          data: result,
          errorCode: 200,
          message: '查询成功',
        });
      } else {
        res.send({
          result: 'error',
          errorCode: err,
          message: '查询失败',
        });
      }
    });
    connecting.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/bangdan/orderList.json', function(req, res, next) { // 榜单 - test
  try {
    const query = req.query;
    var connecting = Mysql.createConnection(host);
    connecting.connect();
    var select = 'select ' + '*' + ' from ' + 'my_web.order where state != 1' + ' order by id desc LIMIT 10'
    connecting.query(select,(err, result) => {
      if (!err) {
        res.send({
          result: 'succeed',
          data: result,
          errorCode: 200,
          message: '查询成功',
        });
      } else {
        res.send({
          result: 'error',
          errorCode: err,
          message: '查询失败',
        });
      }
    });
    connecting.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/bangdan/okOrderList.json', function(req, res, next) { // 成交榜单 - test
  try {
    const query = req.query;
    var connecting = Mysql.createConnection(host);
    connecting.connect();
    var select = 'select ' + '*' + ' from ' + 'my_web.order where state = 1' + ' order by id desc LIMIT 10'
    connecting.query(select,(err, result) => {
      if (!err) {
        res.send({
          result: 'succeed',
          data: result,
          errorCode: 200,
          message: '查询成功',
        });
      } else {
        res.send({
          result: 'error',
          errorCode: err,
          message: '查询失败',
        });
      }
    });
    connecting.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

module.exports = router;
