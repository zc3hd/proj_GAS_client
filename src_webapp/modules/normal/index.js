function App() {
  this.api = {
    list: "/api/normal/list",
    add: "/api/normal/add",
    del: "/api/normal/del",
  };
}
App.prototype = {
  // 
  init: function() {
    this.list();
    this.add();
    this.del();

    this.json();
  },
  list: function() {
    var me = this;

    $('#list').html("").hide();
    var item;
    $.ajax({
        url: me.api.list,
        dataType: "json",
        type: "POST",
      })
      .done(function(arr) {
        if (arr.length == 0) {
          return;
        }
        $('#list').show();
        arr.forEach(function(item, index) {
          item = $(`<div class="item">
                      <span class="l info" style="animation-delay:${index / arr.length*5}s">${item.info}</span>
                      <span class="l">${item.time}</span>
                      <span class="r del" _id=${item._id}>del</span>
                    </div>`);
          $('#list').append(item);
        });


      })
  },
  add: function() {
    var me = this;
    $('#add').on("click", function() {
      $.ajax({
          url: me.api.add,
          dataType: "json",
          type: "POST",
          data: {
            info: "" + Math.floor(Math.random() * 100000),
            time: me._time()
          }
        })
        .done(function(res) {
          me.list();
        });
    });
  },
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
  del: function() {
    var me = this;
    $('#list').on("click", ".del", function() {
      $.ajax({
          url: me.api.del,
          dataType: "json",
          type: "POST",
          data: { _id: $(this).attr("_id") }
        })
        .done(function(res) {
          me.list();
        });
    });
  },
  json: function() {
    var me = this;
    $('#list_json').html("").hide();
    var one;
    $.getJSON("./index.json", function(arr) {
      console.log(arr);
      if (arr.length == 0) {
        return;
      }
      $('#list_json').show();

      arr.forEach(function(item, index) {
        console.log(item);

        one = $(`<div class="item"></div>`);
        for (var key in item) {
          one.append($(`<span class="l" style="width:100px;">${key}:${item[key]}</span>`))
        }

        $('#list_json').append(one);
      });


    })
  },
};



new App().init();



// $.ajax({
//   url: "/api/js_demo/font.do",
//   dataType: "json",
//   type: "POST",
// })
//   .done(function (data) {
//     // *********************************************测试数据
//     // var size = Math.floor(Math.random() * 200);
//     // if (size < 60) {
//     //   size = 60;
//     // }
//     // var color = Math.floor(Math.random() * 1000000);
//     // *********************************************测试数据

//     // CSS设置
//     $('#demo').css({
//       fontSize: data.size + "px",
//       color: '#' + data.color
//     });

//     // 显示信息
//     $('#info').html(`fontSize:${data.size}px; color:#${data.color}`);

//     // 
//     setTimeout(function (argument) {
//       this.init();
//     }.bind(this), 2000);

//   }.bind(this));