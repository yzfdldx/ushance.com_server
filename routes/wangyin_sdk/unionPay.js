var validator = require('validator');
var util = require('util');
var _ = require('underscore');
var crypto = require('crypto');
// var x509 = require('x509');
var sha1 = require('sha1');
// var wopenssl = require('wopenssl');
var config = require('./config'); //加载银联配置

//银联网关支付
var unionPay = {
  //创建预订单
  /*
  * 参数 parms: {out_trade_no: OUT_TRADE_NO, fee: FEE}
  * out_trade_no 商户订单号    fee 订单金额，单位分
  */
  sdk_front_notice_url: 'http://'+ config.domain +'/unionPay/result', //银联网关支付前台通知地址
  sdk_back_notic_url: 'http://'+ config.domain +'/unionPay/productPay',       //银联网关支付后台通知地址

  createOrder:function(parms, callback) {
    var errmsg;
    var timeStamp = parms.timeStamp;

    if(parms.payType==0) {
        var back_notic_url = 'http://'+ config.domain +'/unionPay/productPay';
    } else if(parms.payType==1) {
        var back_notic_url = 'http://'+ config.domain +'/unionPay/rechargePay';
    } else {
        var back_notic_url = this.sdk_back_notic_url;
    }

    var formData = {
      'version' : '5.0.0',                 //版本号
      'encoding' : 'utf-8',                 //编码方式
      'txnType' : '01',                     //交易类型
      'txnSubType' : '01',                  //交易子类
      'bizType' : '000201',                 //业务类型
      'frontUrl' :  this.sdk_front_notice_url,    //前台通知地址
      'signMethod' : '01',                  //签名方法
      'channelType' : '08',                 //渠道类型，07-PC，08-手机
      'accessType' : '0',               //接入类型
      'currencyCode' : '156',           //交易币种，境内商户固定156

      //TODO 以下信息需要填写
      'merId' : config.merId,     //商户代码，请改自己的测试商户号，此处默认取demo演示页面传递的参数
      'orderId' : parms.out_trade_no, //商户订单号，8-32位数字字母，不能含“-”或“_”，此处默认取demo演示页面传递的参数，可以自行定制规则
      'txnTime' : timeStamp,  //订单发送时间timestamp，格式为YYYYMMDDhhmmss，取北京时间，此处默认取demo演示页面传递的参数
      'txnAmt' : parms.fee,   //交易金额，单位分
      'backUrl' : back_notic_url,   //后台通知地址
      'certId' : ''   //可不必填写，在SignKeyFromPfx中返回
    };

    var privateKey;
    var certId;
    var cert;

    SignKeyFromPfx(function(err , result){
      if (err) {
        errmsg = '证书签名失败';
      } else {                    
        certId = result.certId;
        privateKey = result.key;

        formData.certId = certId;

        if (formData.signature) {
            delete formData.signature
        }
        //----签名开始----

        //参数转变为签名串
        var unionPay_parms = transForSign(formData);

        //摘要
        var unionPay_parms_sha1 = sha1(unionPay_parms);

        //签名
        var signer = crypto.createSign('RSA-SHA1');
        signer.update(unionPay_parms_sha1);
        var signature_base64 = signer.sign(privateKey, 'base64');

        //放入域中
        formData.signature = signature_base64;

        //加入表单请求银联的地址
        formData.action_url = config.font_trans_url;

        //console.log(formData);

        if (errmsg) {
            callback(errmsg);
        } else {
            callback(null,formData);
        }
      }
    });
  },

  //签名
  sign: function(parms, callback) {
    var errmsg;
    var formData = parms;

    SignKeyFromPfx(function(err , result){
      if (err) {
        errmsg = '证书签名失败';
      } else {                    
        certId = result.certId;
        privateKey = result.key;


        if (formData.signature) {
            delete formData.signature
        }
        //----签名开始----

        //参数转变为签名串
        var unionPay_parms = transForSign(formData);

        //摘要
        var unionPay_parms_sha1 = sha1(unionPay_parms);

        //签名
        var signer = crypto.createSign('RSA-SHA1');
        signer.update(unionPay_parms_sha1);
        var signature_base64 = signer.sign(privateKey, 'base64');

        //放入域中
        formData.signature = signature_base64;

        //console.log(formData);

        if (errmsg) {
            callback(errmsg);
        } else {
            callback(null,formData);
        }
      }
    });
  },

  //验签
  validate: function(parms,callback) {
    var validate_signature = parms.signature;
    delete parms.signature;
    var formData = parms;

    ValidateKeyFromCer(formData,validate_signature,function(err , result){
      if (err || !validate_signature || !formData) {
        console.log('验签失败');
        callback('验签失败');
      } else {                    
        var publicKey = result.key;


        if (formData.signature) {
            delete formData.signature
        }
        //----验签开始----
        var unionPay_parms = transForSign(formData);
        var unionPay_parms_sha1 = sha1(unionPay_parms);

        //console.log('待验证签：' + validate_signature);

        var verifier = crypto.createVerify('RSA-SHA1');
        //console.log('验证签名public key:\n' + publicKey);
        //console.log('验证签名src_sign:' + unionPay_parms_sha1);
        verifier.update(new Buffer(unionPay_parms_sha1, 'utf-8'));
        var is_success = verifier.verify(publicKey, validate_signature, 'base64');

        if (is_success) {
            callback(null,formData);
        } else {
            console.log('验签不相等');
            callback('验签不相等');
        }
      }
    });
  }
};

