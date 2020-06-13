/*
// 创建一个连接
var connecting = Mysql.createConnection(host);
connecting.connect();
var select = ''
connecting.query(select, function(err, result, fields) {
  if (!err) {
    
  } else {
    res.send({
      result: 'error',
      errorCode: err,
      message: '用户名或者密码错误',
    });
  }
});
connecting.end();

// 创建一个连接池
var pool = mysql.createPool(host);
pool.getConnection((err, connecting) => {
  var select = 'select ' + '*' + ' from ' + 'my_web.USE' + ' where ' + `phone = "${query.phone}"`
  connecting.query(select, (err, result) => {
    if (!err && result) {

    }
  })
})
*/
var express = require('express');
var router = express.Router();
var Mysql = require('mysql');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload')
  },
  filename: function (req, file, cb) {
    var str = file.originalname.split('.')
    cb(null, Date.now() + '.' + str[1])
  }
})
var upload = multer({storage: storage});

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
  return str;
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

// 编辑单子
router.post('/updata', upload.single('file'), async (req, res, next) => { // 上传(<1G)
  try {
    const show_typeFn = (e) => {
      if (e.includes('image')) {
        return 1
      } else if (e.includes('video')) {
        return 2
      } else if (e.includes('audio')) {
        return 3
      }
      return 0
    }
    const query = req.body;
    fs.exists(req.file.path, function (exists) {
      if (exists) { // 存在
        if (checkFn(['create_id', 'create_name'], query, res)) {
          const show_type = show_typeFn(req.file.mimetype);
          const back = (err, data) => {
            const onoff = req.file.size < 1024 * 1024 * 100 ? true : false;
            if (!err && onoff) {
              fs.unlink(req.file.path, function(err) {})
              const time = DFormat();
              var connection = Mysql.createConnection(host);
              connection.connect();
              var values = data;
              if (show_type === 1) {
                const fileData = new Buffer(data,'binary');
                // const fileData = Buffer.from(data,'utf-8');
                values = fileData;
              }
              var select = "INSERT INTO my_web.file SET `data` = ?";
              connection.query(select, values, function(err, result, fields) {
                if (!err && result) {
                  const insertId = `${result.insertId}`;
                  var connection2 = Mysql.createConnection(host);
                  connection2.connect();
                  var select2 = `update my_web.file set ` +
                  `name = '${req.file.originalname}', ` +
                  `type = '${req.file.mimetype}', ` +
                  `size = '${req.file.size}', ` +
                  `url = 'https://www.ushance.com/web/file/get_file?id=${insertId}', ` +
                  `down_url = 'https://www.ushance.com/web/file/down_file?id=${insertId}', ` +
                  `show_type = '${show_type}', ` +
                  `create_id = '${query.create_id ? query.create_id : 1}', ` +
                  `create_name = '${query.create_name ? query.create_name : ''}', ` +
                  `create_time = '${time}', ` +
                  `edit_time = '${time}'` +
                  ` where id = ${insertId}`;
                  connection2.query(select2, function(err, result2, fields) {
                    if (!err) {
                      res.send({
                        name: req.file.originalname,
                        url: `https://www.ushance.com/web/file/get_file?id=${insertId}`,
                        thumbUrl: `https://www.ushance.com/web/file/down_file?id=${insertId}`,
                        size: `${req.file.size}`,
                        status: 'done',
                        message: '',
                        result: 'succeed',
                      });
                    } else {
                      res.send({
                        err,
                        step: '文件数据库信息修改失败',
                        result: 'error',
                        status: 'done',
                        message: '上传失败',
                      });
                    }
                  });
                  connection2.end();
                } else {
                  res.send({
                    err,
                    step: '文件导入数据库失败',
                    result: 'error',
                    status: 'done',
                    message: '上传失败',
                  });
                }
              });
              connection.end();
            } else if (!err) {
              fs.unlink(req.file.path, function(err) {})
              res.send({
                result: 'error',
                status: 'done',
                result: 'error',
                errorCode: 200,
                err,
                step: '文件过大',
                message: '上传失败, 文件大小不超过100M',
              });
            } else {
              res.send({
                step: '读取失败',
                result: 'error',
                status: 'done',
                result: 'error',
                errorCode: 200,
                err,
                message: '上传失败',
              });
            }
          }
          fs.readFile(req.file.path, function(err, data) {
            back(err, data);
          })
        } else {
          fs.unlink(req.file.path, function(err) {})
        }
      } else {
        res.send({
          err,
          step: '不存在',
          status: 'done',
          result: 'error',
          message: '上传失败',
        });
      }
    })
  } catch (err) {
    res.send({
      status: 'done',
      result: 'error',
      errorCode: 'err',
      step: 'try',
      err,
      message: '上传失败',
    });
  }
});

