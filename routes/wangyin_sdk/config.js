

const config = {
  merId: '777290058136713',   //商户id
  font_trans_url: 'https://101.231.204.80:5000/gateway/api/frontTransReq.do',     //网关跳转至银联平台支付页面地址
  sigle_query_url: 'https://101.231.204.80:5000/gateway/api/queryTrans.do',       //单笔查询请求地址
  sign_cert_dir: __dirname + '/certificates', //签名证书路径
  certId: '40220995861346480087409489142384722381',
  sign_cert_pwd: '0000000',   //签名证书密码
  sign_cert_path: __dirname + '/certificates/700000000000001_acp.pfx',    //签名用私钥证书
  validate_cert_path: __dirname + '/certificates/verify_sign_acp.cer',    //验签用银联公钥证书
}

module.exports = config;