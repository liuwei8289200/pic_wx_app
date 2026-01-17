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
  
  // 新增：小程序隐藏时保存数据
  onHide() {
    console.log('小程序隐藏，保存浏览记录');
    try {
      // 动态导入保存函数，避免循环依赖
      const { saveViewedImages } = require('./pages/index/utils');
      saveViewedImages();
    } catch (error) {
      console.error('保存浏览记录失败:', error);
    }
  },
  
  // 检查用户登录状态
  async checkUserLoginStatus() {
    try {
      console.log("开始调用 getOpenid 云函数");
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
      console.error("检查登录状态失败 - 详细错误:", err);
      console.error("错误码:", err.errCode);
      console.error("错误信息:", err.errMsg);
      
      // 如果是云函数不存在或500错误，给出友好提示
      if (err.errCode === -1 || err.errMsg.includes('500')) {
        console.warn("云函数调用失败，请检查云函数是否已部署");
      }
      
      // 登录失败时，确保清除登录状态
      wx.setStorageSync('loginStatus', false);
      wx.removeStorageSync('userInfo');
    }
  },

  globalData: {
    shareInfo: {
      title: '分享小程序',
      path: '/pages/index/index',
      imageUrl: '/images/logo.png'
    }
  },

  // 全局分享配置 - 分享给朋友
  onShareAppMessage() {
    return this.globalData.shareInfo;
  },

  // 全局分享配置 - 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.globalData.shareInfo.title,
      query: '',
      imageUrl: this.globalData.shareInfo.imageUrl
    }
  }
})