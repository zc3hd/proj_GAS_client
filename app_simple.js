var Koa = require('koa');
var static = require('koa-static');
var path = require('path');
var conf = require('./api_server/conf.js');

var app = new Koa();
app.use(static(path.join(__dirname, `./${conf.web_dist}/`)));


// 路由
var Router = require('koa-router');
var api = new Router();

// 路由配置
api
  .post('/api/js_demo/font.do', async function(ctx) {
    var size = Math.floor(Math.random() * 200);
    size = size < 60 ? 60 : size;
    var color = Math.floor(Math.random() * 1000000);

    ctx.body = {
      size: size,
      color: color,
    };

  });

// 装载
app
  .use(api.routes())
  .use(api.allowedMethods());


app.listen(conf.api_port, function() {
  console.log("simple server is running at " + conf.api_port);
});