var Koa = require('koa');
var static = require('koa-static');
var path = require('path');
var conf = require('./api_server/conf.js');
var Router = require('koa-router');

var app = new Koa();


// -------------------------------------------------连接数据库
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + conf.db);
// 链接数据库
mongoose.connection.once('open', function() {
  console.log('数据库已连接');
});

// -------------------------------------------------处理post中间件
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());


// --------------------------------------------------API模块
var router = new Router();
var normal_api = require('./api_server/moudles/normal_api.js');
new normal_api(app, router).init();

// --------------------------------------------------GAS客户端文件
var gas_client = require('./gas_client.js');
new gas_client();



// --------------------------------------------------静态资源加载
app.use(static(path.join(__dirname, `./${conf.web_dist}/`)));



app.listen(conf.api_port, function() {
  console.log("API服务 启动在 端口:" + conf.api_port);
});