'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
  alipayPublicKey: fs.readFileSync('./public/ssl/zfb/public-key.pem', 'ascii') // 支付宝公钥
});
// console.log(21)

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

//将支付宝发来的数据生成有序数列
function getVerifyParams(params) {
  var sPara = [];
  if (!params) return null;
  for (var key in params) {
    if (!params[key] || key == "sign" || key == "sign_type") {
      continue;
    };
    sPara.push([key, params[key]]);
  }
  sPara = sPara.sort();
  var prestr = '';
  for (var i2 = 0; i2 < sPara.length; i2++) {
    var obj = sPara[i2];
    if (i2 == sPara.length - 1) {
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
    return verify.verify(publicKey, sign, 'base64');
  } catch (err) {
    console.log('veriSign err', err);
  }
}

var partner = '';

/* GET */
router.get('/web/pay.json', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res, next) {
    var query, _formData, result;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            partner = '';
            _context.prev = 1;
            query = req.query;

            if (!checkFn(['id', 'price', 'name', 'describe'], query, res)) {
              _context.next = 12;
              break;
            }

            _formData = new AlipayFormData();

            partner = query.id, _formData.setMethod('get');
            _formData.addField('notifyUrl', 'https://www.ushance.com/zfb_sdk/web/yanqian.json');
            _formData.addField('bizContent', {
              outTradeNo: query.id, // 唯一值
              productCode: 'FAST_INSTANT_TRADE_PAY',
              totalAmount: query.price,
              subject: query.name,
              body: query.describe
            });
            _context.next = 10;
            return alipaySdk.exec('alipay.trade.page.pay', {}, { formData: _formData });

          case 10:
            result = _context.sent;

            res.send({
              result: result,
              errorCode: 200,
              message: ''
            });

          case 12:
            _context.next = 17;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context['catch'](1);

            res.send({
              result: null,
              errorCode: 'err',
              message: '代码出错了'
            });

          case 17:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 14]]);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());

router.post('/web/yanqian2.json', function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res, next) {
    var postData, verify;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // res.send({
            //   result: req,
            //   errorCode: 200,
            //   message: 'ok',
            // });
            console.log('yanqian.json', req);
            postData = {
              appId: '2019101268311851',
              outTradeNo: '20150320010101001'
            };
            _context2.next = 4;
            return alipaySdk.checkNotifySign(postData);

          case 4:
            verify = _context2.sent;

            res.send({
              result: verify,
              errorCode: 'err',
              message: '1221'
            });

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());

router.get('/web/yanqian.json', function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res, next) {
    var params, mysign, url;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log(req.body);
            params = req.body;
            mysign = veriySign(params);
            //验证支付宝签名mysign为true表示签名正确

            console.log(mysign);
            try {
              //验签成功
              if (mysign) {
                if (params['notify_id']) {
                  //生成验证支付宝通知的url
                  url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&' + 'partner=' + partner + '&notify_id=' + params['notify_id'];

                  console.log('url:' + url);
                  //验证是否是支付宝发来的通知
                  https.get(url, function (text) {
                    //有数据表示是由支付宝发来的通知
                    if (text) {
                      //交易成功
                      console.log('success');
                    } else {
                      //交易失败
                      console.log('err');
                    }
                  });
                }
              }
            } catch (err) {
              console.log(err);
            }

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());

router.get('/web/okPay.json', function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res, next) {
    var postData, verify;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            postData = {
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
            };
            _context4.next = 3;
            return alipaySdk.checkNotifySign(postData);

          case 3:
            verify = _context4.sent;

            res.send({
              result: verify,
              errorCode: 'err',
              message: '1221'
            });

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}());

router.get('/web/query.json', function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res, next) {
    var result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return alipaySdk.exec('alipay.trade.query', {}, { formData: formData });

          case 2:
            result = _context5.sent;

            res.send({
              result: verify,
              errorCode: 'err',
              message: '1221'
            });

          case 4:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function (_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}());

// 退款
router.get('/web/refund.json', function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res, next) {
    var formData, result;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            formData = new AlipayFormData();

            formData.addField('notifyUrl', 'https://www.ushance.com/');
            formData.addField('bizContent', {
              outTradeNo: '20150320010101001', // 唯一值
              productCode: 'FAST_INSTANT_TRADE_PAY',
              totalAmount: '0.01',
              subject: '商品',
              body: '商品详情'
            });
            _context6.next = 5;
            return alipaySdk.exec('alipay.trade.query', {}, { formData: formData });

          case 5:
            result = _context6.sent;

            res.send({
              result: verify,
              errorCode: 'err',
              message: '1221'
            });

          case 7:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}());

router.get('/web/refundQuery.json', function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(req, res, next) {
    var result;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return alipaySdk.exec('alipay.trade.query', {}, { formData: formData });

          case 2:
            result = _context7.sent;

            res.send({
              result: verify,
              errorCode: 'err',
              message: '1221'
            });

          case 4:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function (_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}());

module.exports = router;