router.post('/large_updata', upload.single('file'), async (req, res, next) => { // 超大上传(不限制)
  try {
    const show_typeFn = (e) => {
      if (e.includes('image')) {
        return 1
      } else if (e.includes('video')) {
        return 2
      } else if (e.includes('audio')) {
        return 3
      }
      return 0
    }
    const query = req.body;
    fs.exists(req.file.path, function (exists) {
      if (exists) { // 存在
        if (checkFn(['create_id', 'create_name'], query, res)) {
          const time = DFormat();
          var connection = Mysql.createConnection(host);
          connection.connect();
          var select = `INSERT INTO my_web.file SET name = "${req.file.originalname}"`;
          connection.query(select, function(err, result, fields) {
            if (!err && result) {
              const insertId = `${result.insertId}`;
              var connection2 = Mysql.createConnection(host);
              connection2.connect();
              var select2 = `update my_web.file set ` +
              `type = '${req.file.mimetype}', ` +
              `size = '${req.file.size}', ` +
              // `url = 'https://www.ushance.com/web/file/get_file?id=${insertId}&path=/upload/${req.file.filename}', ` +
              `url = 'https://www.ushance.com/upload/${req.file.filename}', ` +
              `down_url = 'https://www.ushance.com/web/file/down_file?id=${insertId}&path=./public/upload/${req.file.filename}', ` +
              `show_type = '${show_typeFn(req.file.mimetype)}', ` +
              `create_id = '${query.create_id ? query.create_id : 1}', ` +
              `create_name = '${query.create_name ? query.create_name : ''}', ` +
              `create_time = '${time}', ` +
              `edit_time = '${time}'` +
              ` where id = ${insertId}`;
              connection2.query(select2, function(err, result2, fields) {
                if (!err) {
                  res.send({
                    name: req.file.originalname,
                    // url: `https://www.ushance.com/web/file/get_file?id=${insertId}&path=/upload/${req.file.filename}`,
                    url: `https://www.ushance.com/upload/${req.file.filename}`,
                    thumbUrl: `https://www.ushance.com/web/file/down_file?id=${insertId}&path=./public/upload/${req.file.filename}`,
                    size: `${req.file.size}`,
                    status: 'done',
                    message: '',
                    result: 'succeed',
                  });
                } else {
                  res.send({
                    err,
                    step: '文件数据库信息修改失败',
                    result: 'error',
                    status: 'done',
                    message: '上传失败',
                  });
                }
              });
              connection2.end();
            } else {
              res.send({
                err,
                step: '文件导入数据库失败',
                result: 'error',
                status: 'done',
                message: '上传失败',
              });
            }
          });
          connection.end()
        } else {
          fs.unlink(req.file.path, function(err) {})
        }
      } else {
        res.send({
          err,
          step: '不存在',
          status: 'done',
          result: 'error',
          message: '上传失败',
        });
      }
    })
  } catch (err) {
    res.send({
      status: 'done',
      result: 'error',
      errorCode: 'err',
      step: 'try',
      err,
      message: '上传失败',
    });
  }
});

