var express = require('express');
var router = express.Router();
var https = require('https');
const Mysql = require('mysql');
var fs = require('fs');
var os = require('os');
var path = require('path');

function getIPAdress() {
  // if(localIp) return localIp;
  let localIPAddress = "";
  let interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
      let iface = interfaces[devName];
      for (let i = 0; i < iface.length; i++) {
          let alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              localIPAddress = alias.address;
          }
      }
  }
  // localIp = localIPAddress;
  return localIPAddress;
}

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

function download ( url, callback ) {
  https.get( url,function(res){
    var data = "";
    res.setEncoding('utf8');
    res.on("data",function(chunk){
      data += chunk;
    });
    res.on("end",function(){
      callback(data)
    })
  }).on("error",function(err){
    console.log(err)
    callback()
  })
}

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

var host = {
  host: '39.100.225.94', // 149.129.177.101
  port: 3306,
  database: 'my_web', // 数据库
  user: 'yzflhez',
  password: 'Yzf-1234',
}

/* GET */
// 微信支付
const tenpay = require('tenpay');
const config = {
  appid: 'wx31555a0999f1af84',
  mchid: '1558987061',
  partnerKey: 'lgyyzf1234lgyyzf1234lgyyzf123473',
  // pfx: require('fs').readFileSync('证书文件路径'),
  // pfx: fs.readFileSync('./public/ssl/weixin/apiclient_cert.p12', 'ascii'),
  pfx: fs.readFileSync( path.resolve(__dirname,"../../ssl/weixin/apiclient_cert.p12"), 'ascii'),
  notify_url: 'https://www.ushance.com/weixing_sdk/web/yanqian.json',
  // spbill_create_ip: 'IP地址'
};
const api = new tenpay(config, true);
var qr = require('qr-image');

