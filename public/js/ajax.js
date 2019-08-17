
exports.get = (app, url, fn) => { // req.query--get请求的参数--req.query.name获取值-res.end();返回值
	app.all('*', function(req, res, next) {  // 设置头信息--跨域问题
    res.header("Access-Control-Allow-Origin", "*");  // 跨域问题
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  // 允许方法
//  res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");  // 文件类型
    next();
	});
	app.get(url, (req, res, next) => {fn(req, res, req.query, next);});
}
exports.post = (app, url, fn) => { // res.end();返回值
	app.all('*', function(req, res, next) {  // 设置头信息--跨域问题
    res.header("Access-Control-Allow-Origin", "*");  // 跨域问题
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  // 允许方法
//  res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");  // 文件类型
    next();
	});
	app.post(url, (req, res, next) => {fn(req, res, req.body, next);});

}

