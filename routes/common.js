var https = require('https');
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

var DFormat = (value, type) => { // 日期Filter
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
    if (type === 'date') return `${year}/${ZeorFn(month)}/${ZeorFn(date)}`
	  return `${year}/${ZeorFn(month)}/${ZeorFn(date)} ` +
	  `${ZeorFn(Hours)}:${ZeorFn(Minutes)}:${ZeorFn(Seconds)}`;
	} catch (err) {
	  // alert('代码出错请联系：yzflhez@126.com')
	  return value
	}
};

function Rand(min,max) {
  return Math.floor(Math.random()*(max-min))+min;
}

var DFormat_data = (value, value2) => { // 日期Filter
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
    let oDate2;
	  let onoff = false;
	  if (Str) {
		  oDate = new Date(Str);
	  } else {
		  oDate = new Date();
    }
    if (value2) {
		  oDate2 = new Date(value2);
	  } else {
		  oDate2 = new Date();
	  }
	  const year = oDate.getFullYear();
	  const month = oDate.getMonth() + 1;
    const date = oDate.getDate();
    const year2 = oDate2.getFullYear();
	  const month2 = oDate2.getMonth() + 1;
	  const date2 = oDate2.getDate();
    if (year === year2 && month === month2 && date === date2) return true;
    return false;
	} catch (err) {
	  // alert('代码出错请联系：yzflhez@126.com')
	  return false;
	}
};

var DFormat_code = (value) => { // 日期Filter
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
	  let oDate = new Date();;
	  const year = oDate.getFullYear();
	  const month = oDate.getMonth() + 1;
	  const date = oDate.getDate();
	  const Hours = oDate.getHours();
	  const Minutes = oDate.getMinutes();
    const Seconds = oDate.getSeconds();
    
    const data = parseFloat(`${value}${year}${ZeorFn(month)}${ZeorFn(date)}${ZeorFn(Hours)}${ZeorFn(Minutes)}${ZeorFn(Seconds)}`)
	  return data * 8;
	} catch (err) {
	  // alert('代码出错请联系：yzflhez@126.com')
	  return value
	}
};
  
const checkFn = (e, query, res) => { // 参数必填校验
	if (query && e) {
	  let onoff = true;
	  e.forEach(i => {
      if (!query[i] && onoff) {
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

const checkLink = (e, query) => { // 编辑数据库用
/*
var Arr = [
  'name'
]
let str = checkLink(Arr, query);
var select = `update my_web.file set ` +
str +
` where id = ${query.id}`;
*/
  var str = '';
  if (query && e) {
    e.forEach(i => {
      // if (query[i]) {
        str += str ? `, ${i} = '${query[i]}'` : `${i} = '${query[i]}'`
      // }
    });
  }
  return str;
}

const checkAddLink = (e, query) => { // 新增数据库用
/*
var Arr = [
  {
    key: 'user_name',
    default: '',
    defaultSet: false, // 直接设key等于default
    hidden: false // 没有值就不管，有值就走上面的流程
  }
]
let str = checkAddLink(Arr, query);
var select = `INSERT INTO web_yzf168.user ` + str;
*/
  var str1 = '';
  var str2 = '';
  if (query && e) {
    e.forEach(i => {
      if (!i.hidden) {
        str1 += str1 ? `, ${i.key}` : `${i.key}`;
        if (i.defaultSet) {
          str2 += str2 ? `, '${i.default}'` : `'${i.default}'`;
        } else {
          str2 += str2 ? `, '${query[i.key] ? query[i.key] : i.default}'` : `'${query[i.key] ? query[i.key] : i.default}'`;
        }
      }
    });
  }
  return `(${str1}) VALUES(${str2})`;
}

var Mysql = require('mysql');
var host = {
  host: '39.100.225.94', // 149.129.177.101
  port: 3306,
  database: 'my_web', // 数据库
  user: 'yzflhez',
  password: 'Yzf-1234',
}

const MQ_P = (select, succeed, error) => { // 创建数据连接池
  if (!select || !succeed || !error) return false
  try{
    var pool = mysql.createPool(host);
    pool.getConnection((err, connecting) => {
      var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `phone = "${query.phone}"`
      connecting.query(select, (err, result) => {
        if (!err) {
          succeed(result);
        } else {
          error(err);
        }
      })
      connecting.end();
    })
  } catch (er) {
    error(er);
  }
}

const MQ = (select, succeed, error) => { // 创建数据连接
  if (!select || !succeed || !error) return true;
  try{
    var connection = Mysql.createConnection(host);
    connection.connect();
    connection.query(select, function(err, result, fields) {
      if (!err) {
        succeed(result);
      } else {
        error(err);
      }
    });
    connection.end();
  } catch (er) {
    error(er);
  }
}

const MQ_ok = (select, res, succeed) => { // 创建数据连接
  if (!select || !succeed) return true;
  try{
    var connection = Mysql.createConnection(host);
    connection.connect();
    connection.query(select, function(err, result, fields) {
      if (!err) {
        succeed(result);
      } else if (res) {
        res.send({
          result: 'error',
          errorCode: err,
          message: '数据库错误',
        });
      } else {
        console.log(err)
      }
    });
    connection.end();
  } catch (er) {
    if (res) {
      res.send({
        result: 'error',
        message: 'MQ未知错误',
      });
    } else {
      console.log('MQ未知错误')
    }
  }
}

const see_edit = ({
  id,
  init_value,
  res,
  table,
  edit,
  edit_fn,
  succeed,
}) => { // 编辑
  if (init_value) {
    let value = {};
    if (edit_fn) {
      value = edit_fn(init_value);
    }
    let str = checkLink(edit, value);
    var select2 = `update ${table} set ` +
    str +
    ` where id = ${id}`;
    MQ_ok(select2, res, (result2) => { // 更新自提点信息
      // console.log('see_edit1', result2);
      succeed(result2)
    })
  } else {
    var select = 'select ' + '*' + ' from ' + table + ' where ' + `id = ${id}`;
    MQ_ok(select, res, (result) => { // 被邀请对应用户
      if (result && result[0]) {
        const Item = result[0];
        if (edit) {
          let value = {};
          if (edit_fn) {
            value = edit_fn(Item);
          }
          let str = checkLink(edit, value);
          var select2 = `update ${table} set ` +
          str +
          ` where id = ${Item.id}`;
          // console.log('see_edit2', Item);
          MQ_ok(select2, res, (result2) => { // 更新自提点信息
            // console.log('see_edit3', result2);
            succeed(result2)
          })
        } else if (res) {
          res.send({
            result: 'error',
            message: `不存在${edit}`,
          });
        }
      } else if (res) {
        res.send({
          result: 'error',
          message: `不存在${id}`,
        });
      }
    })
  }
}


const Json = {
  download,
  DFormat, DFormat_data, DFormat_code,
  checkFn,
  checkAddLink, checkLink, MQ_P, MQ, MQ_ok,
  see_edit,
  Rand,
};
module.exports = Json;