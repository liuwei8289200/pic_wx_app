// app.js
const { init } = require("@cloudbase/wx-cloud-client-sdk");
const client = init(wx.cloud);
const models = client.models;
App({
  onLaunch() {
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
  }
})
