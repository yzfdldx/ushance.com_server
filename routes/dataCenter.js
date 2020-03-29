var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dataCenter', { title: 'YOU 闪测' });
});

module.exports = router;