router.get('/web/pay.json', async function(req, res, next) {
  try {
    const query = req.query;
    if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
      const params = {
        nonce_str: '5K8264ILsKCH16CQ2202SI8ZNMTM67VS',
        // spbill_create_ip: '127.0.0.1',
        out_trade_no: query.id,
        body: query.describe,
        total_fee: query.price,
        // openid: '20191214',
        trade_type: 'NATIVE',
        product_id: query.name
      }
      let result = await api.unifiedOrder({ // unifiedOrder getNativeUrl
        ...params
      });
      var img = qr.image(result.code_url,{size :10});
      res.writeHead(200, {'Content-Type': 'image/png'});
      img.pipe(res);
      // res.send({
      //   data: img,
      //   // prepay_id,
      //   // code_url,
      //   result: 'succeed',
      //   errorCode: 200,
      //   message: '',
      // });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

// 查询
router.get('/web/query.json', async function(req, res, next) {
  try {
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      let result = await api.orderQuery({ // unifiedOrder getNativeUrl
        out_trade_no: query.id,
      });
      res.send({
        data: result,
        result: 'succeed',
        errorCode: 200,
        message: '2',
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

// 关闭
router.get('/web/closeorder.json', async function(req, res, next) {
  try {
    // const query = req.query;
    const query = req.body;
    console.log(1111)
    let result = await api.closeOrder({
      // transaction_id, out_trade_no 二选一
      // transaction_id: '微信的订单号',
      out_trade_no: 'yzf_1017183444',
      // out_refund_no: '4200000438201912143497771095',
      // total_fee: '0.01',
      // refund_fee: '0.01'
    });
    console.log(321212)
    res.send({
      data: result,
      result: 'succeed',
      errorCode: 200,
      message: '2',
    });
    // if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
      
    // }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

// 退款
router.get('/web/refund.json', async function(req, res, next) {
  try {
    // const query = req.query;
    const query = req.body;
    var WXPay = require('weixin-pay');
    if (checkFn(['id', 'price'], query, res)) {
      var wxpay = WXPay({
          appid: 'wx31555a0999f1af84',
          mch_id: '1558987061',
          partner_key: 'lgyyzf1234lgyyzf1234lgyyzf123473', //微信商户平台API密钥
          pfx: fs.readFileSync('./public/ssl/weixin/apiclient_cert.p12'), //微信商户平台证书
      });
      var params = {
          appid: 'wx31555a0999f1af84',
          mch_id: '1558987061',
          op_user_id: '1558987061',
          out_refund_no: '20140703'+Math.random().toString().substr(2, 10),
          total_fee: query.price, //原支付金额
          refund_fee: query.price, //退款金额
          out_trade_no: query.id,
          // transaction_id: '4200000450201912221764995896'
      };
      wxpay.refund(params, function(err, result){
          console.log('refund', arguments);
          res.send({
            data: arguments[1],
            result: 'succeed',
            errorCode: 200,
            message: '2',
          });
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

router.get('/web/refundQuery.json', async function(req, res, next) {
  try {
    // const query = req.query;
    const query = req.body;
    console.log(1111)
    // let result = await api.refundQuery({
    //   // transaction_id, out_trade_no 二选一
    //   // transaction_id: '微信的订单号',
    //   // out_trade_no: 'yzf_1017183444',
    //   out_refund_no: '4200000438201912143497771095',
    //   // total_fee: '0.01',
    //   // refund_fee: '0.01'
    // });
    let result = await api.refundQuery({
      // 以下参数 四选一
      transaction_id: '4200000438201912143497771095',
      // out_trade_no: 'yzf_1017183444',
      // out_refund_no: '商户内部退款单号',
      // refund_id: '微信退款单号'
    });
    console.log(321212)
    res.send({
      data: result,
      result: 'succeed',
      errorCode: 200,
      message: '2',
    });
    // if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
      
    // }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

// 获取手机
router.post('/web/get_phone.json', async function(req, res, next) {
  try {
    var WXBizDataCrypt = require('./WXBizDataCrypt');
    const query = req.body;
    // const query = req.query;
    if (checkFn(['code', 'iv', 'encryptedData'], query, res)) {
      const appId = 'wx19571e16a64f866c';
      const secret = '5450c6a752aedcaecec5033c1b536d74';
      const encryptedData = query.encryptedData;
      const iv = query.iv;
      const Url = encodeURI(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${query.code}&grant_type=authorization_code`);
      download(Url, function( val ) {
        if(val){
          const VAL = JSON.parse(val);
          const sessionKey = VAL.session_key; // val => sessionKey
          const pc = new WXBizDataCrypt(appId, sessionKey)
          const data = pc.decryptData(encryptedData , iv)
          res.send({
            data: data,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: '代码出错了',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

router.post('/web/phone_sign_in.json', async function(req, res, next) {
  try {
    var WXBizDataCrypt = require('./WXBizDataCrypt');
    const query = req.body;
    // const query = req.query;
    if (checkFn(['code', 'iv', 'encryptedData', 'name', 'head'], query, res)) {
      const appId = 'wx19571e16a64f866c';
      const secret = '5450c6a752aedcaecec5033c1b536d74';
      const encryptedData = query.encryptedData;
      const iv = query.iv;
      const Url = encodeURI(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${query.code}&grant_type=authorization_code`);
      download(Url, function( val ) {
        if(val){
          const VAL = JSON.parse(val);
          const sessionKey = VAL.session_key; // val => sessionKey
          const pc = new WXBizDataCrypt(appId, sessionKey);
          if (pc && pc.decryptData) {
            const data = pc.decryptData(encryptedData , iv);
            if (data && data.phoneNumber) {
              var connection = Mysql.createConnection(host);
              connection.connect();
              var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `phone = "${data.phoneNumber}"`
              connection.query(select, function(err, result, fields) {
                if (!err && result[0]) { // 有是登录
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
                    data: Item,
                  });
                } else { // 是注册
                  const time = DFormat();
                  var select2 = `INSERT INTO my_web.USE (USE_NAME, USE_ODER, CREATE_DATE, phone, head) VALUES ( '${query.name}', '1', '${time}', '${data.phoneNumber}', '${query.head}')`
                  var connection2 = Mysql.createConnection(host);
                  connection2.connect();
                  connection2.query(select2,(err, result) => {
                    if (!err) {
                      res.send({
                        result: 'succeed',
                        data: {
                          USE_ID: result.insertId,
                          USE_NAME: query.name,
                          USE_ODER: '1',
                          phone: data.phoneNumber,
                          head: query.head
                        },
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
                }
              });
              connection.end();
            }
          } else {
            res.send({
              result: 'error',
              errorCode: 200,
              message: '出错了，请一会再试一试',
            });
          }
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: '代码出错了',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

// 获取用户
router.post('/web/get_user.json', async function(req, res, next) {
  try {
    var WXBizDataCrypt = require('./WXBizDataCrypt');
    const query = req.body;
    // const query = req.query;
    if (checkFn(['code'], query, res)) {
      const appId = 'wx19571e16a64f866c';
      const secret = '5450c6a752aedcaecec5033c1b536d74';
      const Url = encodeURI(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${query.code}&grant_type=authorization_code`);
      download(Url, function( val ) {
        if(val){
          res.send({
            data: JSON.parse(val),
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: '获取失败',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});



function rand(min,max) {
  return Math.floor(Math.random()*(max-min))+min;
}

module.exports = router;
