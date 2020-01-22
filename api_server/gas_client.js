var axios = require('axios');
var fs = require('fs-extra');
var path = require('path');
var process = require('child_process');


// 配置项
var conf = {
  //  服务IP
  GAS_server_ip: "127.0.0.1",
  // 服务端口
  GAS_server_port: 1011,
  // 请求地址
  GAS_url: "/api/gas",
  // 请求b标识
  GAS_flag: "gas_client",
}

function CL() {
  var me = this;
  // 请求过来的数据挂载到全局
  me.opt = {};

  // setInterval(function() {
  //   me.init();
  // }, 24 * 3600 * 1000);

  me.init();

};
CL.prototype = {
  init: function() {
    var me = this;
    // 获取请求
    axios
      .post(`http://${conf.GAS_server_ip}:${conf.GAS_server_port}${conf.GAS_url}`, {
        flag: conf.GAS_flag,
      })
      .then(function(data) {
        // console.log(res.data);
        data = data.data;

        // 今日不能提交
        if (data.res == -1) {
          console.log("**************今日 不是 push日**************");
          return;
        }
        console.log("**************今日 是 push日**************");
        // 今日可提交
        me.opt = data;
        console.log(" 1.获取到GAS_server的client配置项");

        // 开启执行计划
        me._exec_plans();

        // 执行一次
        // me._exec();
      });
  },
  // ----------------------------------------------------计算今日提交几次，且什么时候提交
  _exec_plans: function() {
    var me = this;

    // 今日提交几次
    me.opt.dayPush = me.opt.dayPush_min + Math.floor(Math.random() * (me.opt.dayPush_max - me.opt.dayPush_min + 1));

    // ******测试数据
    me.opt.dayPush = 3;
    console.log(` 2.今日提交 ${me.opt.dayPush} 条`);


    // 计算每个任务的等待时间
    var arr = me._exec_plans_time();
    // *******测试数据
    for (var j = 0; j < arr.length; j++) {
      arr[j] = (j + 1) * 10 * 1000;
    }
    console.log(` 3.提交时间间隔 ${arr}`);

    // 按照计算的时间执行
    for (var i = 0; i < arr.length; i++) {
      setTimeout(function() {
        console.log(` 4.执行一次提交`);
        me._exec();
      }, arr[i]);
    }

  },
  // 计算每个任务的等待时间
  _exec_plans_time: function() {
    var me = this;


    // 时间戳差：记录今日结束，还有多长时间
    me.opt.len = me._stamp() + 24 * 3600 * 1000 - Date.now() - 1 * 3600 * 100;

    var arr = [];
    var sum = 0;
    // 随机生成每项任务的执行等待间隔时间
    for (var i = 0; i < me.opt.dayPush - 1; i++) {
      arr[i] = Math.floor(me.opt.len / me.opt.dayPush * Math.random());
      sum += arr[i];
    }
    arr[me.opt.dayPush - 1] = me.opt.len - sum;


    // 修改数组：获得得到每项任务的执行等待时间
    for (var j = 0; j < arr.length; j++) {
      arr[j] = (arr[j - 1] ? arr[j - 1] : 0) + arr[j]
    }

    return arr;
  },




  // ----------------------------------------------------执行一次
  // 提交：
  _exec: function() {
    var me = this;

    // 1.读取文件
    me._read()
      .then(function(arr) {
        console.log(`  4.1 读取文件成功`);

        // 2.数组修改
        arr = me._upd(arr);
        console.log(`  4.2 修改文件内容`);

        // 3.写入文件
        return me._write(arr)
      })
      .then(function(res) {

        console.log(`  4.3 保存文件成功`);
        // 4. 提交一次
        return me._push();
      })
  },
  // 读取文件
  _read: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      fs.readJson(path.join(__dirname, me.opt.filePath))
        .then(function(data) {

          resolve(data);
        })
    });
  },
  // 添加数据
  _upd: function(arr) {
    var me = this;
    // 超过文件内容的上限，修剪为最少长度
    if (arr.length >= me.opt.fileCont_max) {
      arr = arr.splice(0, me.opt.fileCont_min);
    }

    // 拿到一次要添加的数据，最随机变化
    var fileCont = JSON.parse(me.opt.fileCont);
    for (var key in fileCont) {
      fileCont[key] = fileCont[key] + Math.floor(Math.random() * 100000);
    }
    // 添加时间
    fileCont.time = me._time();

    // 添加到数组的最前面
    arr.unshift(fileCont);
    // 返回
    return arr;
  },
  // 写入文件
  _write: function(arr) {
    var me = this;
    return new Promise(function(resolve, reject) {
      fs.outputJson(path.join(__dirname, me.opt.filePath), arr)
        .then(function(data) {
          resolve(data);
        });
    });
  },
  // 提交
  _push: function() {
    var me = this;
    return new Promise(function(resolve, reject) {
      // 一般都是webapp 文件改变，如果api文件改变，需要重启，
      // 这里会自动向GitHub上下载webapp文件
      me._cmd(`git pull origin master`)
        .then(function() {
          console.log(`  4.4 下拉线上成功`);


          // -----------------------------------------------找到 要提交的目录
          return me._cmd(`git add ${path.join(__dirname, '../')}`);
        })
        .then(function() {
          console.log(`  4.5 git add ..`);



          // -----------------------------------------------做提交的注释commit
          return me._cmd(`git commit -m "upd: ${me._time()}"`);
        })
        .then(function() {
          console.log(`  4.6 git commit -m "upd: ${me._time()}"`);



          // ------------------------------------------------提交
          return me._cmd(`git push -u origin master`)
        })
        .then(function() {
          console.log(`  4.7 git push -u origin master`);

          console.log('******************push GitHub success*******************');
          resolve();
        });
    });

  },







  // ----------------------------------------------------------工具
  // 获取当前系统时间戳
  _time: function() {
    var date, y, m, r, HH, mm, ss;
    date = new Date();
    y = date.getFullYear();
    m = date.getMonth() + 1;
    r = date.getDate();
    HH = date.getHours();
    mm = date.getMinutes();
    ss = date.getSeconds();

    return `${y}-${m}-${r} ${HH}:${mm}:${ss}`;
  },
  // 命令
  _cmd: function(shell) {
    return new Promise(function(resolve, reject) {
      process.exec(shell, function(error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        // console.log(stdout, stderr)
        resolve();
      });
    });
  },
  // 今日时间戳
  _stamp: function() {
    var date, y, m, r;
    date = new Date();
    y = date.getFullYear();
    m = date.getMonth();
    r = date.getDate();
    date = new Date(y, m, r);
    return date.valueOf();
  },

}


module.exports = CL;