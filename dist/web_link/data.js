'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Json = {};
// 用户信息 ****************************
var loadList = [{
  id: 1,
  name: '1',
  password: 1,
  time: '2018-12-20T10:23:13',
  headSculpture: 'https://gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png'
}];

var seachIdLoadList = function seachIdLoadList(id) {
  // Id查询
  if (!id) return loadList;
  if (Object.prototype.toString.call(id) === '[object Array]') {
    var Arr = [];
    id.forEach(function (element) {
      var Item = loadList.find(function (e) {
        return e.id == element;
      });
      if (Item) Arr.push(Item);
    });
    return Arr;
  } else {
    return loadList.find(function (e) {
      return e.id == id;
    });
  }
};
Json['seachIdLoadList'] = seachIdLoadList;

var seachLoadList = function seachLoadList(item) {
  // Json查询
  if (!item || Object.prototype.toString.call(item) !== '[object Object]') return [];
  var Json = null;
  var onoff = true;
  Object.keys(item).forEach(function (k) {
    var Item = loadList.find(function (e) {
      return e[k] == item[k];
    });
    if (!Item) {
      onoff = false;
    } else {
      Json = Item;
    }
  });
  if (onoff) {
    return Json;
  }
  return null;
};
Json['seachLoadList'] = seachLoadList;

var addLoadList = function addLoadList(item) {
  // 新增
  if (!item || !item.id || !item.name) return -1;
  var Item = loadList.find(function (e) {
    return e.id == item.id;
  });
  var Item2 = loadList.find(function (e) {
    return e.name == item.name;
  });
  if (Item || Item2) {
    return -1;
  }
  loadList.push(item);
  return loadList.length;
};
Json['addLoadList'] = addLoadList;

var editLoadList = function editLoadList(item) {
  // 编辑
  if (!item || !item.id) return -1;
  var Arr = [];
  var key = -1;
  loadList.forEach(function (element, k) {
    if (element === item.id) {
      var Item = JSON.parse(JSON.stringify(item));
      Arr.push(_extends({}, element, Item));
      key = k;
    } else {
      Arr.push(element);
    }
  });
  return key;
};
Json['editLoadList'] = editLoadList;

// 文章列表 ****************************
var articleList = [{
  id: 1,
  title: '有些梦，你只能想想',
  text: '右边请求数据右边请求数据右边请求数据右边请求数据右边请求数据右边请求数据右边请求右边请求数据右边请求数据右边请',
  src: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/GQdZUCycJoTkZuAeMMbI.jpg',
  time: '8月21号'
}];

var seachIdArticleList = function seachIdArticleList(id) {
  // Id查询
  if (!id) return articleList;
  if (Object.prototype.toString.call(id) === '[object Array]') {
    var Arr = [];
    id.forEach(function (element) {
      var Item = articleList.find(function (e) {
        return e.id == element;
      });
      if (Item) Arr.push(Item);
    });
    return Arr;
  } else {
    return articleList.find(function (e) {
      return e.id === id;
    });
  }
};
Json['seachIdArticleList'] = seachIdArticleList;

var addArticleList = function addArticleList(item) {
  // 新增
  if (!item || !item.id || !item.name) return -1;
  var Item = articleList.find(function (e) {
    return e.id == item.id;
  });
  if (Item) {
    return -1;
  }
  articleList.push(item);
  return item;
};
Json['addArticleList'] = addArticleList;

var editArticleList = function editArticleList(item) {
  // 编辑
  if (!item || !item.id) return -1;
  var Arr = [];
  var key = -1;
  articleList.forEach(function (element, k) {
    if (element === item.id) {
      var Item = JSON.parse(JSON.stringify(item));
      Arr.push(_extends({}, element, Item));
      key = k;
    } else {
      Arr.push(element);
    }
  });
  return key;
};
Json['editArticleList'] = editArticleList;

