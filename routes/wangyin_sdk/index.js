var express = require('express');
var router = express.Router();
var AlipaySdk = require('alipay-sdk').default;
var AlipayFormData = require('alipay-sdk/lib/form').default;
var https = require('https');
var fs = require('fs');
var os = require('os');
var unionPay = require('./pay');
// var unionPay = require('./unionPay');

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

const alipaySdk = new AlipaySdk({
  // 参考下方 SDK 配置
  url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  appId: 'wx8abd653c5920823b',
  mch_id: 'wx8abd653c5920823b',
  nonce_str: '5K8264ILTKCH16Ca2502SI8ZNMTM63VS',
  spbill_create_ip: getIPAdress(),
  // privateKey: fs.readFileSync('./public/ssl/zfb/private-key.pem', 'ascii'), // 应用私钥字符串
  // alipayPublicKey: fs.readFileSync('./public/ssl/zfb/public-key.pem', 'ascii'), // 支付宝公钥
  privateKey: 'lgyyzf1234lgyyzf1234lgyyzf123473', // 应用私钥字符串
  alipayPublicKey: fs.readFileSync('./public/ssl/zfb/public-key.pem', 'ascii'), // 支付宝公钥
});

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
      if (!query[i]) {
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

router.get('/web/pay.json', async function(req, res, next) {
  try {
    const query = req.query;
    res.send({
      data: 32,
      result: 'succeed',
      errorCode: 200,
      message: '',
    });
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

/* GET */
// 支付连接
router.get('/web/pay32.json', async function(req, res, next) {
  try {
    const query = req.query;
    if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
      const formData = new AlipayFormData();
      formData.setMethod('get');
      formData.addField('notifyUrl', 'https://www.ushance.com/weixing_sdk/web/yanqian.json');
      formData.addField('bizContent', {
        qr_pay_mode: 1,
        outTradeNo: query.id, // 唯一值
        productCode: 'FAST_INSTANT_TRADE_PAY',
        totalAmount: query.price,
        subject: query.name,
        body: query.describe,
      });
      const result = await alipaySdk.exec(
        'alipay.trade.page.pay',
        {},
        { formData: formData },
      );
      res.send({
        data: result,
        result: 'succeed',
        errorCode: 200,
        message: '',
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

const tenpay = require('tenpay');
const config = {
  appid: 'wx8abd653c5920823b',
  mchid: '1558987061',
  // partnerKey: 'lgyyzf1234lgyyzf1234lgyyzf123473',
  // pfx: require('fs').readFileSync('证书文件路径'),
  notify_url: 'https://www.ushance.com/weixing_sdk/web/yanqian.json',
  // spbill_create_ip: 'IP地址'
};
// const api = new tenpay(config, true);
var qr = require('qr-image');
const getSign = (params, type = 'MD5') => {
  const util = require('./util');
  let str = util.toQueryString(params) + '&key=' + 'lgyyzf1234lgyyzf1234lgyyzf123473';
  switch (type) {
    case 'MD5':
      return util.md5(str).toUpperCase();
    case 'HMAC-SHA256':
      return util.sha256(str, 'lgyyzf1234lgyyzf1234lgyyzf123473').toUpperCase();
    default:
      throw new Error('signType Error');
  }
}
router.get('/web/pay2.json', async function(req, res, next) {
  try {
    // const query = req.query;
    const params = {
      // ...config,
      //
      nonce_str: '5K8264ILsKCH16CQ2202SI8ZNMTM67VS',
      spbill_create_ip: '127.0.0.1',
      //
      out_trade_no: 'yzf_1017183444',
      body: '商品简单描述',
      total_fee: '1',
      openid: '用户openid',
      trade_type: 'NATIVE',
      product_id: '商品id'
    }
    // let result = await api.unifiedOrder({ // unifiedOrder getNativeUrl
    //   ...Json
    // });
    params.sign = getSign(params);

    // res.render(result)
    // res.send(result);
    // var img = qr.image(result,{size :10});
    // res.writeHead(200, {'Content-Type': 'image/png'});
    // img.pipe(res);
    var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder?'+
    'appid=wx8abd653c5920823b&mch_id=1558987061&nonce_str=5K8264ILsKCH16CQ2202SI8ZNMTM67VS' +
    `&sign=${getSign(params)}&body=商品简单描述&out_trade_no=yzf_1017183444&total_fee=1&spbill_create_ip=127.0.0.1` +
    '&notify_url=https://www.ushance.com/weixing_sdk/web/yanqian.json&trade_type=JSAPI';
    console.log('url:' + url)
    //验证是否是支付宝发来的通知
    https.get('https://api.mch.weixin.qq.com/pay/unifiedorder?ppid=wx8abd653c5920823b', function(text) {
    //   //有数据表示是由支付宝发来的通知
      // if(text) {
      //   //交易成功
      //   console.log('success')
      // } else {
      //   //交易失败
      //   console.log('err')
      // }
      res.send(text)
      // res.send({
      //   data: text,
      //   // prepay_id,
      //   // code_url,
      //   result: 'succeed',
      //   errorCode: 200,
      //   message: '',
      // });
    })
    // res.send({
    //   data: url,
    //   // prepay_id,
    //   // code_url,
    //   result: 'succeed',
    //   errorCode: 200,
    //   message: '',
    // });
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

router.get('/web/pay3.json', async function(req, res, next) {
  try {
    const query = req.query;
    const formData = new AlipayFormData();
      formData.setMethod('get');
      formData.addField('notifyUrl', 'https://www.ushance.com/weixing_sdk/web/yanqian.json');
      formData.addField('bizContent', {
        // qr_pay_mode: 1,
        outTradeNo: 'yzf_1017123444', // 唯一值
        // productCode: 'FAST_INSTANT_TRADE_PAY',
        totalFee: 0.01,
        // subject: query.name,
        // body: query.describe,
        trade_type: 'JSAPI',
      });
    const result = await alipaySdk.exec(
      'alipay.trade.page.pay',
      {},
      { formData: formData },
    );
    const signContent = Object.keys(signArgs).sort().filter(val => val).map((key) => {
      let value = signArgs[key];
      if (Array.prototype.toString.call(value) !== '[object String]') {
          value = JSON.stringify(value);
      }
      return `${key}=${decodeURIComponent(value)}`;
  }).join('&');
    res.send({
      data: 2,
      result: 'succeed',
      errorCode: 200,
      message: '',
    });
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

// 验证
router.post('/web/yanqian.json', async function(req, res, next) {
  const verify = await alipaySdk.checkNotifySign(req.body);
  const Data = req.body;
  console.log('yanqian')
  // console.log(JSON.stringify(req.body))
  if (Data) {
    const id = Data.out_trade_no;
    const price = Data.total_amount;
    console.log(id)
    console.log(price)
  }
  // console.log('yanqian_body')
  // console.log(req.body)
  // console.log(verify)
  console.log('yanqian-ok')
  // if (verify) {
  //   const mysql = require('mysql');
  //   var pool = mysql.createPool(host);
  //   pool.getConnection((err, connecting) => {
  //     if (err) {
  //       res.send({
  //         data: 'ok',
  //         result: 'succeed',
  //         errorCode: 200,
  //         message: '数据库连接失败',
  //       });
  //     } else { // 链接成功
  //       const ID = query.id.split('_')[1];
  //       let str = '';
  //         if ('payData') {
  //         str += str ? `, payData = '{}'` : `payData = '{}'`;
  //       } else if ('payment') {
  //         str += str ? `, payment = '${0}'` : `payment = '${0}'`;
  //       }
  //       var select = `update my_web.order set ` +
  //       str +
  //       ` where id = ${ID}`;
  //       connecting.query(select,(err, result) => {
  //         if (!err) {
  //           res.send({
  //             data: 'ok',
  //             result: 'succeed',
  //             errorCode: 200,
  //             message: '',
  //           });
  //         } else {
  //           res.send({
  //             data: 'ok',
  //             result: 'succeed',
  //             errorCode: 200,
  //             message: '数据更新有问题',
  //           });
  //         }
  //       });
  //     }
  //   });
  // }
  res.send({
    result: verify,
    errorCode: 'err',
    message: '1221',
  });
});

router.get('/web/yanqian2.json', async function(req, res, next) {
  console.log(req.body)
  var params = req.body
  var mysign = veriySign(params);
  //验证支付宝签名mysign为true表示签名正确
  console.log(mysign)
  try {
    //验签成功
    if(mysign) {
      if(params['notify_id']) {
        //生成验证支付宝通知的url
        var url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&' + 'partner=' + 12 + '&notify_id=' + params['notify_id'];
        console.log('url:' + url)
        //验证是否是支付宝发来的通知
        https.get(url, function(text) {
          //有数据表示是由支付宝发来的通知
          if(text) {
            //交易成功
            console.log('success')
          } else {
            //交易失败
            console.log('err')
          }
        })
      }
    }
  } catch(err) {
    console.log(err);
  }
});

router.get('/web/okPay.json', async function(req, res, next) {
  const postData = {
    appId: '2019101268311851',
    charset: 'utf-8',
    version: '1.0',
    sign_type: 'RSA2',
    timestamp: '2019-10-19 16:10:29',
    notify_url: 'https://www.ushance.com/',
    sign: 'RSA2&timestamp=2019-10-19 16:10:29',
    alipay_sdk: 'alipay-sdk-nodejs-3.0.8',
    biz_content: {
      out_trade_no: '20150320010101001',
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: '0.0.1',
      subject: '商品',
      body: '商品详情'
    }
  }
  const verify = await alipaySdk.checkNotifySign(postData);
  res.send({
    result: verify,
    errorCode: 'err',
    message: '1221',
  });
});

// 查询
router.get('/web/query.json', async function(req, res, next) {
  try {
    const query = req.query;
    if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
      const formData = new AlipayFormData();
      formData.setMethod('get');
      formData.addField('notifyUrl', 'https://www.ushance.com/zfb_sdk/web/yanqian.json');
      formData.addField('bizContent', {
        outTradeNo: query.id, // 唯一值
        productCode: 'FAST_INSTANT_TRADE_PAY',
        totalAmount: query.price,
        subject: query.name,
        body: query.describe,
      });
      const result = await alipaySdk.exec(
        'alipay.trade.query',
        {},
        { formData: formData },
      );
      if (result) {
        download(result, function( data ) {
          if(data){
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
              message: '查询失败',
            });
          }
        })
      } else {
        res.send({
          result: 'error',
          errorCode: 200,
          message: '查询失败',
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

// 退款
router.post('/web/refund.json', async function(req, res, next) {
  // const query = req.query;
  const query = req.body;
  if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
    const formData = new AlipayFormData();
    formData.setMethod('get');
    formData.addField('notifyUrl', 'https://www.ushance.com/zfb_sdk/web/yanqian.json');
    formData.addField('bizContent', {
      outTradeNo: query.id, // 唯一值
      productCode: 'FAST_INSTANT_TRADE_PAY',
      refund_amount: query.price,
      subject: query.name,
      body: query.describe,
    });
    const result = await alipaySdk.exec(
      'alipay.trade.refund',
      {},
      { formData: formData },
    );
    if (result) {
      download(result, function( data ) {
        if(data){
          const zfb = JSON.parse(data);
          if (zfb.alipay_trade_refund_response.msg === 'Success') {
            const mysql = require('mysql');
            var pool = mysql.createPool(host);
            pool.getConnection((err, connecting) => {
              if (err) {
                res.send({
                  data: 'ok',
                  result: 'succeed',
                  errorCode: 200,
                  message: '数据库连接失败',
                });
              } else { // 链接成功
                const ID = query.id.split('_')[1];
                let str = '';
                 if ('payData') {
                  str += str ? `, payData = '{}'` : `payData = '{}'`;
                }
                if ('payment') {
                  str += str ? `, payment = '${0}'` : `payment = '${0}'`;
                }
                var select = `update my_web.order set ` +
                str +
                ` where id = ${ID}`;
                connecting.query(select,(err, result) => {
                  if (!err) {
                    res.send({
                      data: zfb.alipay_trade_refund_response,
                      result: 'succeed',
                      errorCode: 200,
                      message: '',
                    });
                  } else {
                    res.send({
                      data: 'ok',
                      result: 'succeed',
                      errorCode: 200,
                      message: '数据更新有问题',
                    });
                  }
                });
              }
            });
          } else {
            res.send({
              result: 'error',
              errorCode: 200,
              refund_amount: query.price,
              message: zfb.alipay_trade_refund_response.sub_msg,
            });
          }
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: '退款失败',
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: 200,
        message: '退款失败',
      });
    }
  }
});

router.get('/web/refundQuery.json', async function(req, res, next) {
  const query = req.query;
  if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
    const formData = new AlipayFormData();
    formData.setMethod('get');
    formData.addField('notifyUrl', 'https://www.ushance.com/zfb_sdk/web/yanqian.json');
    formData.addField('bizContent', {
      outTradeNo: query.id, // 唯一值
      productCode: 'FAST_INSTANT_TRADE_PAY',
      refund_amount: query.price,
      subject: query.name,
      body: query.describe,
    });
    const result = await alipaySdk.exec(
      'alipay.trade.fastpay.refund.query',
      {},
      { formData: formData },
    );
    if (result) {
      download(result, function( data ) {
        if(data){
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
            message: '查询失败',
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: 200,
        message: '查询失败',
      });
    }
  }
});

function rand(min,max) {
  return Math.floor(Math.random()*(max-min))+min;
}
let messageCode = {};
// 短信验证
router.get('/web/message.json', async function(req, res, next) {
  try {
    // const query = req.body;
    const query = req.query;
    const Core = require('@alicloud/pop-core');
    if (checkFn(['phone', 'id'], query, res)) {
      var client = new Core({
        accessKeyId: 'LTAI4FqgnSGGmsdDeF1m712N',
        accessKeySecret: 'z12O3EdeHvr5HhycVVaLx0EgsvDWJN',
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25',
      });
      var params = {
        "RegionId": "cn-hangzhou",
        "PhoneNumbers": query.Phone,
        "SignName": "ushance",
        "TemplateCode": "SMS_175465012",
        "TemplateParam": `{code: ${messageCode}}`,
        "OutId": "流水号"
      }
      var requestOption = {
        method: 'POST'
      };
      client.request('SendSms', params, requestOption).then((result) => {
        if (result && result.Code === 'OK') {
          messageCode[query.id] = rand(111111, 999999);
          setTimeout(() => {
            delete messageCode[query.id];
          }, 60000)
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
          errorCode: 200,
          message: ex,
        });
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

module.exports = router;
