'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var crypto = require('crypto');

var ALI_PAY_SETTINGS = {
    APP_ID: '2019101268311851',
    APP_GATEWAY_URL: 'xxxxxxx', //用于接收支付宝异步通知
    AUTH_REDIRECT_URL: 'xxxxxxx', //第三方授权或用户信息授权后回调地址。授权链接中配置的redirect_uri的值必须与此值保持一致。
    APP_PRIVATE_KEY_PATH: './public/ssl/zfb/private-key.pem', //应用私钥
    APP_PUBLIC_KEY_PATH: './public/ssl/zfb/private-public-key.pem', //应用公钥
    ALI_PUBLIC_KEY_PATH: './public/ssl/zfb/public-key.pem', //阿里公钥
    AES_PATH: path.join(__dirname, 'pem', 'remind', 'sandbox', 'aes.txt') //aes加密（暂未使用）
};

var AliPayHelper = function () {
    /**
     * 构造方法
     * @param accountType   用于以后区分多支付账号
     */
    function AliPayHelper(accountType) {
        _classCallCheck(this, AliPayHelper);

        this.accountType = accountType;
        this.accountSettings = ALI_PAY_SETTINGS;
    }

    /**
     * 构建app支付需要的参数
     * @param subject       商品名称
     * @param outTradeNo    自己公司的订单号
     * @param totalAmount   金额
     * @returns {string}
     */


    _createClass(AliPayHelper, [{
        key: 'buildParams',
        value: function buildParams(subject, outTradeNo, totalAmount) {
            var params = new Map();
            params.set('app_id', this.accountSettings.APP_ID);
            params.set('method', 'alipay.trade.app.pay');
            params.set('charset', 'utf-8');
            params.set('sign_type', 'RSA2');
            params.set('timestamp', moment().format('YYYY-MM-DD HH:mm:ss'));
            params.set('version', '1.0');
            params.set('notify_url', this.accountSettings.APP_GATEWAY_URL);
            params.set('biz_content', this._buildBizContent(subject, outTradeNo, totalAmount));
            params.set('sign', this._buildSign(params));

            return [].concat(_toConsumableArray(params)).map(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    k = _ref2[0],
                    v = _ref2[1];

                return k + '=' + encodeURIComponent(v);
            }).join('&');
        }

        /**
         * 根据参数构建签名
         * @param paramsMap    Map对象
         * @returns {number|PromiseLike<ArrayBuffer>}
         * @private
         */

    }, {
        key: '_buildSign',
        value: function _buildSign(paramsMap) {
            //1.获取所有请求参数，不包括字节类型参数，如文件、字节流，剔除sign字段，剔除值为空的参数
            var paramsList = [].concat(_toConsumableArray(paramsMap)).filter(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    k1 = _ref4[0],
                    v1 = _ref4[1];

                return k1 !== 'sign' && v1;
            });
            //2.按照字符的键值ASCII码递增排序
            paramsList.sort();
            //3.组合成“参数=参数值”的格式，并且把这些参数用&字符连接起来
            var paramsString = paramsList.map(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    k = _ref6[0],
                    v = _ref6[1];

                return k + '=' + v;
            }).join('&');

            var privateKey = fs.readFileSync(this.accountSettings.APP_PRIVATE_KEY_PATH, 'utf8');
            var signType = paramsMap.get('sign_type');
            return this._signWithPrivateKey(signType, paramsString, privateKey);
        }

        /**
         * 通过私钥给字符串签名
         * @param signType      返回参数的签名类型：RSA2或RSA
         * @param content       需要加密的字符串
         * @param privateKey    私钥
         * @returns {number | PromiseLike<ArrayBuffer>}
         * @private
         */

    }, {
        key: '_signWithPrivateKey',
        value: function _signWithPrivateKey(signType, content, privateKey) {
            var sign = void 0;
            if (signType.toUpperCase() === 'RSA2') {
                sign = crypto.createSign("RSA-SHA256");
            } else if (signType.toUpperCase() === 'RSA') {
                sign = crypto.createSign("RSA-SHA1");
            } else {
                throw new Error('请传入正确的签名方式，signType：' + signType);
            }
            sign.update(content);
            return sign.sign(privateKey, 'base64');
        }

        /**
         * 生成业务请求参数的集合
         * @param subject       商品的标题/交易标题/订单标题/订单关键字等。
         * @param outTradeNo    商户网站唯一订单号
         * @param totalAmount   订单总金额，单位为元，精确到小数点后两位，取值范围[0.01,100000000]
         * @returns {string}    json字符串
         * @private
         */

    }, {
        key: '_buildBizContent',
        value: function _buildBizContent(subject, outTradeNo, totalAmount) {
            var bizContent = {
                subject: subject,
                out_trade_no: outTradeNo,
                total_amount: totalAmount,
                product_code: 'QUICK_MSECURITY_PAY'
            };

            return JSON.stringify(bizContent);
        }

        /**
         * 验证支付宝异步通知的合法性
         * @param params  支付宝异步通知结果的参数
         * @returns {*}
         */

    }, {
        key: 'verifySign',
        value: function verifySign(params) {
            try {
                var sign = params['sign']; //签名
                var signType = params['sign_type']; //签名类型
                var paramsMap = new Map();
                for (var key in params) {
                    paramsMap.set(key, params[key]);
                }
                var paramsList = [].concat(_toConsumableArray(paramsMap)).filter(function (_ref7) {
                    var _ref8 = _slicedToArray(_ref7, 2),
                        k1 = _ref8[0],
                        v1 = _ref8[1];

                    return k1 !== 'sign' && k1 !== 'sign_type' && v1;
                });
                //2.按照字符的键值ASCII码递增排序
                paramsList.sort();
                //3.组合成“参数=参数值”的格式，并且把这些参数用&字符连接起来
                var paramsString = paramsList.map(function (_ref9) {
                    var _ref10 = _slicedToArray(_ref9, 2),
                        k = _ref10[0],
                        v = _ref10[1];

                    return k + '=' + decodeURIComponent(v);
                }).join('&');
                var publicKey = fs.readFileSync(this.accountSettings.ALI_PUBLIC_KEY_PATH, 'utf8');
                return this._verifyWithPublicKey(signType, sign, paramsString, publicKey);
            } catch (e) {
                console.error(e);
                return false;
            }
        }

        /**
         * 验证签名
         * @param signType      返回参数的签名类型：RSA2或RSA
         * @param sign          返回参数的签名
         * @param content       参数组成的待验签串
         * @param publicKey     支付宝公钥
         * @returns {*}         是否验证成功
         * @private
         */

    }, {
        key: '_verifyWithPublicKey',
        value: function _verifyWithPublicKey(signType, sign, content, publicKey) {
            try {
                var verify = void 0;
                if (signType.toUpperCase() === 'RSA2') {
                    verify = crypto.createVerify('RSA-SHA256');
                } else if (signType.toUpperCase() === 'RSA') {
                    verify = crypto.createVerify('RSA-SHA1');
                } else {
                    throw new Error('未知signType：' + signType);
                }
                verify.update(content);
                return verify.verify(publicKey, sign, 'base64');
            } catch (err) {
                console.error(err);
                return false;
            }
        }
    }]);

    return AliPayHelper;
}();

module.exports = AliPayHelper;