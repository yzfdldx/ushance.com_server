var express = require('express');
var router = express.Router();
var fs = require('fs');
var qr = require('qr-image');
var path = require('path');
var https = require('https');
var multer = require('multer');
let xlsx = require('xlsx');

const {
  download, Rand,
  DFormat, DFormat_data, DFormat_code,
  checkFn,
  checkAddLink, checkLink, MQ, MQ_ok,
  see_edit
} = require('../common.js');

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

const DFormat_ch = (value) => { // 日期Filter
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
    // return `${year}-${ZeorFn(month)}-${ZeorFn(date)} `;
    return `${ZeorFn(month)}月${ZeorFn(date)}日`
  } catch (err) {
    // alert('代码出错请联系：yzflhez@126.com')
    return value
  }
};

/* 用户 */
router.post('/sign.json', async function(req, res, next) { // 登录
  try {
    var WXBizDataCrypt = require('../weixing_sdk/WXBizDataCrypt');
    const query = req.body;
    // const query = req.query;
    if (checkFn(['code', 'iv', 'encryptedData', 'head_img'], query, res)) {
      const appId = 'wxafbea51322ac546b';
      const secret = '1c0aa6027b2191deb8d82795a138ba3a';
      const encryptedData = query.encryptedData;
      const iv = query.iv;
      const Url = encodeURI(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${query.code}&grant_type=authorization_code`);
      download(Url, function( val ) {
        if(val){
          const VAL = JSON.parse(val);
          const sessionKey = VAL.session_key; // val => sessionKey
          const pc = new WXBizDataCrypt(appId, sessionKey);
          if (pc && pc.decryptData) {
            const data = pc.decryptData(encryptedData , iv);
            if (data && data.phoneNumber) {
              // var connection = Mysql.createConnection(host);
              // connection.connect();
              var select = 'select ' + '*' + ' from ' + 'my_web.exam_user' + ' where ' + `phone = "${data.phoneNumber}"`    
              MQ_ok(select, res, (result) => {
                if (result[0]) { // 有是登录
                  const Item = result[0];
                  let str = `img = '${query.head_img}'`;

                  var select3 = `update my_web.exam_user set ` +
                  str +
                  ` where id = ${Item.id}`;
                  MQ_ok(select3, res, (result3) => { // 更新随机试卷
                    if (result3) {
                      res.send({
                        result: 'succeed',
                        data: {
                          ...Item,
                          img: query.head_img,
                          sign_in: Item.sign_in ? JSON.parse(Item.sign_in) : [],
                        },
                      });
                    } else {
                      res.send({
                        result: 'error',
                        data: {},
                      });
                    }
                  })
                } else { // 是注册
                  res.send({
                    result: 'error',
                    errorCode: 200,
                    message: '您还不是该公司员工，请找管理员添加',
                  });
                }
              })
            } else {
              res.send({
                result: 'error',
                errorCode: 200,
                message: '没有获取到手机号，请一会再试一试',
              });
            }
          } else {
            res.send({
              result: 'error',
              errorCode: 200,
              message: '出错了，请一会再试一试',
            });
          }
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: '数据库处理失败',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});
router.get('/get_use.json', function(req, res, next) { // 查询用户详情
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['phone'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_user' + ' where ' + `phone = "${query.phone}"`
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: {
              ...result[0],
              sign_in: result[0].sign_in ? JSON.parse(result[0].sign_in) : [],
            },
          });
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/get_use_id.json', function(req, res, next) { // 查询用户详情
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_user' + ' where ' + `id = "${query.id}"`
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: {
              ...result[0],
              sign_in: result[0].sign_in ? JSON.parse(result[0].sign_in) : [],
            },
          });
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/get_use_list.json', function(req, res, next) { // 查询用户列表
  try {
    // const query = req.query;
    const query = req.body;
    if (query) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_user' + ' order by id desc'
      MQ_ok(select, res, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result,
          });
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
const load_use_list = (e) => {
  const Time = DFormat();
  var Arr = [
    {
      key: 'name',
      default: e.name,
      defaultSet: true,
    },
    {
      key: 'phone',
      default: e.phone,
      defaultSet: true,
    },
    {
      key: 'user_type',
      default: e.user_type,
      defaultSet: true,
    },
    {
      key: 'department',
      default: e.department,
      defaultSet: true,
    }
  ]
  let str = checkAddLink(Arr, {});
  var select = `INSERT INTO my_web.exam_user ` + str;
  MQ_ok(select, null, (result) => {
    //
  })
}
router.post('/user_updata', upload.single('file'), async (req, res, next) => { // 上传员工 
  try {
    const query = req.body;
    fs.exists(req.file.path, function (exists) {
      if (exists) { // 存在
        const back = (err, data) => {
          const onoff = req.file.size < 1024 * 1024 * 100 ? true : false;
          if (!err && onoff) {
            let workbook = xlsx.readFile(req.file.path); //workbook就是xls文档对象
            let sheetNames = workbook.SheetNames; //获取表明
            let sheet = workbook.Sheets[sheetNames[0]]; //通过表明得到表对象
            var data = xlsx.utils.sheet_to_json(sheet); //通过工具将表对象的数据读出来并转成json);
            fs.unlink(req.file.path, function(err) {})
            data.forEach(e => {
              load_use_list({
                name: e['姓名'],
                phone: e['电话'],
                user_type: e['是否为管理人员'],
                department: e['部门']
              });
            })
            setTimeout(() => {
              res.send({
                result: 'succeed',
                data: data,
              });
            }, 200)
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
router.post('/delete_user.json', function(req, res, next) { // 删除用户
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = `DELETE FROM my_web.exam_user WHERE id = ${query.id}`;
      MQ_ok(select, res, (result) => { // 删除
        if (result) {
          res.send({
            result: 'succeed',
            data: result,
          });
        } else {
          res.send({
            result: 'error',
            data: {},
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
/* 首页 */
router.get('/get_list.json', function(req, res, next) { // 排行
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['num'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_test order by id desc';
      MQ_ok(select, res, (result) => {
        const item = result.find(e => e.text_len);
        if (item) {
          const exam_test = query.test_id ? {
            id: query.test_id
          } : item;
          var select2 = 'select ' + 'id, test_list, test_id, test_name, user, user_name, user_department, get_mark, time_len' + ' from ' + 'my_web.exam_random' +
          ' where ' + `test_id = "${exam_test.id}" and test_list is not null and get_mark is not null` + ' order by get_mark desc,time_len asc'; // desc asc
          MQ_ok(select2, res, (result2) => {
            if (result2) {
              res.send({
                result: 'succeed',
                data: result2.filter((e, k) => k < query.num),
              });
            }
          })
        } else {
          res.send({
            result: 'succeed',
            data: []
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/user_sign.json', function(req, res, next) { // 签到
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['time', 'user'], query, res)) {
      see_edit({
        id: query.user,
        res: res,
        table: 'my_web.exam_user',
        edit: ['sign_in'],
        edit_fn: (edit) => {
          let sign_in = edit.sign_in ? JSON.parse(edit.sign_in) : [];
          if (sign_in.length === 60) {
            sign_in.shift();
          } else if (sign_in.length > 60) {
            sign_in.shift();
            sign_in.shift();
            sign_in.shift();
          }
          sign_in.push(query.time);
          sign_in = JSON.stringify(sign_in)
          return {
            sign_in
          }
        },
        succeed: (result3) => {
          res.send({
            result: 'succeed',
            data: result3,
          });
        },
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

/* 试题 */
const load_lists = (e) => {
  var Arr = [
    {
      key: 'title',
      default: e.title,
      defaultSet: true,
    },
    {
      key: 'type',
      default: e.type,
      defaultSet: true,
    },
    {
      key: 'solution',
      default: e.solution,
      defaultSet: true,
    },
    {
      key: 'select_option',
      default: e.select_option,
      defaultSet: true,
    }
  ]
  let str = checkAddLink(Arr, {});
  var select = `INSERT INTO my_web.exam_lists ` + str;
  console.log(str)
  MQ_ok(select, null, (result) => {
    console.log('exam_lists ok')
  })
}
router.post('/lists_updata', upload.single('file'), async (req, res, next) => { // 上传试题
  try {
    const query = req.body;
    fs.exists(req.file.path, function (exists) {
      if (exists) { // 存在
        const back = (err, data) => {
          const onoff = req.file.size < 1024 * 1024 * 100 ? true : false;
          if (!err && onoff) {
            let workbook = xlsx.readFile(req.file.path); //workbook就是xls文档对象
            let sheetNames = workbook.SheetNames; //获取表明
            let sheet = workbook.Sheets[sheetNames[0]]; //通过表明得到表对象
            var data = xlsx.utils.sheet_to_json(sheet); //通过工具将表对象的数据读出来并转成json);
            fs.unlink(req.file.path, function(err) {})

            // const Arr = data.map(e => ({
            //   title: e['题目'],
            //   type: e['类型'],
            //   solution: e['答案'],
            //   option: [e['选项D'], e['选项E'], e['选项F'], e['选项G'], e['选项H'], e['选项I']].filter(e2 => e2),
            // }));
            data.forEach(e => {
              load_lists({
                title: e['题目'],
                type: e['类型'],
                solution: e['答案'],
                // select_option: JSON.stringify([22]),
                select_option: JSON.stringify([e['选项D'], e['选项E'], e['选项F'], e['选项G'], e['选项H'], e['选项I']].filter(e2 => e2)),
              });
            })
            setTimeout(() => {
              res.send({
                result: 'succeed',
                data: data,
              });
            }, 200)
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
router.post('/delete_lists.json', function(req, res, next) { // 删除试题
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = `DELETE FROM my_web.exam_lists WHERE id = ${query.id}`;
      MQ_ok(select, res, (result) => { // 删除
        if (result) {
          res.send({
            result: 'succeed',
            data: result,
          });
        } else {
          res.send({
            result: 'error',
            data: {},
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/get_lists.json', function(req, res, next) { // 查询试题列表
  try {
    // const query = req.query;
    const query = req.body;
    var select = 'select ' + '*' + ' from ' + 'my_web.exam_lists' + ' order by id desc'
    MQ_ok(select, res, (result) => {
      if (result) {
        res.send({
          result: 'succeed',
          data: result.map(e => ({
            ...e,
            select_option: e.select_option ? JSON.parse(e.select_option) : [],
            solution: e.solution ? e.solution.split(',') : null,
          })),
        });
      } else {
        res.send({
          result: 'error',
          message: '不存在',
        });
      }
    })
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
/* 试卷 */
router.post('/add_test.json', async function(req, res, next) { // 新建试卷
  try {
    const query = req.body;
    // const query = req.query;
    if (checkFn(['name', 'creater', 'creater_name', 'start_time', 'end_time', 'len', 'mark', 'qualified'], query, res)) {
      const Time = DFormat();
      var Arr = [
        {
          key: 'name',
          default: '',
          defaultSet: false,
        },
        {
          key: 'creater',
          default: '',
          defaultSet: false,
        },
        {
          key: 'creater_name',
          default: '',
          defaultSet: false,
        },
        {
          key: 'start_time',
          default: '',
          defaultSet: false,
        },
        {
          key: 'end_time',
          default: '',
          defaultSet: false,
        },
        {
          key: 'len',
          default: '',
          defaultSet: false,
        },
        {
          key: 'mark',
          default: '',
          defaultSet: false,
        },
        {
          key: 'qualified',
          default: '',
          defaultSet: false,
        },
        {
          key: 'creation_time',
          default: new Date(),
          defaultSet: true,
        },
      ];
      let str = checkAddLink(Arr, query);
      var select = `INSERT INTO my_web.exam_test ` + str;
      MQ_ok(select, res, (result) => {
        // const result_a = {insertId: 6}
        if (result) {
          res.send({
            result: 'succeed',
            data: result.insertId,
          });
        } else {
          res.send({
            result: 'error',
            data: {},
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});
router.post('/delete_test.json', function(req, res, next) { // 删除试卷
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = `DELETE FROM my_web.exam_test WHERE id = ${query.id}`;
      MQ_ok(select, res, (result) => { // 删除
        if (result) {
          res.send({
            result: 'succeed',
            data: result,
          });
        } else {
          res.send({
            result: 'error',
            data: {},
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/get_test_list.json', function(req, res, next) { // 查询试卷列表
  try {
    const query = req.query;
    // const query = req.body;
    var select = 'select ' + '*' + ' from ' + 'my_web.exam_test' + ' order by id desc LIMIT 10'
    MQ_ok(select, res, (result) => {
      if (result) {
        if (query.user_id) {
          let Str = '';
          result.forEach(e => {
            if (!Str) {
              Str = `test_id = "${e.id}"`;
            } else {
              Str += `or test_id = "${e.id}"`;
            }
          })
          var select2 = 'select ' + 'id, test_id, get_mark, time_len' + ' from ' + 'my_web.exam_random' + ' where ' +
          `user = "${query.user_id}" and ` + Str;
          MQ_ok(select2, res, (result2) => {
            if (result2) {
              res.send({
                result: 'succeed',
                data: result.map(e => ({
                  ...e,
                  creation_time: e.creation_time ? new Date(e.creation_time) : null,
                  start_time: e.start_time ? new Date(e.start_time) : null,
                  end_time: e.end_time ? new Date(e.end_time) : null,
                  exam_random: result2.find(e2 => e.id == e2.test_id)
                })),
              });
            }
          })
        } else {
          res.send({
            result: 'succeed',
            data: result.map(e => ({
              ...e,
              creation_time: e.creation_time ? new Date(e.creation_time) : null,
              start_time: e.start_time ? new Date(e.start_time) : null,
              end_time: e.end_time ? new Date(e.end_time) : null,
            })),
          });
        }
      } else {
        res.send({
          result: 'error',
          message: '不存在该用户',
        });
      }
    })
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
/* 随机试题 */
router.post('/add_random.json', async function(req, res, next) { // 新建随机试题
  try {
    const query = req.body;
    // const query = req.query;
    if (checkFn(['test_id', 'user', 'user_name', 'user_department'], query, res)) {
      var select_test = 'select ' + '*' + ' from ' + 'my_web.exam_test' + ' where ' + `id = "${query.test_id}"`;
      MQ_ok(select_test, res, (result_test) => {
        // const result_a = {insertId: 6}
        if (result_test) {
          var select = 'select ' + '*' + ' from ' + 'my_web.exam_lists';
          MQ_ok(select, res, (result) => {
            if (result) {
              const list = new Array(parseInt(result_test[0].len)).fill('a').map(e => {
                const a = Rand(0, result.length - 1);
                const it = result.splice(a, 1)[0];
                return it ? it.id : 1
              })
              // res.send({
              //   result: 'succeed',
              //   data: list,
              // });
              // return
              var Arr = [
                {
                  key: 'test_id',
                  default: '',
                  defaultSet: false,
                },
                {
                  key: 'test_name',
                  default: result_test[0].name,
                  defaultSet: true,
                },
                {
                  key: 'test_mark',
                  default: result_test[0].qualified,
                  defaultSet: true,
                },
                {
                  key: 'user',
                  default: '',
                  defaultSet: false,
                },
                {
                  key: 'user_name',
                  default: query.user_name,
                  defaultSet: true,
                },
                {
                  key: 'user_department',
                  default: query.user_department,
                  defaultSet: true,
                },
                {
                  key: 'lists',
                  default: JSON.stringify(list),
                  defaultSet: true,
                },
                {
                  key: 'mark',
                  default: result_test[0].mark,
                  defaultSet: true,
                },
                {
                  key: 'start_time',
                  default: new Date().getTime(),
                  defaultSet: true,
                }
              ];
              let str = checkAddLink(Arr, query);
              var select = `INSERT INTO my_web.exam_random ` + str;
              MQ_ok(select, res, (result) => {
                // const result_a = {insertId: 6}
                if (result) {
                  res.send({
                    result: 'succeed',
                    data: result.insertId,
                  });
                } else {
                  res.send({
                    result: 'error',
                    data: {},
                  });
                }
              })
            } else {
              res.send({
                result: 'error',
                data: {},
              });
            }
          })
        } else {
          res.send({
            result: 'error',
            data: {},
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});
router.get('/get_random_list.json', function(req, res, next) { // 查询随机试题题目
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_random' + ' where ' + `id = "${query.id}"`
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          let Arr = [];
          try {
            Arr = JSON.parse(result[0].lists);
          } catch (error) {
            //
          }
          let Str = '';
          Arr.forEach(e => {
            if (!Str) {
              Str = `id = "${e}"`;
            } else {
              Str += `or id = "${e}"`;
            }
          })
          var select2 = 'select ' + 'id, title, type, select_option' + ' from ' + 'my_web.exam_lists' + ' where ' + Str
          MQ_ok(select2, res, (result2) => {
            if (result2) {
              res.send({
                result: 'succeed',
                data: {
                  ...result[0],
                  list: result2.map((e, k) => ({
                    ...e,
                    select_option: e.select_option ? JSON.parse(e.select_option) : [],
                    your_option: ''
                  }))
                },
              });
            }
          })
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/get_random_detail.json', function(req, res, next) { // 查询随机试题详情
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_random' + ' where ' + `id = "${query.id}"`
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          let Arr = [];
          let ArrLIst = [];
          try {
            Arr = JSON.parse(result[0].lists);
            ArrLIst = result[0].test_list ? JSON.parse(result[0].test_list) : [];
          } catch (error) {
            //
          }
          let Str = '';
          Arr.forEach(e => {
            if (!Str) {
              Str = `id = "${e}"`;
            } else {
              Str += `or id = "${e}"`;
            }
          })
          var select2 = 'select ' + '*' + ' from ' + 'my_web.exam_lists' + ' where ' + Str
          MQ_ok(select2, res, (result2) => {
            if (result2) {
              res.send({
                result: 'succeed',
                data: {
                  ...result[0],
                  get_mark: result[0].get_mark ? parseFloat(result[0].get_mark) : 0,
                  test_mark: result[0].test_mark ? parseFloat(result[0].test_mark) : 0,
                  list: result2.map((e, k) => ({
                    ...e,
                    select_option: e.select_option ? JSON.parse(e.select_option) : [],
                    your_option: ArrLIst[k] ? `${ArrLIst[k]}` : ''
                  }))
                },
              });
            }
          })
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/edit_random.json', function(req, res, next) { // 答题编辑
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'test_list', 'end_time', 'time_len'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_random' + ' where ' + `id = "${query.id}"`
      MQ_ok(select, res, (result) => { // 查看随机试卷
        if (result && result[0]) {
          let Arr = [];
          let Asn = [];
          try {
            Arr = JSON.parse(result[0].lists);
            Asn = JSON.parse(query.test_list);
          } catch (error) {
            //
          }
          see_edit({ // 更新考试人数
            id: result[0].test_id,
            // res: res,
            table: 'my_web.exam_test',
            edit: ['text_len'],
            edit_fn: (edit) => {
              let text_len = edit.text_len ? parseInt(edit.text_len) : 0;
              text_len = text_len + 1;
              return {
                text_len
              }
            },
            succeed: (result3) => {
              //
            },
          })
          let Str = '';
          Arr.forEach(e => {
            if (!Str) {
              Str = `id = "${e}"`;
            } else {
              Str += `or id = "${e}"`;
            }
          })
          var select2 = 'select ' + '*' + ' from ' + 'my_web.exam_lists' + ' where ' + Str
          MQ_ok(select2, res, (result2) => { // 查询所有随机到的题目
            if (result2) {
              let mark = 0;
              result2.forEach((e, k) => {
                if (e.solution === Asn[k]) {
                  mark += parseFloat(result[0].mark);
                }
              })
              let str = `end_time = '${query.end_time}'`;
              str += `, time_len = '${query.time_len}'`;
              str += `, test_list = '${query.test_list}'`;
              str += `, get_mark = '${mark}'`;

              var select3 = `update my_web.exam_random set ` +
              str +
              ` where id = ${query.id}`;
              MQ_ok(select3, res, (result3) => { // 更新随机试卷
                if (result3 && result3[0]) {
                  res.send({
                    result: 'succeed',
                    data: result3[0],
                  });
                } else {
                  res.send({
                    result: 'succeed',
                    data: {},
                  });
                }
              })
            }
          })
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/re_random.json', function(req, res, next) { // 重新答题
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['test_id', 'random_id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_lists';
      MQ_ok(select, res, (result) => {
        if (result) {
          let l = 0;
          see_edit({ // 更新考试人数
            id: query.test_id,
            res: res,
            table: 'my_web.exam_test',
            edit: ['text_len', 'len'],
            edit_fn: (edit) => {
              let text_len = edit.text_len ? parseInt(edit.text_len) : 1;
              text_len = text_len - 1;
              l = edit.len;
              return {
                text_len,
                len: edit.len
              }
            },
            succeed: (result2) => {
              see_edit({ // 更新考试人数
                id: query.random_id,
                res: res,
                table: 'my_web.exam_random',
                edit: ['start_time', 'end_time', 'time_len', 'test_list', 'lists'],
                edit_fn: (edit) => {
                  const list = new Array(parseInt(l)).fill('a').map(e => {
                    const a = Rand(0, result.length - 1);
                    const i = result.splice(a, 1)[0];
                    return i ? i.id : 1;
                  })
                  return {
                    start_time: new Date(),
                    end_time: null,
                    time_len: null,
                    test_list: null,
                    lists: JSON.stringify(list),
                  }
                },
                succeed: (result3) => {
                  res.send({
                    result: 'succeed',
                    data: result3,
                  });
                },
              })
            },
          })
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
/* 获取学习 */
router.get('/get_learn_list.json', function(req, res, next) { // 查询学习列表
  try {
    // const query = req.query;
    // const query = req.body;
    var select = 'select ' + '*' + ' from ' + 'my_web.exam_learn order by id desc'
    MQ_ok(select, res, (result) => {
      if (result) {
        res.send({
          result: 'succeed',
          data: result.map(e => ({
            ...e,
            video: e.video ? JSON.parse(e.video) : {},
            user: e.user ? JSON.parse(e.user) : [],
            text: null
          })),
        });
      } else {
        res.send({
          result: 'error',
          message: '不存在该用户',
        });
      }
    })
    
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/get_learn.json', function(req, res, next) { // 查询学习详情
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_learn' + ' where ' + `id = "${query.id}"`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          const text = [];
          try {
            text = result[0].text ? JSON.parse(result[0].text) : [];
          } catch (error) {
            
          }
          res.send({
            result: 'succeed',
            data: {
              ...result[0],
              video: result[0].video ? JSON.parse(result[0].video) : {},
              text: text,
              user: result[0].user ? JSON.parse(result[0].user) : [],
            },
          });
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/edit_learn.json', function(req, res, next) { // 编辑学习
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'user_id'], query, res)) {
      see_edit({
        id: query.id,
        res: res,
        table: 'my_web.exam_learn',
        edit: ['user'],
        edit_fn: (edit) => {
          let user = edit.user ? JSON.parse(edit.user) : [];
          if (user.length === 300) {
            user.shift();
          } else if (user.length > 300) {
            user.shift();
            user.shift();
            user.shift();
          }
          const onoff = user.find(e => e.i === query.user_id);
          if (!onoff) {
            user.push({
              i: query.user_id,
              t: new Date().getTime(),
            });
          }
          user = JSON.stringify(user)
          return {
            user
          }
        },
        succeed: (result3) => {
          res.send({
            result: 'succeed',
            data: result3,
          });
        },
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/get_learn_user.json', function(req, res, next) { // 查询学习详情
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.exam_learn' + ' where ' + `id = "${query.id}"`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          const user = result[0].user ? JSON.parse(result[0].user) : [];
          let Str = '';
          user.forEach(e => {
            if (!Str) {
              Str = `id = "${e.i}"`;
            } else {
              Str += `or id = "${e.i}"`;
            }
          })
          var select2 = 'select ' + 'id, img, name, user_type, department' + ' from ' + 'my_web.exam_user' + ' where ' + Str
          MQ_ok(select2, res, (result2) => {
            const Arr = [];
            user.forEach(e => {
              const item = result2.find(e2 => e2.id == e.i);
              Arr.push({
                ...e,
                ...item,
                time: DFormat(e.t)
              });
            })
            res.send({
              result: 'succeed',
              data: Arr,
            });
          })
        } else {
          res.send({
            result: 'error',
            message: '不存在该用户',
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/delete_learn.json', function(req, res, next) { // 删除学习
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = `DELETE FROM my_web.exam_learn WHERE id = ${query.id}`;
      MQ_ok(select, res, (result) => { // 删除
        if (result) {
          res.send({
            result: 'succeed',
            data: result,
          });
        } else {
          res.send({
            result: 'error',
            data: {},
          });
        }
      })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
const load_learn = (e) => {
  var Arr = [
    {
      key: 'name',
      default: e.name,
      defaultSet: true,
    },
    {
      key: 'type',
      default: e.type,
      defaultSet: true,
    },
    {
      key: 'video',
      default: e.video,
      defaultSet: true,
    },
    {
      key: 'text',
      default: e.text,
      defaultSet: true,
    },
    {
      key: 'time',
      default: DFormat(),
      defaultSet: true,
    }
  ]
  let str = checkAddLink(Arr, {});
  var select = `INSERT INTO my_web.exam_learn ` + str;
  MQ_ok(select, null, (result) => {
    // console.log('exam_learn ok')
  })
}
router.post('/learn_updata', upload.single('file'), async (req, res, next) => { // 上传学习
  try {
    const query = req.body;
    fs.exists(req.file.path, function (exists) {
      if (exists) { // 存在
        const back = (err, data) => {
          const onoff = req.file.size < 1024 * 1024 * 100 ? true : false;
          if (!err && onoff) {
            let workbook = xlsx.readFile(req.file.path); //workbook就是xls文档对象
            let sheetNames = workbook.SheetNames; //获取表明
            let sheet = workbook.Sheets[sheetNames[0]]; //通过表明得到表对象
            var data = xlsx.utils.sheet_to_json(sheet); //通过工具将表对象的数据读出来并转成json);
            fs.unlink(req.file.path, function(err) {})
            data.forEach(e => {
              let fi = '';
              try {
                fi = e['文件'] ? JSON.stringify(e['文件']) : '';
              } catch (error) {
                //
              }
              load_learn({
                name: e['标题'],
                type: e['类型'],
                video: e['类型'] === 'video' ? JSON.stringify({
                  img: e['视频图片'],
                  src: e['视频资源'],
                }) : '',
                text: fi,
              });
            })
            setTimeout(() => {
              res.send({
                result: 'succeed',
                data: data,
              });
            }, 200)
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

module.exports = router;

//
