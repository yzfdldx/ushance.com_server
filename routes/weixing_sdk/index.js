var express = require('express');
var router = express.Router();
var AlipaySdk = require('alipay-sdk').default;
var AlipayFormData = require('alipay-sdk/lib/form').default;
var https = require('https');
var fs = require('fs');
var os = require('os');

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

/* GET */
// 微信支付
const tenpay = require('tenpay');
const config = {
  appid: 'wx31555a0999f1af84',
  mchid: '1558987061',
  partnerKey: 'lgyyzf1234lgyyzf1234lgyyzf123473',
  // pfx: require('fs').readFileSync('证书文件路径'),
  notify_url: 'https://www.ushance.com/weixing_sdk/web/yanqian.json',
  // spbill_create_ip: 'IP地址'
};
const api = new tenpay(config, true);
var qr = require('qr-image');

router.get('/web/pay.json', async function(req, res, next) {
  try {
    // const query = req.query;
    const params = {
      nonce_str: '5K8264ILsKCH16CQ2202SI8ZNMTM67VS',
      // spbill_create_ip: '127.0.0.1',
      out_trade_no: 'yzf_1017183444',
      body: '商品简单描述',
      total_fee: '1',
      // openid: '20191214',
      trade_type: 'NATIVE',
      product_id: '商品id'
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
    let result = await api.orderQuery({ // unifiedOrder getNativeUrl
      out_trade_no: 'yzf_1017183444',
    });
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
    console.log(1111)
    let result = await api.refund({
      // transaction_id, out_trade_no 二选一
      // transaction_id: '4200000438201912143497771095',
      // out_trade_no: 'yzf_1017183444',
      out_refund_no: '1121221',
      total_fee: '1',
      refund_fee: '1'
    });
    // let result = await api.refund({
    //   // transaction_id, out_trade_no 二选一
    //   // transaction_id: '4200000438201912143497771095',
    //   out_trade_no: 'yzf_1017183444',
    //   out_refund_no: 'yzf_1017183444_1214',
    //   total_fee: '1',
    //   refund_fee: '1'
    // });
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

function rand(min,max) {
  return Math.floor(Math.random()*(max-min))+min;
}


module.exports = router;
