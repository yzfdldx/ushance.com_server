'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 支付宝 apiClient
 */

var qs = require('qs');
var lodash = require('lodash');
var moment = require('moment');
var crypto = require('crypto');

var is = {
    object: function object(obj) {
        return obj && !Array.isArray(obj) && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object";
    }
};

var isPublicKey = function isPublicKey(str) {
    return (/^-----BEGIN PUBLIC KEY-----/.test(str) && /-----END PUBLIC KEY-----$/.test(str)
    );
},
    isPrivateKey = function isPrivateKey(str) {
    return (/^-----BEGIN RSA PRIVATE KEY-----/.test(str) && /-----END RSA PRIVATE KEY-----$/.test(str)
    );
};

/**
 * 基类, 提供一些基础方法
 */

var Alipay = function () {

    /**
     * @param  {String} options.appId      应用id
     * @param  {String} options.uri        支付宝网关地址
     * @param  {String} options.publicKey  支付宝公钥
     * @param  {String} options.privateKey 支付宝私钥
     * @param  {Object} options.notifyUri  回调配置
     * @param  {String} signType           前面类型
     * @param  {String} charset            提交字符集
     */
    function Alipay(_ref) {
        var appId = _ref.appId,
            uri = _ref.uri,
            publicKey = _ref.publicKey,
            privateKey = _ref.privateKey,
            _ref$notifyUri = _ref.notifyUri,
            notifyUri = _ref$notifyUri === undefined ? {} : _ref$notifyUri,
            _ref$signType = _ref.signType,
            signType = _ref$signType === undefined ? "RSA2" : _ref$signType,
            _ref$charset = _ref.charset,
            charset = _ref$charset === undefined ? "utf-8" : _ref$charset;

        _classCallCheck(this, Alipay);

        if (!isPrivateKey(privateKey)) {
            privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' + privatekey + '\n-----END RSA PRIVATE KEY-----';
        }
        if (!isPublicKey(publicKey)) {
            publicKey = '-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n-----END PUBLIC KEY-----';
        }
        this.appId = appId;
        this.url = uri;
        this.notifyUri = notifyUri;
        this.signType = signType;
        this.publicKey = publicKey;
        this.privatekey = privateKey;
        this.charset = charset;
        this.alipay_sdk = "alipay-rwson";
        this.version = "1.0";
    }

    /**
     * 构造参数
     * @param  {Object} obj 其他参数
     * @return {Object}
     */


    _createClass(Alipay, [{
        key: 'buildParams',
        value: function buildParams() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return _extends({
                app_id: this.appId,
                charset: this.charset,
                sign_type: this.signType,
                version: this.version
            }, obj);
        }

        /**
         * 签名所需的参数key进行排序并组织进新对象
         * @param  {Object} params 签名所需的参数
         * @return {Object}
         */

    }, {
        key: 'sortParams',
        value: function sortParams(params) {
            var keys = Object.keys(params).sort(),
                res = {};
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    res[key] = params[key];
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return res;
        }

        /**
         * 签名
         * @param  {Object} params     签名所需的参数
         * @param  {String} privatekey 私钥
         * @return {Object}
         */

    }, {
        key: 'sign',
        value: function sign(params, privatekey) {
            params = this.sortParams(params);
            var sign = crypto.createSign("RSA-SHA256"),
                keys = Object.keys(params);
            var signed = [],
                signRes = void 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var key = _step2.value;

                    if (is.object(params[key])) {
                        signed.push(key + '=' + JSON.stringify(params[key]));
                    } else {
                        signed.push(key + '=' + params[key]);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            try {
                signRes = sign.update(signed.join("&")).sign(privatekey, "base64");
                params.sign = signRes;
            } catch (e) {
                params.sign = false;
            }
            return params;
        }

        /**
         * 验证签名
         * @param  {Object} body  支付宝异步通知结果
         * @return {Boolean}
         */

    }, {
        key: 'verifySign',
        value: function verifySign(body) {
            var publicKey = this.publicKey,
                bodyCloned = this.sortParams(lodash.clone(body)),
                verify = crypto.createVerify("RSA-SHA256");

            delete bodyCloned.sign;
            delete bodyCloned.sign_type;

            try {
                verify.update(signed.join("&"));
                return verify.verify(publicKey, body.sign, "base64");
            } catch (e) {
                return false;
            }
        }

        /**
         * 构造请求所需参数
         * @param  {Object} params 原数据
         * @return {Object}
         */

    }, {
        key: 'buildRequestData',
        value: function buildRequestData(params) {
            var keys = Object.keys(params);
            var cur = void 0;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var key = _step3.value;

                    cur = params[key];
                    if (is.object(cur)) {
                        params[key] = JSON.stringify(cur);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return {
                param: qs.stringify(params, {
                    encoder: encodeURIComponent
                }),
                bizContent: params.biz_content
            };
        }

        /**
         * 构建扫码支付表单
         * @param  {String} options.url        提交地址
         * @param  {String} options.param      公共参数urlQueryString
         * @param  {Object} options.bizContent 业务参数
         * @return {String}
         */

    }, {
        key: 'buildRequestForm',
        value: function buildRequestForm(_ref2) {
            var url = _ref2.url,
                param = _ref2.param,
                bizContent = _ref2.bizContent;

            var form = [];
            form.push('<form id=\'pay\' name=\'pay\' action=\'' + url + '?' + param + '\' method=\'post\'>');
            form.push('<input type=\'hidden\' name=\'biz_content\' value=\'' + JSON.stringify(bizContent) + '\' />');
            form.push("</form>");
            form.push("<script>document.forms['pay'].submit();</script>");
            return form.join("");
        }
    }]);

    return Alipay;
}();

var AliPayClient = function (_Alipay) {
    _inherits(AliPayClient, _Alipay);

    function AliPayClient(argus) {
        _classCallCheck(this, AliPayClient);

        return _possibleConstructorReturn(this, (AliPayClient.__proto__ || Object.getPrototypeOf(AliPayClient)).call(this, argus));
    }

    /**
     * 下单并购买
     * @param  {Number} options.outTradeNo  内部订单号
     * @param  {String} options.subject     订单标题
     * @param  {Object} options.body        订单描述
     * @param  {Number} options.productCode 产品编码
     * @param  {Number} options.totalAmount 订单总价
     * @return {Form String}
     */


    _createClass(AliPayClient, [{
        key: 'pay',
        value: function pay(_ref3) {
            var outTradeNo = _ref3.outTradeNo,
                subject = _ref3.subject,
                _ref3$body = _ref3.body,
                body = _ref3$body === undefined ? "" : _ref3$body,
                _ref3$productCode = _ref3.productCode,
                productCode = _ref3$productCode === undefined ? "FAST_INSTANT_TRADE_PAY" : _ref3$productCode,
                totalAmount = _ref3.totalAmount;
            var url = this.url,
                method = "alipay.trade.page.pay",
                bizContent = {
                out_trade_no: outTradeNo,
                product_code: productCode,
                total_amount: totalAmount,
                subject: subject,
                body: body
            },
                params = this.buildRequestData(this.sign(this.buildParams({
                return_url: this.notifyUri.sync,
                notify_url: this.notifyUri.async,
                biz_content: JSON.stringify(bizContent),
                timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
                method: method
            }), this.privatekey)),
                form = this.buildRequestForm(_extends({
                url: this.url
            }, params));

            return form;
        }
    }]);

    return AliPayClient;
}(Alipay);

module.exports = AliPayClient;