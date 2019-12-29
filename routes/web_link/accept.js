var express = require('express');
var router = express.Router();
const City = require('./city.js');
var mysql      = require('mysql');
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

const checkLink = (e, query) => {
  var str = '';
  if (query && e) {
    e.forEach(i => {
      if (query[i]) {
        str += str ? `, ${i} = '${query[i]}'` : `${i} = '${query[i]}'`
      }
    });
  }
}

var host = {
  host: '39.100.225.94', // 149.129.177.101
  port: 3306,
  database: 'my_web', // 数据库
  user: 'yzflhez',
  password: 'Yzf-1234',
}

function rand(min,max) {
  return Math.floor(Math.random()*(max-min))+min;
}

// 查看发单
router.get('/queryAll.json', async (req, res, next) => { // 查看除自己的全部
  try {
    // const query = req.body;
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.other_order' + ' where ' + `who_user_id != "${query.id}"`
      connection.query(select, function(err, rows, fields) {
        if (!err) {
          res.send({
            data: rows,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: err,
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

router.get('/queryById.json', async (req, res, next) => { // 查看自己的
  try {
    // const query = req.body;
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.other_order' + ' where ' + `who_user_id = "${query.id}"`
      connection.query(select, function(err, rows, fields) {
        if (!err) {
          res.send({
            data: rows,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: err,
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

// 查看接单
router.get('/query_accept.json', async (req, res, next) => { // 查看自己的
  try {
    // const query = req.body;
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.other_order' + ' where ' + `accept_id = "${query.id}"`
      connection.query(select, function(err, rows, fields) {
        if (!err) {
          res.send({
            data: rows,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: err,
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

// 发布新单
router.get('/add.json', async (req, res, next) => { // 查看自己的
  try {
    // const query = req.body;
    const query = req.query;
    if (checkFn(['who_user_id', 'who_user_name', 'who_user_pay_type', 'test_need', 'test_price'], query, res)) {
      var connection = mysql.createConnection(host);
      connection.connect();
      const time = DFormat();
      var select = `INSERT INTO my_web.other_order (` +
        `who_user_id, who_user_name, who_user_grade, who_user_subject, who_user_pay_type, who_user_pay, who_user_pay_data,`+
        ` test_time, test_gender, test_subject, test_need, test_price, CREATE_DATE` +
        `) VALUES ( ` +
        `'${query.who_user_id ? query.who_user_id : ''}', ` +
        `'${query.who_user_name ? query.who_user_name : ''}', '${query.who_user_grade ? query.who_user_grade : ''}', ` +
        `'${query.who_user_subject ? query.who_user_subject : ''}', '${Item.who_user_pay_type ? Item.who_user_pay_type : ''}', ` +
        `'${Item.who_user_pay ? Item.who_user_pay : ''}', '${Item.who_user_pay_data ? Item.who_user_pay_data : ''}', ` +
        `'${query.test_time ? query.test_time : ''}', '${query.test_gender ? query.test_gender : ''}', ` +
        `'${query.test_subject ? query.test_subject : ''}', '${query.test_need ? query.test_need : ''}', ` +
        `'${query.test_price ? query.test_price : 0}', ` +
        `'${time}')`;
      connection.query(select, function(err, rows, fields) {
        if (!err) {
          res.send({
            data: rows,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: err,
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

// 编辑单子
router.get('/edit.json', async (req, res, next) => { // 查看自己的
  try {
    // const query = req.body;
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = mysql.createConnection(host);
      connection.connect();
      var Arr = [
        'who_user_grade',
        'who_user_subject',
        'who_user_pay_type',
        'who_user_pay',
        'who_user_pay_data',
        'test_time',
        'test_gender',
        'test_subject',
        'test_need',
        'test_price',
        'accept_id',
        'accept_name',
        'accept_money'
      ]
      let str = checkLink(Arr, query);
      var select = `update my_web.other_order set ` +
      str +
      ` where id = ${query.ID}`;
      connection.query(select, function(err, rows, fields) {
        if (!err) {
          res.send({
            data: rows,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: err,
          });
        }
      });
      connection.end();
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

module.exports = router;
