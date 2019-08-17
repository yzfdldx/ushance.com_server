var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('xiaoshuo/index', { title: 'Express', name: 'admin' });
});
router.get('/admin.html', function(req, res, next) {
  res.render('xiaoshuo/index', { title: 'Express', name: 'admin' });
});

router.get('/search.html', function(req, res, next) {
  res.render('xiaoshuo/index', { title: 'Express', name: 'search' });
});

router.get('/details.html', function(req, res, next) {
  res.render('xiaoshuo/index', { title: 'Express', name: 'details' });
});

router.get('/preview.html', function(req, res, next) {
  res.render('xiaoshuo/index', { title: 'Express', name: 'preview' });
});

module.exports = router;
