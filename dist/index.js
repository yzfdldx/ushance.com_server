'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
  // const file = require('../dist/index.html');
  // res.sendfile(file)
  // res.send('32')
  // res.render('app');
});

module.exports = router;