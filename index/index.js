var ctx = null; // 画板
var timer = null; // 函数节流
const app = getApp()

Page({
  data: {
    url: 'https://oss.xiaosk.com/library/files/etms_nfo/2019/2019-04-08/628EEA9F78CA469B993B5E46CE5AE490/003.png',
    position: {
      x: Number,
      y: Number
    },
    canvansSize: {
      x: Number,
      y: Number
    },
    redoList: [], // 保存重做的快照
    undoList: [] // 保存撤销的快照
  },
  onLoad: function () {
    let that = this;

    // 获取画板的宽高
    wx.createSelectorQuery().select('.canvans').boundingClientRect(res => {
      this.data.canvansSize = {
        x: res.width,
        y: res.height
      }
    }).exec();

    // 初始化白板
    ctx = wx.createCanvasContext('canvas', this);

    // 首先保存下空白的快照 作为重做的底子
    ctx.draw(false, function() {
      that.savaCanvans();
    });
  },
  // 画笔开始
  onTouchStart(e) {
    const event = e.touches[0];
    this.setData({
      position: {
        x: event.x,
        y: event.y
      }
    });
  },
  // 画笔移动
  onTouchMove(e) {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        const event = e.touches[0];

        // 设置画笔颜色
        ctx.setStrokeStyle("#ff0000");
        // 设置线条宽度
        ctx.setLineWidth(3);
         // 让线条圆润
        ctx.setLineCap('round');
        // 开始绘画
        ctx.beginPath();
        ctx.moveTo(event.x, event.y);
        ctx.lineTo(this.data.position.x, this.data.position.y);
        ctx.stroke();
        ctx.draw(true);
        ctx.closePath();

        this.setData({
          position: {
            x: event.x,
            y: event.y
          }
        })
      }, 25);
    }
  },
  // 画笔结束
  onTouchEnd() {
    // 画笔结束时 对redoList池子里加一条记录 并且清空undoList池子
    setTimeout(() => {
      this.savaCanvans();
    }, 100);
  },
  // canvans快照
  savaCanvans() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'canvas',
      success: (res) => {
        this.data.redoList.unshift(res.tempFilePath);
        this.setData({
          redoList: this.data.redoList,
          undoList: []
        })
      }
    })
  },
  // 清除
  clearCanvans() {
    ctx.clearRect(0, 0, 1500, 1500);
    ctx.draw(true);
    const redoList = this.data.redoList.pop();
    this.setData({
      redoList: [redoList],
      undoList: []
    });
  },
  // 重做
  redo() {
    ctx.drawImage(this.data.redoList[1], 0, 0, this.data.canvansSize.x, this.data.canvansSize.y);
    ctx.draw();
    this.data.undoList.unshift(this.data.redoList.shift());
    this.setData({
      redoList: this.data.redoList,
      undoList: this.data.undoList
    })
  },
  // 撤销
  undo() {
    ctx.drawImage(this.data.undoList[0], 0, 0, this.data.canvansSize.x, this.data.canvansSize.y);
    ctx.draw();
    this.data.redoList.unshift(this.data.undoList.shift());
    this.setData({
      redoList: this.data.redoList,
      undoList: this.data.undoList
    })
  }
})
