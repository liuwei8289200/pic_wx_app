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
    console.log("onLaunch 1111111111111111");
    // 检查用户登录状态
    this.checkUserLoginStatus();
  },
  
  // 每次进入小程序时执行
  onShow() {
    console.log('小程序显示，检查登录状态');
    // 每次进入小程序时都检查用户登录状态
    this.checkUserLoginStatus();
  },
  
  // 检查用户登录状态
  async checkUserLoginStatus() {
    try {
      const respone = await wx.cloud.callFunction({
        name: 'getOpenid'
      });
      
      console.log("getOpenid result:", respone);
      
      if (respone && respone.result) {
        const { status, openid, avatar, user_name } = respone.result;
        
        // 始终保存openId
        wx.setStorageSync('openId', openid);
        
        // 设置登录状态
        wx.setStorageSync('loginStatus', status);
        console.log("登录态 11111111", respone);
        if (status) {
          // 用户已登录，保存用户信息
          wx.setStorageSync('userInfo', {
            avatar: avatar,
            user_name: user_name
          });
        } else {
          // 用户未登录或登录已失效，清除用户信息
          wx.removeStorageSync('userInfo');
        }
        
        console.log("Storage openId:", openid);
        console.log("Login status:", status);
      }
    } catch (err) {
      console.error("检查登录状态失败:", err);
      // 登录失败时，确保清除登录状态
      wx.setStorageSync('loginStatus', false);
      wx.removeStorageSync('userInfo');
    }
  }
})
