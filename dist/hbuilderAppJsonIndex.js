'use strict';

var express = require('express');
var router = express.Router();

router.all('*', function (req, res, next) {
  // 跨域
  res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With, XMLHttpRequest");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("X-Powered-By", ' 3.2.1');
  if (req.method == "OPTIONS") res.send(200); /*让options请求快速返回*/
  else next();
});
/* GET home page. */
router.get('/index/carousel.json', function (req, res, next) {
  // console.log(req.query)
  // console.log(req.body)
  res.send({
    code: 200,
    data: [{
      src: 'https://zos.alipayobjects.com/rmsportal/AiyWuByWklrrUDlFignR.png',
      url: ''
    }, {
      src: 'https://zos.alipayobjects.com/rmsportal/TekJlZRVCjLFexlOCuWn.png',
      url: ''
    }]
  });
});
router.get('/index/menu.json', function (req, res, next) {
  // console.log(req.query)
  // console.log(req.body)
  res.send({
    code: 200,
    data: [{
      src: 'https://gw.alipayobjects.com/zos/rmsportal/mpznZBricmNRduKPLrhg.png',
      url: 'https://www.tmall.com',
      text: '天猫'
    }, {
      src: 'https://gw.alipayobjects.com/zos/rmsportal/tPEvADKuMefcSPXqWlak.png',
      url: 'https://www.taobao.com/',
      text: '淘宝'
    }, {
      src: 'https://gw.alipayobjects.com/zos/rmsportal/hBzHzRogeucPUIzftxJx.png',
      url: 'https://www.jd.com/',
      text: '京东'
    }, {
      src: 'https://gw.alipayobjects.com/zos/rmsportal/JYzEnDxGuRPoBLydmFud.png',
      url: 'https://www.baidu.com/',
      text: '百度'
    }]
  });
});
router.get('/index/card.json', function (req, res, next) {
  // console.log(req.query)
  // console.log(req.body)
  res.send({
    code: 200,
    data: [{
      src: 'https://gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png',
      url: '',
      title: '1221',
      text: 'wedwevv'
    }, {
      src: 'https://gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png',
      url: '',
      title: '212',
      text: 'ccdscd d c'
    }, {
      src: 'https://gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png',
      url: '',
      title: '1221',
      text: 'wedwevv'
    }, {
      src: 'https://gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png',
      url: '',
      title: '212',
      text: 'ccdscd d c'
    }]
  });
});
router.get('/', function (req, res, next) {
  res.send({ title: 'Express' });
});

module.exports = router;