router.post('/updatas', upload.array('file', 20), async (req, res, next) => { // 上传
  try {
    // const query = req.body;
    // var fileName = req.file.filename;
    // console.log(req)
    // var file = req.file;
    // if (!isFormData(req)) {
    //   res.statusCode = 400
    //   res.end('错误的请求, 请用multipart/form-data格式')
    //   return
    // }
    // var form = new formidable.IncomingForm();
    // form.uploadDir = './public/upload';
    // form.keepExtensions = true

    // form.on('field', (field, value) => {
    //   console.log(field)
    //   console.log(value)
    // })
    // form.on('end', () => {
    //   res.end('上传完成!')
    // })

    // form.parse(req)
    console.log(req.files);

    // console.log('文件类型：%s', file.mimetype);
    // console.log('原始文件名：%s', file.originalname);
    // console.log('文件大小：%s', file.size);
    // console.log('文件保存路径：%s', file.path);
    // const query = req.query;
    // if (checkFn(['id'], query, res)) {
      res.send({
        req: 1,
        result: 'succeed',
        message: 'test',
      });
    // }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

router.get('/get_file', async (req, res, next) => { // 读取详细信息
  try {
    const query = req.query;
    if (query.id) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.file' + ' where ' + `id = "${query.id}"`
      connection.query(select, function(err, result, fields) {
        if (!err && result[0] && result[0].data && !result[0].hide) { // 数据库的
          const Item = result[0];
          res.setHeader("Content-Type", Item.type);
          res.writeHead(200, "Ok");
          if (Item.show_type == 1) {
            res.write(Item.data, 'binary'); //格式必须为 binary，否则会出错
          } else {
            res.write(Item.data); //格式必须为 binary，否则会出错
          }
          res.end();
        } else if (!err && result[0] && !result[0].hide) { // 超大文件的
          // console.log(path)
          // if (res.redirect) {
          //   res.redirect(`https://www.ushance.com${query.path}`);
          // }
          // res.writeHead(301,{'Location': `https://www.ushance.com${query.path}`});
          // res.end();
          // if (res.redirect) {
          //   res.redirect(`https://www.baidu.com/`);
          // }
          res.redirect(`https://www.ushance.com${query.path}`);
          res.end();
        } else {
          // './public/upload/nofind.png'
          fs.readFile('./public/upload/nofind.png', 'binary', function(err, data) {
            if (!err) {
              res.setHeader("Content-Type", 'image/jpeg');
              //格式必须为 binary 否则会出错
              // var content = fs.readFileSync(url,"binary"); 
              res.writeHead(200, "Ok");
              // var decodedImage = new Buffer(data,'binary');
              // res.write(decodedImage); //格式必须为 binary，否则会出错
              res.write(data,"binary"); //格式必须为 binary，否则会出错
              res.end();
            } else {
              res.send({
                result: 'error',
                errorCode: 200,
                err,
                message: '读取失败',
              });
            }
          })
        }
      });
      connection.end();
    } else {
      fs.readFile('./public/upload/nofind.png', 'binary', function(err, data) {
        if (!err) {
          res.setHeader("Content-Type", 'image/jpeg');
          //格式必须为 binary 否则会出错
          // var content = fs.readFileSync(url,"binary"); 
          res.writeHead(200, "Ok");
          // var decodedImage = new Buffer(data,'binary');
          // res.write(decodedImage); //格式必须为 binary，否则会出错
          res.write(data,"binary"); //格式必须为 binary，否则会出错
          res.end();
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            err,
            message: '读取失败',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

router.get('/down_file', async (req, res, next) => { // 下载文件
  try {
    const query = req.query;
    if (query.id) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.file' + ' where ' + `id = "${query.id}"`
      connection.query(select, function(err, result, fields) {
        if (!err && result[0] && result[0].data && !result[0].hide) { // 数据库的
          const Item = result[0];
          let realName = encodeURI(Item.name,"GBK")
          realName = realName.toString('iso8859-1')
          res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': `attachment; filename=${realName}`,
            'Content-Length': Item.size
          });
          if (Item.show_type == 1) {
            res.write(Item.data, 'binary'); //格式必须为 binary，否则会出错
          } else {
            res.write(Item.data); //格式必须为 binary，否则会出错
          }
          res.end();
        } else if (!err && result[0] && !result[0].hide) { // 超大文件的
          const Item = result[0];
          const fileName = query.path.split('upload/')[1];
          const filePath = `./public/upload/${fileName}`;
          // const filePath = './public/upload/nofind.png';
          var size = fs.statSync(filePath).size;
          var f = fs.createReadStream(filePath)
          res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename=' + Item.name,
            'Content-Length': size
          });
          f.pipe(res)
        } else {
          fs.readFile('./public/upload/nofind.png', 'binary', function(err, data) {
            if (!err) {
              res.setHeader("Content-Type", 'image/jpeg');
              //格式必须为 binary 否则会出错
              // var content = fs.readFileSync(url,"binary"); 
              res.writeHead(200, "Ok");
              // var decodedImage = new Buffer(data,'binary');
              // res.write(decodedImage); //格式必须为 binary，否则会出错
              res.write(data,"binary"); //格式必须为 binary，否则会出错
              res.end();
            } else {
              res.send({
                result: 'error',
                errorCode: 200,
                err,
                message: '读取失败',
              });
            }
          })
        }
      });
      connection.end();
    } else {
      fs.readFile('./public/upload/nofind.png', 'binary', function(err, data) {
        if (!err) {
          res.setHeader("Content-Type", 'image/jpeg');
          //格式必须为 binary 否则会出错
          // var content = fs.readFileSync(url,"binary"); 
          res.writeHead(200, "Ok");
          // var decodedImage = new Buffer(data,'binary');
          // res.write(decodedImage); //格式必须为 binary，否则会出错
          res.write(data,"binary"); //格式必须为 binary，否则会出错
          res.end();
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            err,
            message: '读取失败',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

router.get('/get_file_detail', async (req, res, next) => { // 读取详细信息
  try {
    const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = Mysql.createConnection(host);
      connection.connect();
      var select = 'select ' + '*' + ' from ' + 'my_web.file' + ' where ' + `id = "${query.id}"`
      connection.query(select, function(err, result, fields) {
        if (!err) {
          res.send({
            data: {
              ...result[0],
              data: undefined,
            },
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            err,
            result: 'error',
            message: '查询失败',
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

router.get('/get_file_List', async (req, res, next) => { // 查看文件列表
  try {
    const query = req.query;
    var connection = Mysql.createConnection(host);
    connection.connect();
    const acceatData = 'id, name, type, size, url, down_url, show_type, create_id, create_name, create_time, edit_time, hide'
    if (query.id && query.create_id) {
      var select = 'select ' + acceatData + ' from ' + 'my_web.file' + ' where ' + `id = "${query.id}" and create_id = "${query.create_id}" order by id desc`
    } else if (query.id) {
      var select = 'select ' + acceatData + ' from ' + 'my_web.file' + ' where ' + `id = "${query.id}" order by id desc`
    } else if (query.create_id) {
      var select = 'select ' + acceatData + ' from ' + 'my_web.file' + ' where ' + `create_id = "${query.create_id}" order by id desc`
    } else {
      var select = 'select ' + acceatData + ' from ' + 'my_web.file order by id desc'
    }
    connection.query(select, function(err, result, fields) {
      if (!err) {
        res.send({
          data: result.filter(e => !e.hide),
          result: 'succeed',
          errorCode: 200,
          message: '',
        });
      } else {
        res.send({
          err,
          result: 'error',
          message: '查询失败',
        });
      }
    });
    connection.end();
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 'err',
      message: '代码出错了',
    });
  }
});

router.post('/edit_file.json', async (req, res, next) => { // 编辑
  try {
    const query = req.body;
    // const query = req.query;
    if (checkFn(['id'], query, res)) {
      var connection = mysql.createConnection(host);
      connection.connect();
      var Arr = [
        'name',
        'type',
        'size',
        'url',
        'down_url',
        'show_type',
        'create_id',
        'create_name',
        'create_time',
        'edit_time',
        'hide'
      ]
      let str = checkLink(Arr, query);
      var select = `update my_web.file set ` +
      str +
      ` where id = ${query.id}`;
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
