// app.js
App({
  onLaunch() {
    // const that = this;
    // // 获取系统信息
    // const systemInfo = wx.getSystemInfoSync();
    // // 胶囊按钮位置信息
    // const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // // 导航栏高度 = 状态栏高度 + 44
    // that.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
    // that.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    // that.globalData.menuTop=  menuButtonInfo.top;
    // that.globalData.menuHeight = menuButtonInfo.height;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'mini-program-7gugok6cdb014aba', // 替换为您的云开发环境ID
        traceUser: true,
      });
    }
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.cloud.callFunction({
      name: 'getOpenid',
      success: res => {
        console.log("getOpenid is ", res)
        wx.setStorageSync('openId', res.result.openid)
        console.log("Storage openId is ", wx.getStorageSync('openId'))
      }
    })
    // 登录（现在这个已经作废了）
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //     console.log("test11111111", res.code)
    //   }
    // })
  },
  // globalData: {
  //   userInfo: null,
  //   navBarHeight: 0, // 导航栏高度
  //   menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
  //   menuTop: 0, // 胶囊距底部间距（保持底部间距一致）
  //   menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
  // }
})
