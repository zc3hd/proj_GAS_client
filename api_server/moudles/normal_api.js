var Router = require('koa-router');

function API(app, router) {
  var me = this;

  // 路由设计
  me.api = new Router();


  // 路由装载
  me.app = app;
  me.router = router;


  // 业务数据模型
  me.md_normal = require('../collection/normal_model.js');
}

API.prototype = {
  init: function() {
    var me = this;

    // 设计
    me.api
      // 获取全部数据
      .post('/list', async function(ctx) {
        var res = await me._list();
        ctx.body = res;
      })
      // 新增一条数据
      .post('/add', async function(ctx) {
        var res = await me._add(ctx.request.body);
        ctx.body = res;
      })
      // 删除一条
      .post('/del', async function(ctx) {
        var res = await me._del(ctx.request.body._id);
        ctx.body = res;
      });

    // 设置前缀
    me.router.use('/api/normal',
      me.api.routes(),
      me.api.allowedMethods());


    // 加载当前API
    me.app
      .use(me.router.routes())
      .use(me.router.allowedMethods());

  },
  _list: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_normal
        .find()
        // 倒序：从大到小
        .sort({ '_id': -1 })
        .then(function(data) {
          resolve(data);
        });
    });
  },
  _add: function(obj) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_normal
        .create(obj)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 
  _del: function(_id) {
    var me = this;
    return new Promise(function(resolve, reject) {
      me.md_normal
        .findByIdAndRemove(_id)
        .then(function(data) {
          resolve(data);
        });
    });
  }
};

module.exports = API;