// 文章数据详情 ****************************
var articleJson = {
  1: {
    ownerId: 1,
    id: 1,
    title: '老神仙我很想念你!',
    img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/xcTMkCtXIZajsCaOcaaj.jpg',
    text: '\u4EB2\u7231\u7684\u8001\u795E\u4ED9\uFF0C\u60A8\u5728\u5929\u7A7A\u770B\u7740\u6211\u5417\uFF1F\u60A8\u77E5\u9053\u6211\u5F88\u60F3\u4F60\u5417\uFF1F\n' + '\u4EB2\u7231\u7684\u8001\u795E\u4ED9\uFF0C\u60A8\u5728\u5929\u7A7A\u770B\u7740\u6211\u5417\uFF1F\u60A8\u77E5\u9053\u6211\u5F88\u60F3\u4F60\u5417\u4EB2\u7231\u7684\u8001\u795E\u4ED9\uFF0C\u60A8\u5728\u5929\u7A7A\u770B\u7740\u6211\u5417\uFF1F\u60A8\u77E5\u9053\u6211\u5F88\u60F3\u4F60\u5417\u4EB2\u7231\u7684\u8001\u795E\u4ED9\uFF0C\u60A8\u5728\u5929\u7A7A\u770B\u7740\u6211\u5417\uFF1F\u60A8\u77E5\u9053\u6211\u5F88\u60F3\u4F60\u5417\uFF1F' + '\u4EB2\u7231\u7684\u8001\u795E\u4ED9\uFF0C\u60A8\u5728\u5929\u7A7A\u770B\u7740\u6211\u5417\uFF1F\u60A8\u77E5\u9053\u6211\u5F88\u60F3\u4F60\u5417\u4EB2\u7231\u7684\u8001\u795E\u4ED9\uFF0C\u60A8\u5728\u5929\u7A7A\u770B\u7740\u6211\u5417\uFF1F\u60A8\u77E5\u9053\u6211\u5F88\u60F3\u4F60\u5417\u4EB2\u7231\u7684\u8001\u795E\u4ED9\uFF0C\u60A8\u5728\u5929\u7A7A\u770B\u7740\u6211\u5417\uFF1F\u60A8\u77E5\u9053\u6211\u5F88\u60F3\u4F60\u5417\uFF1F',
    time: '2017-23',
    // tag: 'sada',
    name: '农民',
    share: [{
      url: '#',
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
      title: '新浪微博'
    }, {
      url: '#',
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
      title: '新浪微博'
    }, {
      url: '#',
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
      title: '新浪微博'
    }, {
      url: '#',
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
      title: '新浪微博'
    }],
    message: [{
      id: 1,
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png',
      name: '农民',
      time: '2017-12',
      text: '亲爱的老神仙，您在天空看着我吗？您知道我很想你吗？亲爱的老神仙，您在天空看着我吗？您知道我很想你吗？亲爱的老神仙，您在天空看着我吗？您知道我很想你吗？',
      reply: [{
        img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png',
        name: '天空',
        text: '文章写得不错',
        time: '2017-08'
      }]
    }]
  }
};

var seachIdArticleJson = function seachIdArticleJson(id) {
  // Id查询
  if (!id) return null;
  var D = JSON.parse(JSON.stringify(articleJson[id]));
  if (D) {
    return D;
  } else {
    return null;
  }
};
Json['seachIdArticleJson'] = seachIdArticleJson;

var editArticleJson = function editArticleJson(item) {
  // 编辑
  if (!item || !item.id) return -1;
  var D = articleJson[item.id];
  // const D = JSON.parse(JSON.stringify(articleJson[item.id]));
  if (D) {
    articleJson[item.id] = _extends({}, articleJson[item.id], item.data);
    return articleJson[item.id];
  } else {
    return -1;
  }
};
Json['editArticleJson'] = editArticleJson;

var addArticleJson = function addArticleJson(item) {
  // 新增
  if (!item || !item.id || !item.name) return -1;
  if (articleJson[item.id]) {
    return -1;
  }
  articleJson[item.id] = item;
  return Object.keys(articleJson).length;
};
Json['addArticleJson'] = addArticleJson;

// 导出
module.exports = Json;