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

//签名
function getSign(params) {
  try {
      //读取秘钥
      var privatePem = fs.readFileSync('./app_private_key.pem');
      var key = privatePem.toString();
      var prestr = getParams(params)
      var sign = crypto.createSign('RSA-SHA1');
      sign.update(prestr);
      sign = sign.sign(key, 'base64');
      return encodeURIComponent(sign)
  } catch(err) {
      console.log('err', err)
  }
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

//验签
function veriySign(params) {
  try {
      var publicPem = fs.readFileSync('./rsa_public_key.pem');
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

var unionPay = {
  //发送订单号
  sendAlipay: function(req, res) {
    var code = ""
    for(var i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }

    //订单号暂时由时间戳与四位随机码生成
    AlipayConfig.out_trade_no = Date.now().toString() + code;
    var myParam = getParams(AlipayConfig);
    var mySign = getSign(AlipayConfig)
    var last = myParam + '&sign="' + mySign + '"&sign_type="RSA"';
    console.log(last)
    return res.send(last)
  },
  //回调验签
  getAlipay: function(req, res) {
    console.log(req.body)
    var params = req.body
    var mysign = veriySign(params);
    //验证支付宝签名mysign为true表示签名正确
    console.log(mysign)
    try {
      //验签成功
      if(mysign) {
        if(params['notify_id']) {
          var partner = AlipayConfig.partner;
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
  }
}

module.exports = unionPay;