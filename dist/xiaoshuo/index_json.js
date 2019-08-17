var express = require('express');
var router = express.Router();
var https = require('https');
var cheerio = require("cheerio");

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

// https://www.xiashutxt.com/ 下书网 爬取 ****************************
router.get('/search.json', (req, res, next) => { // 查询列表
  var query = req.query;
  var Url = encodeURI(`https://www.xiashutxt.com/search.html?searchtype=${query.searchtype ? query.searchtype : 'all' }&searchkey=${query.searchkey}&page=${query.page ? query.page : '1'}`);
  download(Url, function( data ) {
    if(data){
      var $ = cheerio.load(data);
      var Arr = [];
      $("#waterfall .item").each(function(i,elem){
        var Json = {};
        $(this).find(".title a").each(function(i,elem){
          Json.name = $(this).text();
          try {
            Json.id = $(this).attr("href").split('?')[1].split('=')[1];
          } catch (error) {
            //
          }
        })
        $(this).find(".pic a img").each(function(i,elem){
          Json.img = $(this).attr("data-original");
        })
        $(this).find(".pic .nickname").each(function(i,elem){
          Json.author = $(this).text();
        })
        Arr.push(Json)
      })
      const page = {
        page: 1,
        pageSize: Arr.length,
        num: 0
      }
      $(".pagination>span").each(function(i,elem){
        try {
          page.num = $(this).text().split(' ')[1].split('条')[0];
        } catch (error) {
          //
        }
      })
      res.send({
        result: 'succeed',
        data: {
          list: Arr,
          page: page
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: '',
      });
    }
  })
});

router.get('/details.json', (req, res, next) => { // 文章详情
  const query = req.query;
  if (!query.id) {
    res.send({
      result: 'error',
      errorCode: 'id不存在',
    });
  }
  const Url = encodeURI(`https://m.xiashutxt.com/${query.id}/`); // https://m.xiashutxt.com/116053/
  download( Url , function( data ) {
    if(data){
      const $ = cheerio.load(data);
      const Url2 = encodeURI(`https://www.xiashutxt.com/${query.id}/down`);
      download( Url2 , function( data2 ) {
        if(data){
          const $2 = cheerio.load(data2);
          const img = $(".bookcover .pic>img").attr('src');
          const title = $(".bookcover .title").text();
          let author = '';
          let type = '';
          let chapters = '';
          let schedule = '';
          let time = '';
          $(".bookcover .gray").each(function(i,elem){
            if (i === 0) {
              author = $(this).find('a').text();
            } else if (i === 1) {
              type = $(this).text();
              try {
                type = $(this).text().split('：')[1];
              } catch (error) {
                //
              }
            } else if (i === 2) {
              chapters = $(this).find('span').text();
            } else if (i === 3) {
              schedule = $(this).find('span').text();
            } else if (i === 4) {
              time = $(this).text();
              try {
                time = $(this).text().split('：')[1];
              } catch (error) {
                //
              }
            }
          })
          let introduction = $(".bookintro .con").text();
          introduction = introduction.replace('[+展开]', '');
          let down = 'https://www.xiashutxt.com' + $2("#downlist .txt-download a").attr('href');
          res.send({
            result: 'succeed',
            data: {
              img,
              title,
              author,
              type,
              chapters,
              schedule,
              time,
              introduction,
              down
            }
          })
        } else {
          res.send({
            result: 'error',
            errorCode: '',
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: '',
      });
    }
  })
});

router.get('/catalog.json', (req, res, next) => { // 文章目录
  const query = req.query;
  if (!query.id) {
    res.send({
      result: 'error',
      errorCode: 'id不存在',
    });
  }
  const Url = encodeURI(`https://www.xiashutxt.com/${query.id}/`);
  download( Url , function( data ) {
    if(data){
      const $ = cheerio.load(data);
      const Url2 = encodeURI(`https://www.xiashutxt.com/api/ajax/zj?id=${query.id}&num=813&order=asc`);
      download( Url2 , function( data2 ) {
        if(data){
          const $2 = cheerio.load(data2);
          const Arr = [];
          $("#toplist li a").each(function(i,elem){ // 前面八章
            try {
              const Text = $(this).text().split(' ');
              Arr.push({
                key: Text[0].split('第')[1].split('章')[0],
                title: Text[0],
                name: Text[1],
              })
            } catch (error) {
              //
            }
          })
          $2("li a").each(function(i,elem){ // 隐藏的章节
            try {
              const Text = $(this).text().split(' ');
              Arr.push({
                key: Text[0].split('第')[1].split('章')[0],
                title: Text[0],
                name: Text[1],
              })
            } catch (error) {
              //
            }
          })
          $("#lastchapter li a").each(function(i,elem){ // 后面几章
            try {
              const Text = $(this).text().split(' ');
              Arr.push({
                key: Text[0].split('第')[1].split('章')[0],
                title: Text[0],
                name: Text[1],
              })
            } catch (error) {
              //
            }
          })
          res.send({
            result: 'succeed',
            data: Arr,
          })
        } else {
          res.send({
            result: 'error',
            errorCode: '',
          });
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: '',
      });
    }
  })
});

router.get('/text.json', (req, res, next) => { // 文章内容
  const query = req.query;
  if (!query.id) {
    res.send({
      result: 'error',
      errorCode: 'id不存在',
    });
  }
  const Url = encodeURI(`https://m.xiashutxt.com/${query.id}/read_${query.page ? query.page : '1'}.html`);
  download( Url , function( data ) {
    if(data){
      const $ = cheerio.load(data);
      // let pageKey = 0;
      // $("article .title>h1>a").each(function(i,elem){
      //   if (!$(this).attr("title")) return
      //   const a = $(this).attr("title").split(' ');
      //   xiashutxtData.name = a[0];
      //   pageKey = parseInt(a[1]);
      //   xiashutxtData[`page_${pageKey}`] = {
      //     title: a[2]
      //   };
      // })
      // $("article .title>.info a").each(function(i,elem){
      //   if (!$(this).attr("title")) return
      //   aa += '<br/>' + $(this).html();
      // })
      let title = $(".titlename").text();
      title = title ? title.split(' ') : []
      let Text = '';
      $(".articlecon p").each(function(i,elem){
        Text += '\n' + $(this).text();
      })
      // $("#chaptercontent").each(function(i,elem){
      //   // aa += $(this).attr("href");
      //   // Text += $(this).html();
      //   if ($(this).html() === '<br>') {
      //     console.log(332)
      //     Text += '<br/>';
      //     // Text += '\n';
      //   } else {
      //     Text += $(this).text();
      //   }
      // })
      res.send({
        result: 'succeed',
        data: {
          text: Text,
          title: title[1] ? title[1] : '',
          page: title[0] ? title[0] : ''
        }
      })
    } else {
      res.send({
        result: 'error',
        errorCode: '',
      });
    }
  })
});

module.exports = router;
