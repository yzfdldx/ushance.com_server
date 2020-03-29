var express = require('express');
var router = express.Router();
const {
  DFormat,
  checkFn,
  checkAddLink, checkLink, MQ
} = require('../common.js');

// 我的简历
router.get('/get_my_resume.json', function(req, res, next) {
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + 'USE_ID, USE_NAME, USE_EMAIL, head, phone' + ' from ' + 'my_web.USE' + ' where ' + `USE_ID = "${query.id}"`;
      if (MQ(select, (result) => {
        if (result[0]) {
          var select2 = 'select ' + '*' + ' from ' + 'my_web.resume' + ' where ' + `use_id = "${query.id}"`;
          if (MQ(select2, (result2) => {
            if (result2) {
              res.send({
                result: 'succeed',
                data: {
                  ...result[0],
                  resume: result2
                },
              });
            } else {
              res.send({
                result: 'succeed',
                data: {
                  ...result[0],
                  resume: []
                },
              });
            }
          }, (err) => {
            res.send({
              result: 'error',
              errorCode: err,
              message: '数据库错误',
            });
          })) {
            res.send({
              result: 'error',
              message: 'MQ未知错误',
            });
          }
        } else {
          res.send({
            result: 'error',
            message: '没有该用户',
          });
        }
      }, (err) => {
        res.send({
          result: 'error',
          errorCode: err,
          message: '数据库错误',
        });
      })) {
        res.send({
          result: 'error',
          message: 'MQ未知错误',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
// 其它人的简历公开审核通过的
router.get('/get_other_resume.json', function(req, res, next) {
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.resume' + ' where ' + `use_id != "${query.id}" and ok = 1 and visible = 1`;
      if (MQ(select, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result,
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      }, (err) => {
        res.send({
          result: 'error',
          errorCode: err,
          message: '数据库错误',
        });
      })) {
        res.send({
          result: 'error',
          message: 'MQ未知错误',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.get('/get_resume.json', function(req, res, next) {
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select2 = 'select ' + '*' + ' from ' + 'my_web.resume' + ' where ' + `id = "${query.id}"`;
      if (MQ(select2, (result2) => {
        if (result2) {
          res.send({
            result: 'succeed',
            data: result2[0],
          });
        } else {
          res.send({
            result: 'succeed',
            data: {},
          });
        }
      }, (err) => {
        res.send({
          result: 'error',
          errorCode: err,
          message: '数据库错误',
        });
      })) {
        res.send({
          result: 'error',
          message: 'MQ未知错误',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 新增简历
router.post('/add.json', function(req, res, next) {
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['use_id', 'name'], query, res)) {
      const Time = DFormat();
      var Arr = [
        {
          key: 'use_id',
          default: '',
          defaultSet: false,
          hidden: false
        },
        {
          key: 'name',
          default: '',
          defaultSet: false,
          hidden: false
        },
        {
          key: 'tag',
          default: null,
          defaultSet: false,
          hidden: false
        },
        {
          key: 'type',
          default: '',
        },
        {
          key: 'deal',
          default: 0,
          defaultSet: true,
        },
        {
          key: 'deal_rate',
          default: 0,
          defaultSet: true,
        },
        {
          key: 'praise_rate',
          default: 0,
          defaultSet: true,
        },
        {
          key: 'message',
          default: '',
          defaultSet: false,
        },
        {
          key: 'address',
          default: '',
          defaultSet: false,
        },
        {
          key: 'program',
          default: '',
          defaultSet: false,
        },
        {
          key: 'visible',
          default: '1',
          defaultSet: true,
        },
        {
          key: 'word_url',
          default: '',
          defaultSet: false,
        },
        {
          key: 'create_time',
          default: Time,
          defaultSet: true,
        },
        {
          key: 'edit_time',
          default: Time,
          defaultSet: true,
        }
      ]
      let str = checkAddLink(Arr, query);
      var select2 = `INSERT INTO my_web.resume ` + str;
      if (MQ(select2, (result) => {
        res.send({
          result: 'succeed',
          data: result,
        });
      }, (err) => {
        res.send({
          result: 'error',
          errorCode: err,
          message: '数据库错误',
        });
      })) {
        res.send({
          result: 'error',
          message: 'MQ未知错误',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

router.post('/edit.json', function(req, res, next) { // 编辑 - ok
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      const Time = DFormat();
      var Arr = [
        'name',
        'tag',
        'type',
        'deal',
        'deal_rate',
        'praise_rate',
        'message',
        'address',
        'program',
        'visible',
        'word_url',
        'ok',
      ]
      let str = checkLink(Arr, query);
      str += str ? `, edit_time = '${Time}'` : `edit_time = '${Time}'`
      var select = `update my_web.resume set ` +
      str +
      ` where id = ${query.id}`;
      if (MQ(select, (result) => {
        res.send({
          result: 'succeed',
          data: result,
        });
      }, (err) => {
        res.send({
          result: 'error',
          errorCode: err,
          message: '数据库错误',
        });
      })) {
        res.send({
          result: 'error',
          message: 'MQ未知错误',
        });
      }
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

module.exports = router;
