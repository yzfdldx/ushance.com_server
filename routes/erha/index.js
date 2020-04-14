var express = require('express');
var router = express.Router();
var fs = require('fs');
var qr = require('qr-image');
var path = require('path');
const {
  download,
  DFormat, DFormat_data, DFormat_code,
  checkFn,
  checkAddLink, checkLink, MQ, MQ_ok,
  see_edit
} = require('../common.js');

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

/* 首页 */
router.get('/recom_swiper.json', function(req, res, next) { // 商品轮播推荐
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['user_id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `use_id = "${query.user_id}" and date = "${DFormat(null, 'date')}" and hidden is null`
      MQ_ok(select, res, (result) => {
        const order_list = result.filter(e => e.del !== '3');
        var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_list' + ' where ' + `id = 1`;
        MQ_ok(select2, res, (result2) => {
          if (result2 && result2[0]) {
            const Item = JSON.parse(result2[0].data);
            const pay_oder = query.pay_oder ? JSON.parse(query.pay_oder) : [];
            let Arr = [...Item.all];
            pay_oder.forEach(e => {
              if (Item[`${e}`]) {
                Arr = [
                  ...Arr,
                  ...Item[`${e}`]
                ]
              }
            })
            let where = '';
            Arr.forEach(e => {
              where += where ? ` or id=${e.value}` : `id=${e.value}`
            })
            var select3 = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + where;
            MQ_ok(select3, res, (result3) => {
              if (result3) {
                const Arr3 = result3.map(e => {
                  let num = 0;
                  order_list.find(e2 => {
                    if (`${e2.shop_id}` === `${e.id}`) {
                      num += parseInt(e2.shop_num);
                    }
                  });
                  const erha_list_img = Arr.find(e2 => `${e2.value}` === `${e.id}`);
                  return ({
                    ...e,
                    media: e.media ? JSON.parse(e.media) : [],
                    operation_proces: e.operation_proces ? JSON.parse(e.operation_proces) : [],
                    pay_oder: e.pay_oder ? JSON.parse(e.pay_oder) : [],
                    pre_sale_time: e.pre_sale_time ? DFormat(e.pre_sale_time) : null,
                    count_down: e.count_down ? DFormat(e.count_down) : null,
                    show_pre_sale_time: e.pre_sale_time ? DFormat_ch(e.pre_sale_time) : null,
                    show_count_down: e.count_down ? DFormat_ch(e.count_down) : null,
                    order_num: num,
                    img: erha_list_img.img
                  })
                })
                res.send({
                  result: 'succeed',
                  data: Arr3
                });
              } else {
                res.send({
                  result: 'succeed',
                  data: [],
                });
              }
            })
          } else {
            res.send({
              result: 'error',
              data: [],
            });
          }
        })
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
router.get('/recom_list.json', function(req, res, next) { // 分类推荐
  try {
    const query = req.query;
    // const query = req.body;
    var select = 'select ' + '*' + ' from ' + 'my_web.erha_list' + ' where ' + `id = 2`;
    if (MQ(select, (result) => {
      if (result && result[0]) {
        res.send({
          result: 'succeed',
          data: {
            ...result[0],
            data: JSON.parse(result[0].data)
          },
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
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/recom_shop.json', function(req, res, next) { // 商品推荐
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['user_id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `use_id = "${query.user_id}" and date = "${DFormat(null, 'date')}" and hidden is null`
      MQ_ok(select, res, (result) => {
        const order_list = result.filter(e => e.del !== '3');
        var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_list' + ' where ' + `id = 3`;
        MQ_ok(select2, res, (result2) => {
          if (result2 && result2[0] && result2[0].data) {
            const Arr = JSON.parse(result2[0].data);
            let where = '';
            Arr.forEach(e => {
              where += where ? ` or id=${e.value}` : `id=${e.value}`
            })
            var select3 = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + where;
            MQ_ok(select3, res, (result3) => {
              if (result3) {
                const Arr3 = result3.map(e => {
                  let num = 0;
                  order_list.find(e2 => {
                    if (`${e2.shop_id}` === `${e.id}`) {
                      num += parseInt(e2.shop_num);
                    }
                  });
                  return ({
                    ...e,
                    media: e.media ? JSON.parse(e.media) : [],
                    operation_proces: e.operation_proces ? JSON.parse(e.operation_proces) : [],
                    pay_oder: e.pay_oder ? JSON.parse(e.pay_oder) : [],
                    pre_sale_time: e.pre_sale_time ? DFormat(e.pre_sale_time) : null,
                    count_down: e.count_down ? DFormat(e.count_down) : null,
                    show_pre_sale_time: e.pre_sale_time ? DFormat_ch(e.pre_sale_time) : null,
                    show_count_down: e.count_down ? DFormat_ch(e.count_down) : null,
                    order_num: num,
                  })
                })
                res.send({
                  result: 'succeed',
                  data: Arr3
                });
              } else {
                res.send({
                  result: 'succeed',
                  data: [],
                });
              }
            })
          } else {
            res.send({
              result: 'succeed',
              data: [],
            });
          }
        })
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
router.get('/recom_message.json', function(req, res, next) { // 新闻简报
  try {
    // const query = req.query;
    // const query = req.body;
    var select = 'select ' + '*' + ' from ' + 'my_web.erha_list' + ' where ' + `id = 5`;
    MQ_ok(select, res, (result) => {
      if (result) {
        res.send({
          result: 'succeed',
          data: {
            ...result[0],
            data: result[0].data ? JSON.parse(result[0].data) : [],
          }
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
/* 分类 */
router.get('/list.json', function(req, res, next) { // 分类
  try {
    const query = req.query;
    // const query = req.body;
    var select = 'select ' + '*' + ' from ' + 'my_web.erha_list' + ' where ' + `id = 4`;
    if (MQ(select, (result) => {
      if (result && result[0]) {
        res.send({
          result: 'succeed',
          data: {
            ...result[0],
            data: JSON.parse(result[0].data)
          },
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
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/get_shop.json', function(req, res, next) { // 查询商品
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['user_id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `use_id = "${query.user_id}" and date = "${DFormat(null, 'date')}" and hidden is null`
      MQ_ok(select, res, (result) => {
        if (result) {
          const order_list = result.filter(e => e.del !== '3');
          let onoff = true;
          var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + `hidden is null`;
          if (query.id) {
            onoff = false;
            select2 = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + `id = ${query.id} and hidden is null`;
            MQ_ok(select2, res, (result2) => {
              if (result2) {
                let num = 0;
                order_list.find(e => {
                  if (`${e.shop_id}` === `${result2[0].id}`) {
                    num += parseInt(e.shop_num);
                  }
                });
                res.send({
                  result: 'succeed',
                  data: {
                    ...result2[0],
                    order_num: num,
                    pay_oder: result2[0].pay_oder ? JSON.parse(result2[0].pay_oder) : [],
                    pre_sale_time: result2[0].pre_sale_time ? DFormat(result2[0].pre_sale_time) : null,
                    count_down: result2[0].count_down ? DFormat(result2[0].count_down) : null,
                    show_pre_sale_time: result2[0].pre_sale_time ? DFormat_ch(result2[0].pre_sale_time) : null,
                    show_count_down: result2[0].count_down ? DFormat_ch(result2[0].count_down) : null,
                    pre_sale_time_getTime: result2[0].pre_sale_time ? new Date(result2[0].pre_sale_time).getTime() : null,
                    count_down_getTime: result2[0].count_down ? new Date(result2[0].count_down).getTime() : null,
                    media: result2[0] && result2[0].media ? JSON.parse(result2[0].media) : [],
                    operation_proces: result2[0] && result2[0].operation_proces ? JSON.parse(result2[0].operation_proces) : [],
                  },
                });
              } else {
                res.send({
                  result: 'succeed',
                  data: [],
                });
              }
            })
          } else if (query.type) {
            var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + `type = "${query.type}" and hidden is null order by order_id desc , id`;
          }
          if (onoff) {
            MQ_ok(select2, res, (result2) => {
              if (result2) {
                const Arr = result2.map(e => {
                  let num = 0;
                  order_list.find(e2 => {
                    if (`${e2.shop_id}` === `${e.id}`) {
                      num += parseInt(e2.shop_num);
                    }
                  });
                  return ({
                    ...e,
                    media: e.media ? JSON.parse(e.media) : [],
                    operation_proces: e.operation_proces ? JSON.parse(e.operation_proces) : [],
                    pay_oder: e.pay_oder ? JSON.parse(e.pay_oder) : [],
                    pre_sale_time: e.pre_sale_time ? DFormat(e.pre_sale_time) : null,
                    count_down: e.count_down ? DFormat(e.count_down) : null,
                    show_pre_sale_time: e.pre_sale_time ? DFormat_ch(e.pre_sale_time) : null,
                    show_count_down: e.count_down ? DFormat_ch(e.count_down) : null,
                    order_num: num,
                  })
                })
                res.send({
                  result: 'succeed',
                  data: query.search ? Arr.filter(e => e.name.includes(query.search)) : Arr,
                });
              } else {
                res.send({
                  result: 'succeed',
                  data: [],
                });
              }
            })
          }
        } else {
          res.send({
            result: 'succeed',
            data: [],
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
/* 购物车 */
router.get('/get_shop_card.json', function(req, res, next) { // 查询购物车
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_shop_card' + ' where ' + `use_id = ${query.id} and hidden is null`;
      MQ_ok(select, res, (result) => {
        if (result) {
          var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_shop';
          MQ_ok(select2, res, (result2) => {
            if (result2) {
              res.send({
                result: 'succeed',
                data: result.map(e => {
                  const Item = result2.find(e2 => `${e2.id}` === `${e.shop_id}`)
                  return ({
                    ...e,
                    acount: e.acount ? JSON.parse(e.acount) : {},
                    acount_list: e.acount_list ? JSON.parse(e.acount_list) : {},
                    shop_data: Item
                  })
                }),
              });
            } else {
              res.send({
                result: 'succeed',
                data: [],
              });
            }
          })
        } else {
          res.send({
            result: 'succeed',
            data: [],
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
router.post('/edit_shop_card.json', function(req, res, next) { // 编辑购物车 ???
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id','user_id', 'shop_id', 'shop_num'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + `id = ${query.shop_id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          const Item = result[0];
          var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `shop_id = ${query.shop_id} and use_id = ${query.user_id}`;
          MQ_ok(select2, res, (result2) => { // 查询订单
            let onoff = 0;
            let order = {};
            if (result2 && result2[0]) {
              order = result2[0];
              const time_onoff = DFormat_data(null, order.creat_time);
              const num = Item.pay_num ? parseFloat(Item.pay_num) : 0;
              if (num && parseFloat(Item.pay_num) > num && time_onoff) { // 在一天里不能超过限定数量
                onoff = 1;
              }
            }
            if (!onoff &&result2) {
              let order_price = (parseFloat(query.shop_num) * parseFloat(Item.discount_price)).toFixed(2)
              let str = `shop_num = '${query.shop_num}'`;
              str += `, order_price = '${order_price}'`;
              var select = `update my_web.erha_shop_card set ` +
              str +
              ` where id = ${query.id}`;
              MQ_ok(select, res, (result) => {
                if (result) {
                  res.send({
                    result: 'succeed',
                    data: result,
                  });
                } else {
                  res.send({
                    result: 'error',
                    data: {},
                    message: '编辑失败',
                  });
                }
              })
            }else if (onoff === 1) {
              res.send({
                result: 'error',
                message: '超过商品限购数量',
              });
            } else {
              res.send({
                result: 'error',
                message: '下单失败',
              });
            }
          })
        } else {
          res.send({
            result: 'error',
            data: [],
            message: '不存在该商品',
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
router.post('/delete_shop_card.json', function(req, res, next) { // 删除购物车
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'shop_id'], query, res)) {
      var select = `DELETE FROM my_web.erha_shop_card WHERE id = ${query.id}`;
      MQ_ok(select, res, (result) => { // 删除
        if (result) {
          var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + `id = ${query.shop_id}`;
          MQ_ok(select2, res, (result2) => { // 查询
            if (result2 && result2[0]) {
              const Item = result2[0];
              // let attention = Item.attention ? parseFloat(Item.attention) : 1;
              // attention = attention - 1;
              // let str2 = `attention = '${attention}'`;
              // var select3 = `update my_web.erha_shop set ` +
              // str2 +
              // ` where id = ${query.shop_id}`;
              // MQ_ok(select3, null, (result3) => { // 改变商品关注度
              //   //
              // })
              res.send({
                result: 'succeed',
                data: {},
              });
            } else {
              res.send({
                result: 'succeed',
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
      errorCode: error,
      message: '未知错误',
    });
  }
});

// http://www.localhost:8000/erha/pay.json?use_id=1&shop_id=3&self_mention_id=1&shop_num=1&order_name=1&order_phone=18842897729&order_name=yzf&address=%E6%B5%99%E6%B1%9F%E7%9C%81,%E6%9D%AD%E5%B7%9E%E5%B8%82,%E8%A5%BF%E6%B9%96%E5%8C%BA&use_img=https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKaoGyNgIfDxicB16H8icYlcY26yrVEtI5tluYvtiaWeAeAqQvwEfHstezicvPqgUK1JKYA9bko2ta8rg/132
router.post('/add_order.json', function(req, res, next) { // 新增订单
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['use_id', 'use_img', 'shop_id', 'self_mention_id', 'shop_num', 'order_name', 'order_phone', 'address'], query, res)) { // note, share_id
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + `id = ${query.shop_id} and hidden is null`;
      MQ_ok(select, res, (result) => { // 查询商品
        if (result && result[0]) {
          const shop = result[0];
          if (!shop.pay_num || parseFloat(shop.pay_num) >= parseFloat(query.shop_num)) {
            var select3 = 'select ' + '*' + ' from ' + 'my_web.erha_self_mention' + ' where ' + `id = ${query.self_mention_id} and hidden is null`;
            MQ_ok(select3, res, (result3) => { // 查询自提点
              if (result3 && result3[0]) {
                const self_mention = result3[0];
                const code_use = self_mention.code_use ? JSON.parse(self_mention.code_use) : [];
                var select2 = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `shop_id = ${query.shop_id} and use_id = ${query.use_id}`;
                MQ_ok(select2, res, (result2) => { // 查询订单
                  let onoff = 0;
                  let order = {};
                  if (result2 && result2[0]) {
                    order = result2[0];
                    const time_onoff = DFormat_data(null, order.creat_time);
                    const num = shop.pay_num ? parseFloat(shop.pay_num) : 0;
                    if (num && parseFloat(shop.pay_num) > num && time_onoff) { // 在一天里不能超过限定数量
                      onoff = 1;
                    }
                  }
                  if (!onoff && result2) { // 检验成功开始新增订单
                    const Time = DFormat();
                    const price = (parseFloat(query.shop_num) * parseFloat(shop.discount_price));
                    const up_onoff = code_use.find(e => `${e}` === `${query.use_id}`); // 是不是该自提点的下线
                    const supplier_price = (parseFloat(query.shop_num) * parseFloat(shop.supplier_price ? shop.supplier_price : 0));
                    const self_mention_price = (price * parseFloat(shop.self_mention_proportion));
                    const share_price = (query.share_id ? price * parseFloat(shop.share_proportion) : 0);
                    const earning_price = (up_onoff && query.share_type !== 'mention' ? price * parseFloat(shop.earning_proportion) : 0);
                    const profit = (price - supplier_price - self_mention_price - share_price - earning_price);
                    const acount = JSON.stringify({
                      price: price.toFixed(2),
                      supplier_price: supplier_price.toFixed(2), // 成本
                      self_mention_price: self_mention_price.toFixed(2), // 自提点
                      share_price: share_price.toFixed(2), // 分享
                      earning_price: earning_price.toFixed(2), // 下线
                      profit: profit.toFixed(2), // 利润
                    });
                    const acount_list = JSON.stringify({
                      supplier_id: shop.supplier_id,
                      self_mention_id: query.self_mention_id,
                      share_id: query.share_id,
                      upmen_id: up_onoff ? query.self_mention_id : undefined,
                    });
                    var Arr = [
                      {
                        key: 'order_num',
                        default: DFormat_code(query.use_id),
                        defaultSet: true,
                      },
                      {
                        key: 'order_code',
                        default: DFormat_code(query.shop_id),
                        defaultSet: true,
                      },
                      {
                        key: 'shop_id',
                        default: query.shop_id,
                        defaultSet: true,
                      },
                      {
                        key: 'name',
                        default: shop.name,
                        defaultSet: true,
                      },
                      {
                        key: 'shop_img',
                        default: shop.list_img,
                        defaultSet: true,
                      },
                      {
                        key: 'shop_num',
                        default: query.shop_num,
                        defaultSet: true,
                      },
                      {
                        key: 'order_price',
                        default: price.toFixed(2),
                        defaultSet: true,
                      },
                      {
                        key: 'use_id',
                        default: query.use_id,
                        defaultSet: true,
                      },
                      {
                        key: 'order_name',
                        default: false,
                        defaultSet: false,
                      },
                      {
                        key: 'order_phone',
                        default: '',
                        defaultSet: false,
                      },
                      {
                        key: 'address',
                        default: '',
                        defaultSet: false,
                      },
                      {
                        key: 'self_mention_id',
                        default: '',
                        defaultSet: false,
                      },
                      {
                        key: 'self_mention_address',
                        default: self_mention.address,
                        defaultSet: true,
                      },
                      {
                        key: 'supplier_id',
                        default: shop.supplier_id,
                        defaultSet: false,
                      },
                      {
                        key: 'note',
                        default: '',
                        defaultSet: false,
                      },
                      {
                        key: 'date',
                        default: DFormat(null, 'date'),
                        defaultSet: true,
                      },
                      {
                        key: 'creat_time',
                        default: Time,
                        defaultSet: true,
                      },
                      {
                        key: 'logistic',
                        default: '1',
                        defaultSet: true,
                      },
                      {
                        key: 'trans',
                        default: '1',
                        defaultSet: true,
                      },
                      {
                        key: 'acount',
                        default: acount,
                        defaultSet: true,
                      },
                      {
                        key: 'acount_list',
                        default: acount_list,
                        defaultSet: true,
                      },
                      {
                        key: 'share_id',
                        default: query.share_id ? (up_onoff ? self_mention.id : query.share_id) : '',
                        defaultSet: true,
                      },
                      {
                        key: 'share_type',
                        default: query.share_id ? (up_onoff ? '1' : '2') : '',
                        defaultSet: true,
                      }
                    ]
                    let str = checkAddLink(Arr, query);
                    var select_a = `INSERT INTO my_web.erha_order ` + str;
                    MQ_ok(select_a, res, (result_a) => { // 新增订单
                      // const result_a = {insertId: 6}
                      if (result_a) {
                        // let order_price = (parseFloat(query.shop_num) * parseFloat(shop.discount_price)); // 收到的钱
                        // let self_mention_proportion = (order_price * parseFloat(shop.self_mention_proportion)); // 自提点
                        // let share_proportion = (order_price * parseFloat(shop.share_proportion)); // 分享
                        // let earning_proportion = (order_price * parseFloat(shop.earning_proportion)); // 下线
                        // let supplier_price = (parseFloat(query.shop_num) * parseFloat(shop.supplier_price)); // 供货商
                        // let registration_p = (self_mention_proportion + (!query.share_id && up_onoff ? earning_proportion : 0) - (query.share_id ? share_proportion : 0))
                        // let profit = (order_price - supplier_price - registration_p)
                        let registration_p = self_mention_price + (query.share_type === 'mention' ? share_price : 0) + earning_price;
                        const Time = DFormat();
                        if (true) { // 修改自提点
                          let order_list = self_mention.order_list ? JSON.parse(self_mention.order_list) : [];
                          order_list.push(result_a.insertId)
                          order_list = JSON.stringify(order_list)
                          let money = (self_mention.money ? parseFloat(self_mention.money) : 0);
                          let total_money = (self_mention.total_money ? parseFloat(self_mention.total_money) : 0);
                          let booth_money = (self_mention.booth_money ? parseFloat(self_mention.booth_money) : 0);
                          let offline_money = (self_mention.offline_money ? parseFloat(self_mention.offline_money) : 0);
                          let product_money = (self_mention.product_money ? parseFloat(self_mention.product_money) : 0);
                          let account = self_mention.account ? JSON.parse(self_mention.account) : [];
                          account.push({
                            message: '订单',
                            type: 'add', // 自提点新增
                            pay: '用户', // 有ushance支付
                            money: registration_p.toFixed(2),
                            time: Time
                          })
                          account = JSON.stringify(account)
                          // let str2 = `order_list = '${order_list}'`;
                          let str2 = `account = '${account}'`;
                          str2 += `, order_list = '${order_list}'`;

                          str2 += `, money = '${(money + registration_p).toFixed(2)}'`;
                          str2 += `, total_money = '${(total_money + registration_p).toFixed(2)}'`;
                          str2 += `, booth_money = '${(booth_money + self_mention_price).toFixed(2)}'`;
                          if (!query.share_id && up_onoff) { // 下线
                            str2 += `, offline_money = '${(offline_money + earning_price).toFixed(2)}'`;
                          }
                          if (query.share_id) { // 分享
                            str2 += `, product_money = '${(product_money + share_price).toFixed(2)}'`;
                          }
                          var select2 = `update my_web.erha_self_mention set ` +
                          str2 +
                          ` where id = ${self_mention.id}`;
                          MQ_ok(select2, null, (result2) => { // 修改自提点 - ok
                            //
                          })
                        }
                        // 供应商
                        see_edit({ // 修改供应商
                          id: shop.supplier_id,
                          res: null,
                          table: 'my_web.erha_supplier',
                          edit: ['money', 'total_money', 'account', 'order_list'],
                          edit_fn: (edit) => {
                            let order_list = edit.order_list ? JSON.parse(edit.order_list) : [];
                            order_list.push(result_a.insertId)
                            order_list = JSON.stringify(order_list)
                            let money = edit.money ? parseFloat(edit.money) : 0;
                            let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                            let account = edit.account ? JSON.parse(edit.account) : [];
                            account.push({
                              message: '订单',
                              type: 'add', // 自提点新增
                              pay: '用户', // 有ushance支付
                              money: supplier_price.toFixed(2),
                              time: Time
                            })
                            account = JSON.stringify(account)
                            return {
                              money: (money + supplier_price).toFixed(2),
                              total_money: (total_money + supplier_price).toFixed(2),
                              account,
                              order_list
                            }
                          },
                          succeed: (result3) => {
                            //
                          },
                        })
                        // 修改商品
                        see_edit({
                          id: shop.id,
                          init_value: shop,
                          res: null,
                          table: 'my_web.erha_shop',
                          edit: ['purchase_record', 'amount', 'sale_amount', 'order_list'],
                          edit_fn: (edit) => {
                            let purchase_record = edit.purchase_record ? JSON.parse(edit.purchase_record) : [];
                            purchase_record.push({
                              id: query.use_id,
                              num: parseFloat(query.shop_num),
                              time: Time,
                              img: query.use_img
                            })
                            purchase_record = JSON.stringify(purchase_record)
                            let order_list = edit.order_list ? JSON.parse(edit.order_list) : [];
                            order_list.push(result_a.insertId)
                            order_list = JSON.stringify(order_list)
                            let amount = edit.amount ? parseFloat(edit.amount) : 0;
                            let sale_amount = edit.sale_amount ? parseFloat(edit.sale_amount) : 0;
                            return {
                              purchase_record,
                              order_list,
                              amount: amount - parseFloat(query.shop_num),
                              sale_amount: (sale_amount + parseFloat(query.shop_num)).toFixed(2)
                            }
                          },
                          succeed: (result3) => {
                            //
                          },
                        })
                        // 修改购买用户
                        see_edit({
                          id: query.use_id,
                          // init_value: null,
                          res: null,
                          table: 'my_web.erha_use',
                          edit: ['account', 'order_list'],
                          edit_fn: (edit) => {
                            let account = edit.account ? JSON.parse(edit.account) : [];
                            account.push({
                              message: '订单',
                              type: 'del', // 自提点新增
                              pay: '用户', // 有ushance支付
                              money: (- price).toFixed(2),
                              time: Time
                            })
                            account = JSON.stringify(account)
                            let order_list = edit.order_list ? JSON.parse(edit.order_list) : [];
                            order_list.push(result_a.insertId)
                            order_list = JSON.stringify(order_list)
                            return {
                              account,
                              order_list
                            }
                          },
                          succeed: (result3) => {
                            //
                          },
                        })
                        if (query.share_id && query.share_type === 'use') { // 是被人分享的
                          // 修改分享用户
                          see_edit({
                            id: query.share_id,
                            // init_value: null,
                            res: null,
                            table: 'my_web.erha_use',
                            edit: ['money', 'account', 'order_list', 'total_money'],
                            edit_fn: (edit) => {
                              let account = edit.account ? JSON.parse(edit.account) : [];
                              account.push({
                                message: '订单分享',
                                type: 'add', // 自提点新增
                                pay: '用户', // 有ushance支付
                                money: (share_price).toFixed(2),
                                time: Time
                              })
                              account = JSON.stringify(account)
                              let order_list = edit.order_list ? JSON.parse(edit.order_list) : [];
                              order_list.push(result_a.insertId)
                              order_list = JSON.stringify(order_list)
                              let money = edit.money ? parseFloat(edit.money) : 0;
                              let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                              return {
                                account,
                                order_list,
                                total_money: (total_money + share_price).toFixed(2),
                                money: (money + share_price).toFixed(2)
                              }
                            },
                            succeed: (result3) => {
                              //
                            },
                          })
                        }
                        // 公司
                        const this_date = DFormat('', 'date')
                        var select_company = 'select ' + '*' + ' from ' + 'my_web.erha_company' + ' order by id desc';
                        MQ_ok(select_company, null, (result_company) => {
                          if (result_company) {
                            const this_company = result_company.find(e => e.date === this_date);
                            if (this_company) {
                              see_edit({
                                id: this_company.id,
                                init_value: this_company,
                                res: null,
                                table: 'my_web.erha_company',
                                edit: ['order_list', 'income_list', 'income_money', 'pay_list', 'pay_money', 'profit', 'accu_profit', 'accu_pay', 'accu_income'],
                                edit_fn: (edit) => {
                                  let income_list = edit.income_list ? JSON.parse(edit.income_list) : [];
                                  income_list.push({
                                    message: '订单',
                                    type: 'add', // 自提点新增
                                    pay: '用户', // 有ushance支付
                                    money: price.toFixed(2),
                                    profit: profit.toFixed(2),
                                    time: Time
                                  })
                                  income_list = JSON.stringify(income_list)
                                  let pay_list = edit.pay_list ? JSON.parse(edit.pay_list) : [];;
                                  pay_list.push({
                                    message: '订单',
                                    type: 'del', // 自提点新增
                                    pay: '用户', // 有ushance支付
                                    money: (supplier_price + registration_p).toFixed(2),
                                    supplier_price: supplier_price.toFixed(2),
                                    registration_p: registration_p.toFixed(2),
                                    time: Time,
                                    self_mention_price: self_mention_price.toFixed(2),
                                    share_price: share_price.toFixed(2),
                                    earning_price: earning_price.toFixed(2)
                                  })
                                  pay_list = JSON.stringify(pay_list)
                                  //
                                  let order_list = edit.order_list ? JSON.parse(edit.order_list) : [];
                                  order_list.push(result_a.insertId)
                                  order_list = JSON.stringify(order_list)
                                  console.log(order_list)
                                  return {
                                    order_list,
                                    income_list,
                                    income_money: (parseFloat(edit.income_money) + price).toFixed(2),
                                    pay_list,
                                    pay_money: (parseFloat(edit.pay_money) + supplier_price + registration_p).toFixed(2),
                                    profit: (parseFloat(edit.profit) + profit).toFixed(2),
                                    accu_profit: (parseFloat(edit.accu_profit) + profit).toFixed(2),
                                    accu_pay: (parseFloat(edit.accu_pay) + supplier_price + registration_p).toFixed(2),
                                    accu_income: (parseFloat(edit.accu_income) + price).toFixed(2)
                                  }
                                },
                                succeed: (result3) => {
                                  setTimeout(() => {
                                    res.send({
                                      result: 'succeed',
                                      data: result_a,
                                    });
                                  }, 200)
                                },
                              })
                            } else {
                              let accu_profit = 0;
                              let accu_pay = 0;
                              let accu_income = 0;
                              result_company.forEach(ee => {
                                accu_profit += ee.profit ? parseFloat(ee.profit) : 0;
                                accu_pay += ee.pay_money ? parseFloat(ee.pay_money) : 0;
                                accu_income += ee.income_money ? parseFloat(ee.income_money) : 0;
                              });
                              let income_list = [];
                              income_list.push({
                                message: '订单',
                                type: 'add', // 自提点新增
                                pay: '用户', // 有ushance支付
                                money: price.toFixed(2),
                                profit: profit.toFixed(2),
                                time: Time
                              })
                              income_list = JSON.stringify(income_list)
                              let pay_list = [];
                              pay_list.push({
                                message: '订单',
                                type: 'del', // 自提点新增
                                pay: '用户', // 有ushance支付
                                money: (supplier_price + registration_p).toFixed(2),
                                supplier_price: supplier_price.toFixed(2),
                                registration_p: registration_p.toFixed(2),
                                time: Time,
                                self_mention_price: self_mention_price.toFixed(2),
                                share_price: share_price.toFixed(2),
                                earning_price: earning_price.toFixed(2)
                              })
                              pay_list = JSON.stringify(pay_list)
                              //
                              let order_list = [];
                              order_list.push(result_a.insertId)
                              order_list = JSON.stringify(order_list)
                              var Arr = [
                                {
                                  key: 'date',
                                  default: this_date,
                                  defaultSet: true,
                                },
                                {
                                  key: 'order_list',
                                  default: order_list,
                                  defaultSet: true,
                                },
                                {
                                  key: 'income_list',
                                  default: income_list,
                                  defaultSet: true,
                                },
                                {
                                  key: 'income_money',
                                  default: price.toFixed(2),
                                  defaultSet: true,
                                },
                                {
                                  key: 'pay_list',
                                  default: pay_list,
                                  defaultSet: true,
                                },
                                {
                                  key: 'pay_money',
                                  default: (supplier_price + registration_p).toFixed(2),
                                  defaultSet: true,
                                },
                                {
                                  key: 'profit',
                                  default: profit.toFixed(2),
                                  defaultSet: true,
                                },
                                {
                                  key: 'accu_profit',
                                  default: (accu_profit + profit).toFixed(2),
                                  defaultSet: true,
                                },
                                {
                                  key: 'accu_pay',
                                  default: (accu_pay + supplier_price + registration_p).toFixed(2),
                                  defaultSet: true,
                                },
                                {
                                  key: 'accu_income',
                                  default: (accu_income + price).toFixed(2),
                                  defaultSet: true,
                                }
                              ]
                              let str = checkAddLink(Arr, query);
                              var select_add_company = `INSERT INTO my_web.erha_company ` + str;
                              MQ_ok(select_add_company, null, (result_add_company) => {
                                setTimeout(() => {
                                  res.send({
                                    result: 'succeed',
                                    data: result_a,
                                  });
                                }, 200)
                              })
                            }
                          } else {
                            res.send({
                              result: 'succeed',
                              data: result_a,
                            });
                          }
                        })
                        // setTimeout(() => {
                        //   res.send({
                        //     result: 'succeed',
                        //     data: result_a,
                        //   });
                        // }, 20000)
                      } else {
                        res.send({
                          result: 'error',
                          message: '下单失败',
                        });
                      }
                    })
                  } else if (onoff === 1) {
                    res.send({
                      result: 'error',
                      message: '超过商品限购数量',
                    });
                  } else {
                    res.send({
                      result: 'error',
                      message: '下单失败',
                    });
                  }
                })
              } else {
                res.send({
                  result: 'error',
                  data: {},
                  message: '该自提点没有，或者已经下线了',
                });
              }
            })
          } else {
            res.send({
              result: 'error',
              data: {},
              message: '商品数据不足',
            });
          }
        } else {
          res.send({
            result: 'error',
            data: {},
            message: '错误的商品shop_id',
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
router.get('/del_order.json', function(req, res, next) { // 删除订单审核
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      let str = `del = '1'`
      var select = `update my_web.erha_order set ` +
      str +
      ` where id = ${query.id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: result[0],
          });
        } else {
          res.send({
            result: 'succeed',
            data: {},
          });
        }
      })

      // let str = `delete = '${query.id}'`
      // var select = `update my_web.erha_order set ` +
      // str +
      // ` where id = ${query.id}`;
      // MQ_ok(select, res, (result) => {
      //   res.send({
      //     result: 'succeed',
      //     data: result,
      //   });
      // })
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/del_pay_order.json', async function(req, res, next) { // 删除订单
  try {
    const query = req.query;
    // const query = req.body;
    if (query.order_id) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `id = ${query.order_id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          const order = result[0];
          if (order && order.del !== '3') {
            let str = `del = '${3}'`;
            var select_edit = `update my_web.erha_order set ` +
            str +
            ` where id = ${query.order_id}`;
            MQ_ok(select_edit, res, (result_edit) => {
              if (result_edit) {
                const Time = DFormat();
                if (order.acount) {
                  const acount = JSON.parse(order.acount);
                  const trans_onoff = order.trans === '2' || order.trans === '3' ? true : false;
                  // const acount = JSON.stringify({
                  //   price: price.toFixed(2),
                  //   supplier_price: supplier_price.toFixed(2), // 成本
                  //   self_mention_price: self_mention_price.toFixed(2), // 自提点
                  //   share_price: share_price.toFixed(2), // 分享
                  //   earning_price: earning_price.toFixed(2), // 下线
                  //   profit: profit.toFixed(2), // 利润
                  // });
                  const edit_arr = ['money', 'total_money', 'account'];
                  if (trans_onoff) {
                    edit_arr.push('extract_money');
                  }
                  // 供应商
                  see_edit({
                    id: order.supplier_id,
                    res: null,
                    table: 'my_web.erha_supplier',
                    edit: edit_arr,
                    edit_fn: (edit) => {
                      let money = edit.money ? parseFloat(edit.money) : 0;
                      let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                      let account = edit.account ? JSON.parse(edit.account) : [];
                      let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                      if (trans_onoff) {
                        extract_money = (extract_money - parseFloat(acount.supplier_price)).toFixed(2);
                      }
                      account.push({
                        message: '退单',
                        type: 'del', // 自提点新增
                        pay: '用户', // 有ushance支付
                        money: parseFloat(acount.supplier_price),
                        time: Time
                      })
                      account = JSON.stringify(account);
                      return {
                        money: (money - parseFloat(acount.supplier_price)).toFixed(2),
                        total_money: (total_money - parseFloat(acount.supplier_price)).toFixed(2),
                        extract_money: trans_onoff ? extract_money: undefined,
                        account
                      }
                    },
                    succeed: (result3) => {
                      //
                    },
                  })
                  
                  if (order.share_id && order.share_type === '2') { // 是被人分享的
                    // 修改分享用户
                    see_edit({
                      id: order.share_id,
                      // init_value: null,
                      res: null,
                      table: 'my_web.erha_use',
                      edit: edit_arr,
                      edit_fn: (edit) => {
                        let money = edit.money ? parseFloat(edit.money) : 0;
                        let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                        let account = edit.account ? JSON.parse(edit.account) : [];
                        let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                        if (trans_onoff) {
                          extract_money = (extract_money - parseFloat(acount.share_price)).toFixed(2);
                        }
                        account.push({
                          message: '退单',
                          type: 'del', // 自提点新增
                          pay: '用户', // 有ushance支付
                          money: parseFloat(acount.share_price),
                          time: Time
                        })
                        account = JSON.stringify(account);
                        return {
                          money: (money - parseFloat(acount.share_price)).toFixed(2),
                          total_money: (total_money - parseFloat(acount.share_price)).toFixed(2),
                          extract_money: trans_onoff ? extract_money: undefined,
                          account
                        }
                      },
                      succeed: (result3) => {
                        //
                      },
                    })
                  }
                  // 修改用户
                  if (!trans_onoff) {
                    see_edit({
                      id: order.use_id,
                      // init_value: null,
                      res: null,
                      table: 'my_web.erha_use',
                      edit: ['money', 'total_money', 'account', 'extract_money'],
                      edit_fn: (edit) => {
                        let money = edit.money ? parseFloat(edit.money) : 0;
                        let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                        let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                        let account = edit.account ? JSON.parse(edit.account) : [];
                        account.push({
                          message: '退单',
                          type: 'del', // 自提点新增
                          pay: '用户', // 有ushance支付
                          money: parseFloat(acount.price),
                          time: Time
                        })
                        account = JSON.stringify(account);
                        return {
                          money: (money + parseFloat(acount.price)).toFixed(2),
                          extract_money: (extract_money + parseFloat(acount.price)).toFixed(2),
                          total_money: (total_money + parseFloat(acount.price)).toFixed(2),
                          account
                        }
                      },
                      succeed: (result3) => {
                        //
                      },
                    })
                  } else {
                    see_edit({
                      id: order.use_id,
                      // init_value: null,
                      res: null,
                      table: 'my_web.erha_use',
                      edit: ['extract_detail', 'account'],
                      edit_fn: (edit) => {
                        let extract_detail = [];
                        try {
                          extract_detail = JSON.parse(edit.extract_detail)
                        } catch (error) {
                          //
                        }
                        extract_detail.push({
                          id: extract_detail.length + 1,
                          type: 'del',
                          describe: '退款',
                          price: acount.price,
                          do: '2',
                          message: '等待公司退款到用户',
                        })
                        let account = edit.account ? JSON.parse(edit.account) : [];
                        account.push({
                          message: '退单',
                          type: 'del', // 自提点新增
                          pay: '用户', // 有ushance支付
                          money: parseFloat(acount.price),
                          time: Time
                        })
                        account = JSON.stringify(account);
                        return {
                          extract_detail: JSON.stringify(extract_detail),
                          account
                        }
                      },
                      succeed: (result3) => {
                        //
                      },
                    })
                  }
                  // 公司
                  const this_date = DFormat(order.creat_time, 'date')
                  var select_company = 'select ' + '*' + ' from ' + 'my_web.erha_company';
                  MQ_ok(select_company, null, (result_company) => {
                    const this_company = result_company.find(e => e.date === this_date);
                    if (this_company) {
                      // console.log('erha_company11', this_company.id)
                      see_edit({
                        id: this_company.id,
                        init_value: this_company,
                        res: null,
                        table: 'my_web.erha_company',
                        edit: ['income_list', 'income_money', 'pay_list', 'pay_money', 'profit', 'accu_profit', 'accu_pay', 'accu_income'],
                        edit_fn: (edit) => {
                          console.log('del_pay_order | erha_company')
                          let income_list = edit.income_list ? JSON.parse(edit.income_list) : [];
                          income_list.push({
                            message: '退单',
                            type: 'del', // 自提点新增
                            pay: '用户', // 有ushance支付
                            money: acount.price,
                            profit: acount.profit,
                            time: Time
                          })
                          income_list = JSON.stringify(income_list)
                          let pay_list = edit.pay_list ? JSON.parse(edit.pay_list) : [];
                          const pay_money = parseFloat(acount.self_mention_price) + parseFloat(acount.share_price) + parseFloat(acount.earning_price)
                          pay_list.push({
                            message: '退单',
                            type: 'add', // 自提点新增
                            pay: '用户', // 有ushance支付
                            money: pay_money.toFixed(2),
                            supplier_price: acount.supplier_price,
                            time: Time,
                          })
                          pay_list = JSON.stringify(pay_list)
                          //
                          return {
                            income_list,
                            income_money: (parseFloat(edit.income_money) - parseFloat(acount.price)).toFixed(2),
                            pay_list,
                            pay_money: (parseFloat(edit.pay_money) + pay_money).toFixed(2),
                            profit: (parseFloat(edit.profit) - parseFloat(acount.profit)).toFixed(2),
                            accu_profit: (parseFloat(edit.accu_profit) - parseFloat(acount.profit)).toFixed(2),
                            accu_pay: (parseFloat(edit.accu_pay) + pay_money).toFixed(2),
                            accu_income: (parseFloat(edit.accu_income) - parseFloat(acount.price)).toFixed(2)
                          }
                        },
                        succeed: (result3) => {
                          //
                        },
                      })
                    }
                  })
                  // 自提点
                  see_edit({
                    id: order.self_mention_id,
                    res,
                    table: 'my_web.erha_supplier',
                    edit: edit_arr,
                    edit_fn: (edit) => {
                      const self_mention_price = parseFloat(acount.self_mention_price) + parseFloat(acount.share_price) + parseFloat(acount.earning_price)
                      let money = edit.money ? parseFloat(edit.money) : 0;
                      let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                      let account = edit.account ? JSON.parse(edit.account) : [];
                      let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                      if (trans_onoff) {
                        extract_money = (extract_money - self_mention_price).toFixed(2);
                      }
                      account.push({
                        message: '退单',
                        type: 'del', // 自提点新增
                        pay: '用户', // 有ushance支付
                        money: self_mention_price.toFixed(2),
                        time: Time
                      })
                      account = JSON.stringify(account);
                      return {
                        money: (money - self_mention_price).toFixed(2),
                        total_money: (total_money - self_mention_price).toFixed(2),
                        extract_money: trans_onoff ? extract_money: undefined,
                        account
                      }
                    },
                    succeed: (result3) => {
                      res.send({
                        result: 'succeed',
                        data: order,
                      });
                    },
                  })
                }
              }
            })
          } else {
            res.send({
              result: 'error',
              data: {},
              message: '已退单',
            });
          }
        } else {
          res.send({
            result: 'error',
            data: {},
            message: '查询错误',
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        message: 'order_id不能是空',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
/* 我的 */
router.post('/get_phone.json', async function(req, res, next) { // 获取手机
  try {
    var WXBizDataCrypt = require('../weixing_sdk/WXBizDataCrypt');
    const query = req.body;
    // const query = req.query;
    if (checkFn(['code', 'iv', 'encryptedData'], query, res)) {
      const appId = 'wxaecd312ea56d8603';
      const secret = '0f2cd57590d9222a7209a559af628476';
      const encryptedData = query.encryptedData;
      const iv = query.iv;
      const Url = encodeURI(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${query.code}&grant_type=authorization_code`);
      download(Url, function( val ) {
        if(val){
          const VAL = JSON.parse(val);
          const sessionKey = VAL.session_key; // val => sessionKey
          const pc = new WXBizDataCrypt(appId, sessionKey)
          const data = pc.decryptData(encryptedData , iv)
          res.send({
            data: data,
            VAL,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: '代码出错了',
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
router.post('/wx_sign.json', async function(req, res, next) { // 登录|注册
  try {
    var WXBizDataCrypt = require('../weixing_sdk/WXBizDataCrypt');
    const query = req.body;
    // const query = req.query;
    if (checkFn(['code', 'iv', 'encryptedData', 'name', 'head_img'], query, res)) {
      const appId = 'wxaecd312ea56d8603';
      const secret = '0f2cd57590d9222a7209a559af628476';
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
              var select = 'select ' + '*' + ' from ' + 'my_web.erha_use' + ' where ' + `phone = "${data.phoneNumber}"`    
              MQ_ok(select, res, (result) => {
                if (result[0]) { // 有是登录
                  const Item = result[0];
                  const address = Item.address;
                  if (address && typeof(address) === 'string') {
                    try {
                      Item.address =JSON.parse(address);
                    } catch (error) {
                      // 
                    }
                  }
                  delete Item.USE_PASSWORD;
                  if (Item.money_cart) {
                    Item.money_cart = JSON.parse(Item.money_cart);
                  }
                  const sign_in1 = Item.sign_in ? JSON.parse(Item.sign_in) : []
                  const time = DFormat();
                  const sign_in = JSON.stringify([
                    ...sign_in1,
                    {
                      time: time,
                      type: '登录'
                    }
                  ]);
                  let str = `sign_in = '${sign_in}'`;
                  var select3 = `update my_web.erha_use set ` +
                  str +
                  ` where phone = ${data.phoneNumber}`;
                  if (MQ(select3, (result3) => {
                    //
                  }, (err) => {
                    //
                  })) {
                    //
                  }
                  res.send({
                    result: 'succeed',
                    data: Item,
                  });
                } else { // 是注册
                  const Time = DFormat();
                  const sign_in = JSON.stringify([{
                    time: Time,
                    type: '注册'
                  }]);
                  let money = 0;
                  let total_money = 0;
                  let extract_money = 0;
                  const account = [];
                  let up_list = {};
                  if (query.type === '1' && query.share_id) {
                    up_list = {
                      type: 'self_mention',
                      id: query.share_id,
                    }
                    // money = 1;
                    // total_money = 1;
                    // extract_money = 1;
                    // account.push({
                    //   message: '新人奖励',
                    //   type: 'add', // 自提点新增
                    //   pay: 'ushance', // 有ushance支付
                    //   money: '1.00',
                    //   time: Time
                    // })
                  } else if (query.type === '2' && query.share_id) { // 用户
                    up_list = {
                      type: 'use',
                      id: query.share_id,
                    }
                    // money = 1;
                    // total_money = 1;
                    // extract_money = 1;
                    // account.push({
                    //   message: '新人奖励',
                    //   type: 'add', // 自提点新增
                    //   pay: 'ushance', // 有ushance支付
                    //   money: '1.00',
                    //   time: Time
                    // })
                  }
                  const Invitation_code = `${new Date().getTime()}|${data.phoneNumber}`;
                  var Arr = [
                    {
                      key: 'money',
                      default: money,
                      defaultSet: true,
                    },
                    {
                      key: 'up_list',
                      default: JSON.stringify(up_list),
                      defaultSet: true,
                    },
                    {
                      key: 'total_money',
                      default: total_money,
                      defaultSet: true,
                    },
                    {
                      key: 'extract_money',
                      default: extract_money,
                      defaultSet: true,
                    },
                    {
                      key: 'account',
                      default: JSON.stringify(account),
                      defaultSet: true,
                    },
                    {
                      key: 'name',
                      default: '',
                      defaultSet: false,
                    },
                    {
                      key: 'phone',
                      default: data.phoneNumber,
                      defaultSet: true,
                    },
                    {
                      key: 'head_img',
                      default: null,
                      defaultSet: false,
                    },
                    {
                      key: 'creation_time',
                      default: Time,
                      defaultSet: true,
                    },
                    {
                      key: 'sign_in',
                      default: sign_in,
                      defaultSet: true,
                    },
                    {
                      key: 'Invitation_code',
                      default: Invitation_code,
                      defaultSet: true,
                    }
                  ]
                  let str = checkAddLink(Arr, query);
                  var select2 = `INSERT INTO my_web.erha_use ` + str;
                  MQ_ok(select2, res, (result2) => {
                    if (result2) {
                      const back_data = {
                        id: result2.insertId,
                        name: query.name,
                        phone: data.phoneNumber,
                        head_img: query.head_img,
                        user_type: null,
                      };
                      if (query.type === '1' && query.share_id) { // 自提点
                        see_edit({
                          id: query.share_id,
                          res,
                          table: 'my_web.erha_self_mention',
                          edit: ['money', 'total_money', 'account', 'extract_money', 'code_use'],
                          edit_fn: (edit) => {
                            let money = edit.money ? parseFloat(edit.money) : 0;
                            let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                            let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                            let account = edit.account ? JSON.parse(edit.account) : [];
                            let code_use = edit.code_use ? JSON.parse(edit.code_use) : [];
                            // account.push({
                            //   message: '新人奖励',
                            //   type: 'add', // 自提点新增
                            //   pay: 'ushance', // 有ushance支付
                            //   money: '1.00',
                            //   time: Time
                            // })
                            account = JSON.stringify(account);
                            code_use.push(back_data.id);
                            code_use = JSON.stringify(code_use);
                            return {
                              money: (money + 0).toFixed(2),
                              total_money: (total_money + 0).toFixed(2),
                              extract_money: (extract_money + 0).toFixed(2),
                              account,
                              code_use
                            }
                          },
                          succeed: (result3) => {
                            res.send({
                              result: 'succeed',
                              data: back_data,
                            });
                          },
                        })
                      } else if (query.type === '2' && query.share_id) { // 用户
                        see_edit({
                          id: query.share_id,
                          // init_value: null,
                          res,
                          table: 'my_web.erha_use',
                          edit: ['money', 'total_money', 'account', 'extract_money', 'online_list'],
                          edit_fn: (edit) => {
                            let money = edit.money ? parseFloat(edit.money) : 0;
                            let total_money = edit.total_money ? parseFloat(edit.total_money) : 0;
                            let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                            let account = edit.account ? JSON.parse(edit.account) : [];
                            let online_list = edit.online_list ? JSON.parse(edit.online_list) : [];
                            account.push({
                              message: '新人奖励',
                              type: 'add', // 自提点新增
                              pay: 'ushance', // 有ushance支付
                              money: '1.00',
                              time: Time
                            })
                            account = JSON.stringify(account);
                            online_list.push(back_data.id);
                            online_list = JSON.stringify(online_list);
                            return {
                              money: (money + 0).toFixed(2),
                              extract_money: (extract_money + 0).toFixed(2),
                              total_money: (total_money + 0).toFixed(2),
                              account,
                              online_list
                            }
                          },
                          succeed: (result3) => {
                            res.send({
                              result: 'succeed',
                              data: back_data,
                            });
                          },
                        })
                      } else {
                        res.send({
                          result: 'succeed',
                          data: back_data,
                        });
                      }
                    } else {
                      res.send({
                        result: 'error',
                        errorCode: err,
                        message: '注册失败',
                      });
                    }
                  })
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
      var select = 'select ' + 'id, name, phone, head_img, address, money, total_money, extract_money, message, self_mention_id, pay_oder' + ' from ' + 'my_web.erha_use' + ' where ' + `phone = "${query.phone}"`
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: {
              ...result[0],
              pay_oder: result[0].pay_oder ? JSON.parse(result[0].pay_oder) : []
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
router.get('/get_order.json', function(req, res, next) { // 查询订单
  try {
    const query = req.query;
    // const query = req.body;
    if (query.id) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `id = ${query.id} and hidden is null`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: {
              ...result[0],
              creat_time: DFormat(result[0].creat_time)
            },
          });
        } else {
          res.send({
            result: 'succeed',
            data: {},
          });
        }
      })
    } else if (query.user_id && query.trans) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `use_id = ${query.user_id} and trans = ${query.trans} and hidden is null order by id desc`;
      MQ_ok(select, res, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result.map(e => ({
              ...e,
              creat_time: DFormat(e.creat_time)
            })),
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      })
    } else if (query.user_id) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `use_id = ${query.user_id} and hidden is null order by id desc`;
      MQ_ok(select, res, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result.map(e => ({
              ...e,
              creat_time: DFormat(e.creat_time)
            })),
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: 304,
        message: '请选择查询类型',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.get('/self_mention_detail.json', function(req, res, next) { // 查询自提点
  try {
    const query = req.query;
    // const query = req.body;
    if (query.id) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_self_mention' + ' where ' + `id = ${query.id} and hidden is null`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: {
              ...result[0],
              order_list: result[0].order_list ? JSON.parse(result[0].order_list) : [],
              address: result[0].address ? JSON.parse(result[0].address) : [],
            },
          });
        } else {
          res.send({
            result: 'succeed',
            data: {},
          });
        }
      })
    } else if (query.user_id) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_self_mention' + ' where ' + `user_id = ${query.user_id} and hidden is null`;
      MQ_ok(select, res, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result.map(e => ({
              ...e,
              order_list: e.order_list ? JSON.parse(e.order_list) : [],
            })),
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      })
    } else if (query.search) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_self_mention' + ' where ' + `hidden is null`;
      MQ_ok(select, res, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result.filter(e => e.name.includes(query.search)).map(e => ({
              ...e,
              order_list: e.order_list ? JSON.parse(e.order_list) : [],
              address: e.address ? JSON.parse(e.address) : [],
            })),
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      })
    } else if (query.latitude && query.longitude) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_self_mention' + ' where ' + `hidden is null`;
      MQ_ok(select, res, (result) => {
        if (result) {
          let Arr = result.map(e => {
            const latitude = parseFloat(query.latitude);
            const longitude = parseFloat(query.longitude);
            const latitude2 = parseFloat(e.latitude);
            const longitude2 = parseFloat(e.longitude);
            let onoff = false;
            let R2 = 1000000;
            if (latitude * latitude2 > 0 && longitude * longitude2 > 0) { // 统一方向同是北纬等
              onoff = true;
              R2 = `${Math.pow(latitude - latitude2, 2) + Math.pow(longitude - longitude2, 2)}`
            }
            if (onoff) {
              return ({
                ...e,
                order_list: e.order_list ? JSON.parse(e.order_list) : [],
                address: e.address ? JSON.parse(e.address) : [],
                query2: query,
                R2,
              })
            }
            return null
          }).filter(e => e).sort(function(a,b){
            return a.R2 - b.R2;
          }).slice(0, 9)
          // slice(0, 9)
          res.send({
            result: 'succeed',
            data: Arr,
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: 304,
        message: '请选择查询类型',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});
router.post('/out_money.json.json', function(req, res, next) { // 去提现 ----- ????
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id'], query, res)) {
      var Arr = [
        'shop_num',
        'order_price',
        'share_id',
        'hidden'
      ]
      let str = checkLink(Arr, query);
      var select = `update my_web.erha_shop_card set ` +
      str +
      ` where id = ${query.id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: result[0],
          });
        } else {
          res.send({
            result: 'succeed',
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
/* 商品详情页 */
router.post('/add_shop_card.json', function(req, res, next) { // 加入购物车 ---- ??
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['use_id', 'shop_id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_shop' + ' where ' + `id = "${query.shop_id}" and hidden is null`;
      MQ_ok(select, res, (result) => { // 查看商品
        if (result && result[0]) {
          const Item = result[0];
          const Time = DFormat();
          var Arr = [
            {
              key: 'name',
              default: Item.name,
              defaultSet: true,
            },
            {
              key: 'shop_id',
              default: Item.id,
              defaultSet: true,
            },
            {
              key: 'shop_img',
              default: Item.list_img,
              defaultSet: true,
            },
            {
              key: 'shop_num',
              default: 1,
              defaultSet: true,
            },
            {
              key: 'order_price',
              default: Item.discount_price,
              defaultSet: true,
            },
            {
              key: 'supplier_id',
              default: Item.supplier_id,
              defaultSet: true,
            },
            {
              key: 'use_id',
              default: 0,
              defaultSet: false,
            },
            {
              key: 'creat_time',
              default: Time,
              defaultSet: true,
            },
            {
              key: 'share_id',
              default: query.share_id ? query.share_id : 0,
              defaultSet: true,
            }
          ]
          let str = checkAddLink(Arr, query);
          var select2 = `INSERT INTO my_web.erha_shop_card ` + str;
          MQ_ok(select2, res, (result2) => { // 加入购物车
            if (result2) {
              let attention = Item.attention ? parseFloat(Item.attention) : 0;
              attention += 1;
              let str2 = `attention = '${attention}'`;
              var select3 = `update my_web.erha_shop set ` +
              str2 +
              ` where id = ${Item.id}`;
              MQ_ok(select3, res, (result3) => { // 改变商品关注度
                res.send({
                  result: 'succeed',
                  data: result2,
                });
              })
            } else {
              res.send({
                result: 'error',
                data: {},
                message: '加入购物车失败'
              });
            }
          })
      } else {
        res.send({
          result: 'error',
          data: {},
          message: '不存在该商品'
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
router.post('/set_self_mention.json', function(req, res, next) { // 选择自提点
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'use_id'], query, res)) {
      let str = `self_mention_id = '${query.id}'`
      var select = `update my_web.erha_use set ` +
      str +
      ` where id = ${query.use_id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: result[0],
          });
        } else {
          res.send({
            result: 'succeed',
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
/* 设置 */
router.get('/get_address.json', function(req, res, next) { // 查询地址
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_use' + ' where ' + `id = ${query.id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: result[0].address ? JSON.parse(result[0].address) : [],
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
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
router.post('/edit_address.json', function(req, res, next) { // 编辑地址
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'address'], query, res)) {
      let address = [];
      try {
        address = JSON.parse(query.address)
      } catch (error) {
        //
      }
      let str = `address = '${address}'`
      var select = `update my_web.erha_use set ` +
      str +
      ` where id = ${query.id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: result[0],
          });
        } else {
          res.send({
            result: 'succeed',
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
router.post('/code.json', function(req, res, next) { // 加邀请码 ---- ???
  try {
    // const query = req.query;
    const query = req.body;
    if (checkFn(['id', 'code'], query, res)) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_self_mention' + ' where ' + `invitation_code = ${query.code}`;
      MQ_ok(select, res, (result) => { // 查询自提点邀请码
        if (result && result[0]) {
          const Item = result[0];
          let code_use = Item.code_use ? JSON.parse(Item.code_use) : [];
          if (!code_use.includes(query.id)) {
            const Time = DFormat();
            code_use.push(query.id)
            JSON.stringify(code_use)
            let registration_money = Item.registration_money ? parseFloat(Item.registration_money) : 0;
            registration_money += 0;
            let account = Item.account ? JSON.parse(Item.account) : [];
            account.push({
              message: '注册邀请',
              type: 'add', // 自提点新增
              pay: '公司', // 有ushance支付
              money: 0,
              time: Time
            })
            JSON.stringify(account);
            let money = Item.money ? parseFloat(Item.money) : 0;
            money += 0;
            let total_money = Item.total_money ? parseFloat(Item.total_money) : 0;
            total_money += 0;
            let extract_money = Item.extract_money ? parseFloat(Item.extract_money) : 0;
            extract_money += 0;

            let str = `code_use = '${code_use}'`;
            str += `, registration_money = '${registration_money}'`;
            str += `, account = '${account}'`;
            str += `, money = '${money}'`;
            str += `, total_money = '${total_money}'`;
            str += `, extract_money = '${extract_money}'`;
            var select2 = `update my_web.erha_self_mention set ` +
            str +
            ` where id = ${Item.id}`;
            MQ_ok(select2, res, (result2) => { // 更新自提点信息
              //
            })
            // let str2 = `account = '${account}'`;
            // str2 += `, money = '${money}'`;
            // str2 += `, total_money = '${total_money}'`;
            // str2 += `, extract_money = '${extract_money}'`;
            // var select3 = `update my_web.erha_use set ` +
            // str2 +
            // ` where id = ${query.id}`;
            // MQ_ok(select3, res, (result3) => { // 被邀请对应用户
            //   //
            // })

            setTimeout(() => {
              res.send({
                result: 'succeed',
                data: Item,
              });
            }, 200)
          } else {
            res.send({
              result: 'succeed',
              data: {},
              message: '已加入邀请码',
            });
          }
        } else {
          res.send({
            result: 'error',
            data: {},
            message: '未知的邀请码',
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
/* 供应商 */
router.get('/get_supplier.json', function(req, res, next) { // 供应商
  try {
    const query = req.query;
    // const query = req.body;
    if (query.id) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_supplier' + ' where ' + `id = ${query.id} and hidden is null`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          res.send({
            result: 'succeed',
            data: {
              ...result[0],
              creat_time: DFormat(result[0].creat_time)
            },
          });
        } else {
          res.send({
            result: 'succeed',
            data: {},
          });
        }
      })
    } else if (query.user_id && query.trans) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `use_id = ${query.user_id} and trans = ${query.trans} and hidden is null order by id desc`;
      MQ_ok(select, res, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result.map(e => ({
              ...e,
              creat_time: DFormat(e.creat_time)
            })),
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      })
    } else if (query.user_id) {
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `use_id = ${query.user_id} and hidden is null order by id desc`;
      MQ_ok(select, res, (result) => {
        if (result) {
          res.send({
            result: 'succeed',
            data: result.map(e => ({
              ...e,
              creat_time: DFormat(e.creat_time)
            })),
          });
        } else {
          res.send({
            result: 'succeed',
            data: [],
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: 304,
        message: '请选择查询类型',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: error,
      message: '未知错误',
    });
  }
});

// 支付
const tenpay = require('tenpay');
const config = {
  appid: 'wxaecd312ea56d8603',
  mchid: '1558987061',
  partnerKey: 'lgyyzf1234lgyyzf1234lgyyzf123473',
  // pfx: require('fs').readFileSync('证书文件路径'),
  // pfx: fs.readFileSync('./public/ssl/weixin/apiclient_cert.p12', 'ascii'),
  pfx: fs.readFileSync( path.resolve(__dirname,"../../ssl/weixin/apiclient_cert.p12"), 'ascii'),
  notify_url: 'https://www.ushance.com/weixing_sdk/web/yanqian.json',
  // spbill_create_ip: 'IP地址'
};
const api = new tenpay(config, true);
router.post('/get_openid.json', async function(req, res, next) { // 获取openid
  try {
    const query = req.body;
    // const query = req.query;
    if (checkFn(['code'], query, res)) {
      const appId = 'wxaecd312ea56d8603';
      const secret = '0f2cd57590d9222a7209a559af628476';
      const Url = encodeURI(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${query.code}&grant_type=authorization_code`);
      download(Url, function( val ) {
        if(val){
          const VAL = JSON.parse(val);
          const openid = VAL.openid;
          res.send({
            data: openid,
            result: 'succeed',
            errorCode: 200,
            message: '',
          });
        } else {
          res.send({
            result: 'error',
            errorCode: 200,
            message: '代码出错了',
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

router.get('/get_pay.json', async function(req, res, next) { // 获取支付参数
  try {
    const query = req.query;
    if (checkFn(['id', 'price', 'name', 'describe', 'openid'], query, res)) {
      const params = {
        nonce_str: '5K8264ILsKCH16CQ2202SI8ZNMTM67VS',
        // spbill_create_ip: '127.0.0.1',
        out_trade_no: query.id,
        body: query.describe,
        total_fee: query.price,
        openid: query.openid,
        // trade_type: 'NATIVE',
        product_id: query.name
      }
      let result = await api.unifiedOrder({ // unifiedOrder getNativeUrl
        ...params
      });
      let result2 = await api.getPayParamsByPrepay({
        prepay_id: result.prepay_id,
      });
      res.send({
        data: result2,
        // prepay_id,
        // code_url,
        result: 'succeed',
        errorCode: 200,
        message: '',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

router.get('/pay.json', async function(req, res, next) { // 支付成功
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id', 'use_id', 'price'], query, res)) {
      var select_d = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `id = ${query.id}`;
      MQ_ok(select_d, res, (result_d) => {
        const order = result_d[0];
        if (order && `${order.trans}` !== '2') {
          let str = `trans = '${2}'`;
          str += `, pay_price = '${query.price}'`;
          var select = `update my_web.erha_order set ` +
          str +
          ` where id = ${query.id}`;
          MQ_ok(select, res, (result) => {
            if (result) {
              // 用户
              see_edit({
                id: query.use_id,
                // init_value: null,
                res: res,
                table: 'my_web.erha_use',
                edit: ['pay_detail'],
                edit_fn: (edit) => {
                  let pay_detail = edit.pay_detail ? JSON.parse(edit.pay_detail) : [];
                  pay_detail.push({
                    type: 'wx',
                    price: query.price,
                    time: DFormat()
                  })
                  return {
                    pay_detail: JSON.stringify(pay_detail),
                  }
                },
                succeed: (result3) => {
                  res.send({
                    result: 'succeed',
                    data: result,
                  });
                },
              })
            } else {
              res.send({
                result: 'error',
                data: {},
                message: '不存在该订单',
              });
            }
          })
        } else {
          res.send({
            result: 'error',
            data: {},
            message: '不存在该订单，或者已经确认支付',
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

router.get('/refund.json', async function(req, res, next) {
  try {
    // const query = req.query;
    const query = req.body;
    var WXPay = require('weixin-pay');
    if (checkFn(['id', 'price', 'refund_price'], query, res)) {
      var wxpay = WXPay({
          appid: 'wxaecd312ea56d8603',
          mch_id: '1558987061',
          partner_key: 'lgyyzf1234lgyyzf1234lgyyzf123473', //微信商户平台API密钥
          // pfx: fs.readFileSync('./public/ssl/weixin/apiclient_cert.p12'), //微信商户平台证书
          pfx: fs.readFileSync( path.resolve(__dirname,"../../ssl/weixin/apiclient_cert.p12"), 'ascii'),
      });
      var params = {
          appid: 'wxaecd312ea56d8603',
          mch_id: '1558987061',
          op_user_id: '1558987061',
          out_refund_no: '20140703'+Math.random().toString().substr(2, 10),
          total_fee: query.price, //原支付金额
          refund_fee: query.refund_price, //退款金额
          out_trade_no: query.id,
          // transaction_id: '4200000450201912221764995896'
      };
      wxpay.refund(params, function(err, result){
          console.log('refund', arguments);
          res.send({
            data: arguments[1],
            result: 'succeed',
            errorCode: 200,
            message: '2',
          });
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

router.get('/cash_money.json', async function(req, res, next) { // 提现
  try {
    const query = req.query;
    if (checkFn(['id', 'price', 'describe', 'openid'], query, res)) {
      // let result = await api.transfers({
      //   partner_trade_no: query.id,
      //   openid: 'obuWX5ASKSHhSdPsHC2FEIubQeu8',
      //   // re_user_name: '用户真实姓名',
      //   amount: 1,
      //   desc: '企业付款描述信息'
      // });
      res.send({
        data: 'result',
        // prepay_id,
        // code_url,
        result: 'succeed',
        errorCode: 200,
        message: '',
      });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

router.get('/get_money.json', async function(req, res, next) { // 提现
  try {
    const query = req.query;
    if (checkFn(['user_id', 'price'], query, res)) {
      // extract_detail
      var select = 'select ' + '*' + ' from ' + 'my_web.erha_use' + ' where ' + `id = ${query.user_id}`;
      MQ_ok(select, res, (result) => {
        if (result && result[0]) {
          const extract_detail = JSON.stringify({
            type: 'del',
            describe: '提现',
            price: query.price,
            do: '1',
            message: '等待公司提现到用户',
          });
          let str = `extract_detail = '${extract_detail}'`;
          str += `, apply_extract = '${query.price}'`;
          var select2 = `update my_web.erha_use set ` +
          str +
          ` where id = ${query.user_id}`;
          MQ_ok(select2, res, (result2) => {
            if (result2) {
              res.send({
                result: 'succeed',
                data: result2,
              });
            } else {
              res.send({
                result: 'error',
                data: {},
                message: '提现错误',
              });
            }
          })
        } else {
          res.send({
            result: 'error',
            data: {},
            message: '查询错误',
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

router.get('/get_money_ok.json', async function(req, res, next) { // 提现成功
  try {
    const query = req.query;
    if (checkFn(['user_id', 'price'], query, res)) {
      // extract_detail
      let onoff = true;
      see_edit({
        id: query.user_id,
        res,
        table: 'my_web.erha_use',
        edit: ['money', 'extract_money', 'extract_detail', 'apply_extract'],
        edit_fn: (edit) => {
          let apply_extract = edit.apply_extract ? parseFloat(edit.apply_extract) : 0;
          let price = query.price ? parseFloat(query.price) : 0;
          if (apply_extract < price) {
            onoff = false;
            return edit
          }
          const extract_detail = JSON.stringify({
            type: 'del',
            describe: '提现',
            price: query.price,
            message: '提现成功',
          });
          let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
          let money = edit.money ? parseFloat(edit.money) : 0;
          return {
            extract_money: (extract_money - price).toFixed(2),
            apply_extract: (apply_extract - price).toFixed(2),
            money: (money - price).toFixed(2),
            extract_detail: extract_detail,
          }
        },
        succeed: (result3) => {
          if (onoff) {
            res.send({
              result: 'succeed'
            });
          } else {
            res.send({
              result: 'error',
              message: '提现金额不能大于申请金额'
            });
          }
        },
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

router.get('/refund_money_ok.json', async function(req, res, next) { // 退款成功
  try {
    const query = req.query;
    if (checkFn(['user_id', 'extract_detail_id'], query, res)) {
      // extract_detail
      see_edit({
        id: query.user_id,
        res,
        table: 'my_web.erha_use',
        edit: ['extract_detail'],
        edit_fn: (edit) => {
          let extract_detail = [];
          try {
            extract_detail = JSON.parse(result[0].extract_detail);
            extract_detail = map(ee => `${ee.id}` === `${query.extract_detail_id}` ? ({
              ...ee,
              do: '',
              message: '退款成功',
            }) : ee)
          } catch (error) {
            //
          }
          extract_detail = JSON.stringify(extract_detail);
          return {
            extract_detail: extract_detail,
          }
        },
        succeed: (result3) => {
          res.send({
            result: 'succeed'
          });
        },
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

router.get('/order_ok.json', async function(req, res, next) { // 订单结算成功
  try {
    const query = req.query;
    // const query = req.body;
    if (checkFn(['id'], query, res)) {
      let str = `trans = '${3}'`;
      str += `, logistic = '${5}'`;
      var select_edit = `update my_web.erha_order set ` +
      str +
      ` where id = ${query.id}`;
      MQ_ok(select_edit, res, (result_edit) => {
        if (result_edit) {
          var select = 'select ' + '*' + ' from ' + 'my_web.erha_order' + ' where ' + `id = ${query.id}`;
          MQ_ok(select, res, (result) => {
            if (result && result[0]) {
              const order = result[0];
              if (order.acount) {
                const acount = JSON.parse(order.acount);
                // const acount = JSON.stringify({
                //   price: price.toFixed(2),
                //   supplier_price: supplier_price.toFixed(2), // 成本
                //   self_mention_price: self_mention_price.toFixed(2), // 自提点
                //   share_price: share_price.toFixed(2), // 分享
                //   earning_price: earning_price.toFixed(2), // 下线
                //   profit: profit.toFixed(2), // 利润
                // });
                // 供应商
                see_edit({
                  id: order.supplier_id,
                  res: null,
                  table: 'my_web.erha_supplier',
                  edit: ['extract_money'],
                  edit_fn: (edit) => {
                    let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                    return {
                      extract_money: (extract_money + parseFloat(acount.supplier_price)).toFixed(2),
                    }
                  },
                  succeed: (result3) => {
                    //
                  },
                })
                
                if (order.share_id && order.share_type === '2') { // 是被人分享的
                  // 修改分享用户
                  see_edit({
                    id: order.share_id,
                    // init_value: null,
                    res: null,
                    table: 'my_web.erha_use',
                    edit: ['extract_money'],
                    edit_fn: (edit) => {
                      let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                      return {
                        extract_money: (extract_money + parseFloat(acount.share_price)).toFixed(2),
                      }
                    },
                    succeed: (result3) => {
                      //
                    },
                  })
                }
                // 自提点
                see_edit({
                  id: order.self_mention_id,
                  res,
                  table: 'my_web.erha_self_mention',
                  edit: ['extract_money'],
                  edit_fn: (edit) => {
                    let extract_money = edit.extract_money ? parseFloat(edit.extract_money) : 0;
                    return {
                      extract_money: (extract_money + parseFloat(acount.self_mention_price) + parseFloat(acount.share_price) + parseFloat(acount.earning_price)).toFixed(2),
                    }
                  },
                  succeed: (result3) => {
                    res.send({
                      result: 'succeed',
                      data: order,
                    });
                  },
                })
              }
            } else {
              res.send({
                result: 'error',
                data: {},
                message: '查询错误',
              });
            }
          })
        } else {
          res.send({
            result: 'error',
            message: '订单结算失败',
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

// 获取用户二维码
// var gm = require('gm')
router.get('/get_use_code.json', async function(req, res, next) {
  try {
    const query = req.query;
    if (checkFn(['user_id'], query, res)) {
      var img = qr.image(`https://www.ushance.com/?type=erha*use_${query.user_id}`,{size :10});
      res.writeHead(200, {'Content-Type': 'image/png'});
      img.pipe(res);
      // gm().in('-page', '+0+0')//-page是设置图片位置，所有的图片以左上为原点，向右、向下为正
      //     .in('/img/goods/1.png')//底图，到这里第一张图就设置完了，要先设置参数，再设置图片
      //     .in('-resize', '200x200')//设置微信二维码图片的大小（等比缩放）
      //     .in('-page', '+100+100')//设置微信二维码图片的位置
      //     .in(img)//二维码图
      //     .in('-page', '+75+75')//logo图位置
      //     .in('/img/goods/2.png')//logo图
      //     .mosaic()//图片合成
      //     .write('Images/final.png', function (err) {//图片写入
      //         if (!!err) {
      //             console.log(err);
      //         } else {
      //             console.log('ok');
      //         }});
      // gm(img)
      //   .resize('200', '200')
      //   .stream(function (err, stdout, stderr) {
      //     var writeStream = fs.createWriteStream('/resized.png');
      //     stdout.pipe(writeStream);
      //   });
    }
  } catch (error) {
    res.send({
      result: 'error',
      errorCode: 200,
      message: '代码出错了',
    });
  }
});

module.exports = router;

//
