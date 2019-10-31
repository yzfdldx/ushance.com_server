const Json = {};
// 用户信息 ****************************
let loadList = [{
  id: 1,
  name: '1',
  password: 1,
  time: '2018-12-20T10:23:13',
  headSculpture: 'https://gw.alipayobjects.com/zos/rmsportal/dSgAWcWjrDRkKRjudiex.png',
}]

const seachIdLoadList = (id) => { // Id查询
  if (!id) return loadList
  if (Object.prototype.toString.call(id) === '[object Array]') {
    const Arr = [];
    id.forEach(element => {
      const Item = loadList.find(e => e.id == element);
      if (Item) Arr.push(Item);
    });
    return Arr
  } else {
    return loadList.find(e => e.id == id)
  }
}
Json['seachIdLoadList'] = seachIdLoadList;

const seachLoadList = (item) => { // Json查询
  if (!item || Object.prototype.toString.call(item) !== '[object Object]') return []
  let Json = null;
  let onoff = true;
  Object.keys(item).forEach(k => {
    const Item = loadList.find(e => e[k] == item[k]);
    if (!Item) {
      onoff = false;
    } else {
      Json = Item;
    }
  });
  if (onoff) {
    return Json
  }
  return null
}
Json['seachLoadList'] = seachLoadList;

const addLoadList = (item) => { // 新增
  if (!item || !item.id || !item.name) return -1
  const Item = loadList.find(e => e.id == item.id);
  const Item2 = loadList.find(e => e.name == item.name);
  if (Item || Item2) {
    return -1
  }
  loadList.push(item);
  return loadList.length
}
Json['addLoadList'] = addLoadList;

const editLoadList = (item) => { // 编辑
  if (!item || !item.id) return -1
  const Arr = [];
  let key = -1;
  loadList.forEach((element, k) => {
    if (element === item.id){
      const Item = JSON.parse(JSON.stringify(item));
      Arr.push({
        ...element,
        ...Item
      });
      key = k;
    } else {
      Arr.push(element);
    }
  });
  return key
}
Json['editLoadList'] = editLoadList;

// 文章列表 ****************************
let articleList = [{
  id: 1,
  title: '有些梦，你只能想想',
  text: '右边请求数据右边请求数据右边请求数据右边请求数据右边请求数据右边请求数据右边请求右边请求数据右边请求数据右边请',
  src: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/GQdZUCycJoTkZuAeMMbI.jpg',
  time: '8月21号',
}]

const seachIdArticleList= (id) => { // Id查询
  if (!id) return articleList
  if (Object.prototype.toString.call(id) === '[object Array]') {
    const Arr = [];
    id.forEach(element => {
      const Item = articleList.find(e => e.id == element);
      if (Item) Arr.push(Item);
    });
    return Arr
  } else {
    return articleList.find(e => e.id === id);
  }
}
Json['seachIdArticleList'] = seachIdArticleList;

const addArticleList = (item) => { // 新增
  if (!item || !item.id || !item.name) return -1
  const Item = articleList.find(e => e.id == item.id);
  if (Item) {
    return -1
  }
  articleList.push(item);
  return item
}
Json['addArticleList'] = addArticleList;

const editArticleList = (item) => { // 编辑
  if (!item || !item.id) return -1
  const Arr = [];
  let key = -1;
  articleList.forEach((element, k) => {
    if (element === item.id){
      const Item = JSON.parse(JSON.stringify(item));
      Arr.push({
        ...element,
        ...Item
      });
      key = k;
    } else {
      Arr.push(element);
    }
  });
  return key
}
Json['editArticleList'] = editArticleList;

// 文章数据详情 ****************************
let articleJson = {
  1: {
    ownerId: 1,
    id: 1,
    title: '老神仙我很想念你!',
    img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/xcTMkCtXIZajsCaOcaaj.jpg',
    text: `亲爱的老神仙，您在天空看着我吗？您知道我很想你吗？\n` +
    `亲爱的老神仙，您在天空看着我吗？您知道我很想你吗亲爱的老神仙，您在天空看着我吗？您知道我很想你吗亲爱的老神仙，您在天空看着我吗？您知道我很想你吗？` +
    `亲爱的老神仙，您在天空看着我吗？您知道我很想你吗亲爱的老神仙，您在天空看着我吗？您知道我很想你吗亲爱的老神仙，您在天空看着我吗？您知道我很想你吗？`,
    time: '2017-23',
    // tag: 'sada',
    name: '农民',
    share: [{
      url: '#',
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
      title: '新浪微博'
    },{
      url: '#',
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
      title: '新浪微博'
    },{
      url: '#',
      img: 'https:\/\/gw.alipayobjects.com/zos/rmsportal/TWCaHlhroQYnwvSCfKZZ.png',
      title: '新浪微博'
    },{
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
      }],
    }]
  }
}

const seachIdArticleJson = (id) => { // Id查询
  if (!id) return null
  const D = JSON.parse(JSON.stringify(articleJson[id]));
  if (D) {
    return D
  } else {
    return null
  }
}
Json['seachIdArticleJson'] = seachIdArticleJson;

const editArticleJson = (item) => { // 编辑
  if (!item || !item.id) return -1;
  const D = articleJson[item.id];
  // const D = JSON.parse(JSON.stringify(articleJson[item.id]));
  if (D) {
    articleJson[item.id] = {
      ...articleJson[item.id],
      ...item.data,
    }
    return articleJson[item.id]
  } else {
    return -1
  }
}
Json['editArticleJson'] = editArticleJson;

const addArticleJson = (item) => { // 新增
  if (!item || !item.id || !item.name) return -1;
  if (articleJson[item.id]) {
    return -1
  }
  articleJson[item.id] = item;
  return Object.keys(articleJson).length
}
Json['addArticleJson'] = addArticleJson;

// 导出
module.exports = Json;