// 签名串算法--将参数排序，转成键值对格式字符串
function transForSign(params){
  var array = []
  for (var i in params) {
      array.push('' + i + '=' + params[i])
  }
  var stringSignTemp = _.sortBy(array, function (str) {
      return str;
  });

  return stringSignTemp.join('&');
};

//通过证书密码获得证书的rsa-privatekey值和证书Id
function SignKeyFromPfx(callback){
  if (config.certsData) {
    callback(null, config.certsData);
  } else {
    var certPath = config.sign_cert_path;
    var certPwd = config.sign_cert_pwd;
    var certDir = config.sign_cert_dir;

    // var p12 = wopenssl.pkcs12.extract(certPath, certPwd);
    //console.log(p12.certificate); //p12.certificate和p12.rsa

    // var certs = wopenssl.x509.parseCert(p12.certificate);
    var certs = p12.certificate;

    //因为不知道怎么将十六进制证书id:certs.serial变成十进制证书id，因为这是个很大的整形biglong
    var certsData = {};
    certsData.certId = config.certId;
    certsData.key = p12.rsa;
    certsData.ca = certs;

    //存入config
    config.certsData = certsData;

    callback(null,certsData);   //{key: String, certId: String, ca: Array}
  }
};

//获得验签证书的rsa-publickey值
function ValidateKeyFromCer(formData, signature, callback){
  if (config.validCertsData) {
    callback(null, config.validCertsData);
  } else {
    var validateCertPath = config.validate_cert_path;
    // var certs = wopenssl.x509.parseCert(validateCertPath);
    var certs = validateCertPath;
    //console.log(certs);
    var fs = require('fs');
    var CERTIFICATE = fs.readFileSync(validateCertPath);
    console.log(CERTIFICATE);
    var publicKey = CERTIFICATE.toString('ascii');
    var validCertsData = {};
    validCertsData.key = publicKey;
    validCertsData.cert = CERTIFICATE;
    config.validCertsData = validCertsData;
    if (publicKey) {
        callback(null,validCertsData);
    } else {
        msg = '验签失败';
        callback(msg);
    }
  }
};

//转化时间格式函数
function format(){
  //时间格式化
  var format = 'yyyyMMddhhmmss';
  date = new Date();
  var o = {
    'M+' : date.getMonth() + 1, //month
    'd+' : date.getDate(), //day
    'h+' : date.getHours(), //hour
    'm+' : date.getMinutes(), //minute
    's+' : date.getSeconds(), //second
    'q+' : Math.floor((date.getMonth() + 3) / 3), //quarter
    'S' : date.getMilliseconds() //millisecond
  };
  if (/(y+)/.test(format))
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));

  for (var k in o)
      if (new RegExp('(' + k + ')').test(format))
          format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));

  return format;
};

module.exports = unionPay;