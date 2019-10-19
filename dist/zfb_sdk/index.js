var express = require('express');
var router = express.Router();
var AlipaySdk = require('alipay-sdk').default;
var AlipayFormData = require('alipay-sdk/lib/form').default;
var https = require('https');
var fs = require('fs');
var crypto = require('crypto');

var alipaySdk = new AlipaySdk({
  // 参考下方 SDK 配置
  // url: 'https://openapi.alipay.com/gateway.do',
  appId: '2019101268311851',
  // privateKey: fs.readFileSync('./public/ssl/zfb/private-key.pem', 'ascii'), // 应用私钥字符串
  // alipayPublicKey: fs.readFileSync('./public/ssl/zfb/public-key.pem', 'ascii'), // 支付宝公钥
  privateKey: fs.readFileSync('./public/ssl/zfb/private-key.pem', 'ascii'), // 应用私钥字符串
  alipayPublicKey: fs.readFileSync('./public/ssl/zfb/public-key.pem', 'ascii'), // 支付宝公钥
});
// console.log(21)

var checkFn = (e, query, res) => {
  if (query && e) {
    var onoff = true;
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

//将支付宝发来的数据生成有序数列
function getVerifyParams(params) {
  var sPara = [];
  if(!params) return null;
  for(var key in params) {
      if((!params[key]) || key == "sign" || key == "sign_type") {
          continue;
      };
      sPara.push([key, params[key]]);
  }
  sPara = sPara.sort();
  var prestr = '';
  for(var i2 = 0; i2 < sPara.length; i2++) {
      var obj = sPara[i2];
      if(i2 == sPara.length - 1) {
          prestr = prestr + obj[0] + '=' + obj[1] + '';
      } else {
          prestr = prestr + obj[0] + '=' + obj[1] + '&';
      }
  }
  return prestr;
}

function veriySign(params) {
  try {
      var publicPem = fs.readFileSync('./public/ssl/zfb/private-public-key.pem'); // 应用公钥字符串
      var publicKey = publicPem.toString();
      var prestr = getVerifyParams(params);
      var sign = params['sign'] ? params['sign'] : "";
      var verify = crypto.createVerify('RSA-SHA1');
      verify.update(prestr);
      return verify.verify(publicKey, sign, 'base64')
  } catch(err) {
      console.log('veriSign err', err)
  }
}

var partner = '';

/* GET */
router.get('/web/pay.json', async function(req, res, next) {
  partner = '';
  try {
    var query = req.query;
    if (checkFn(['id', 'price', 'name', 'describe'], query, res)) {
      var formData = new AlipayFormData();
      partner = query.id,
      formData.setMethod('get');
      formData.addField('notifyUrl', 'https://www.ushance.com/zfb_sdk/web/yanqian.json');
      formData.addField('bizContent', {
        outTradeNo: query.id, // 唯一值
        productCode: 'FAST_INSTANT_TRADE_PAY',
        totalAmount: query.price,
        subject: query.name,
        body: query.describe,
      });
      var result = await alipaySdk.exec(
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

router.post('/web/yanqian2.json', async function(req, res, next) {
  // res.send({
  //   result: req,
  //   errorCode: 200,
  //   message: 'ok',
  // });
  console.log('yanqian.json', req)
  var postData = {
    appId: '2019101268311851',
    outTradeNo: '20150320010101001',
  }
  var verify = await alipaySdk.checkNotifySign(postData);
  res.send({
    result: verify,
    errorCode: 'err',
    message: '1221',
  });
});

router.get('/web/yanqian.json', async function(req, res, next) {
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
        var url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&' + 'partner=' + partner + '&notify_id=' + params['notify_id'];
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
  var postData = {
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
  var verify = await alipaySdk.checkNotifySign(postData);
  res.send({
    result: verify,
    errorCode: 'err',
    message: '1221',
  });
});

router.get('/web/query.json', async function(req, res, next) {
  var result = await alipaySdk.exec(
    'alipay.trade.query',
    {},
    { formData: formData },
  );
  res.send({
    result: verify,
    errorCode: 'err',
    message: '1221',
  });
});

// 退款
router.get('/web/refund.json', async function(req, res, next) {
  var formData = new AlipayFormData();
  formData.addField('notifyUrl', 'https://www.ushance.com/');
  formData.addField('bizContent', {
    outTradeNo: '20150320010101001', // 唯一值
    productCode: 'FAST_INSTANT_TRADE_PAY',
    totalAmount: '0.01',
    subject: '商品',
    body: '商品详情',
  });
  var result = await alipaySdk.exec(
    'alipay.trade.query',
    {},
    { formData: formData },
  );
  res.send({
    result: verify,
    errorCode: 'err',
    message: '1221',
  });
});

router.get('/web/refundQuery.json', async function(req, res, next) {
  var result = await alipaySdk.exec(
    'alipay.trade.query',
    {},
    { formData: formData },
  );
  res.send({
    result: verify,
    errorCode: 'err',
    message: '1221',
  });
});

module.exports = router;
