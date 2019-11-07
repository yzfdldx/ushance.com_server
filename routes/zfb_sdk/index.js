var express = require('express');
var router = express.Router();
var AlipaySdk = require('alipay-sdk').default;
var AlipayFormData = require('alipay-sdk/lib/form').default;
var https = require('https');
var fs = require('fs');

const alipaySdk = new AlipaySdk({
  // 参考下方 SDK 配置
  // url: 'https://openapi.alipay.com/gateway.do',
  appId: '2019101268311851',
  // privateKey: fs.readFileSync('./public/ssl/zfb/private-key.pem', 'ascii'), // 应用私钥字符串
  // alipayPublicKey: fs.readFileSync('./public/ssl/zfb/public-key.pem', 'ascii'), // 支付宝公钥
  privateKey: fs.readFileSync('./public/ssl/zfb/private-key.pem', 'ascii'), // 应用私钥字符串
  alipayPublicKey: fs.readFileSync('./public/ssl/zfb/public-key.pem', 'ascii'), // 支付宝公钥
});


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
  host: '149.129.177.101',
  port: 3306,
  database: 'my_web', // 数据库
  user: 'yzf',
  password: 'Yzf-1234',
}

/* GET */
// 支付连接
router.get('/web/pay.json', async function(req, res, next) {
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

router.get('/web/pay2.json', async function(req, res, next) {
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
        'alipay.trade.page.pay',
        {},
        { formData: formData },
      );
      res.send({
        result: result,
        errorCode: 200,
        message: '',
      });
    }
  } catch (error) {
    res.send({
      result: null,
      errorCode: 'err',
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
                      data: 'ok',
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
