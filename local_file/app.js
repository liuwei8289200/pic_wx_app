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
    
    // 检查用户登录状态
    this.checkUserLoginStatus();
  },
  
  // 检查用户登录状态
  async checkUserLoginStatus() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getOpenid'
      });
      
      console.log("getOpenid result:", result);
      
      if (result && result.result) {
        const { status, openid, userInfo } = result.result;
        
        // 始终保存openId
        wx.setStorageSync('openId', openid);
        
        // 设置登录状态
        wx.setStorageSync('loginStatus', status);
        
        if (status) {
          // 用户已登录，保存用户信息
          wx.setStorageSync('userInfo', userInfo || {});
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
  },
  
  // 更新用户信息
  async updateUserInfo(userInfo) {
    try {
      const openId = wx.getStorageSync('openId');
      if (!openId) return false;
      
      // 检查用户是否存在
      const { data } = await models.media_user.list({
        filter: {
          where: {
            _openid: openId
          }
        }
      });
      
      if (data && data.records && data.records.length > 0) {
        // 用户存在，更新信息
        const userId = data.records[0]._id;
        await models.media_user.update({
          id: userId,
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            updateTime: new Date()
          }
        });
      } else {
        // 用户不存在，创建新用户
        await models.media_user.create({
          data: {
            _openid: openId,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            createTime: new Date(),
            updateTime: new Date()
          }
        });
      }
      
      // 更新本地存储
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('loginStatus', true);
      
      return true;
    } catch (err) {
      console.error("更新用户信息失败:", err);
      return false;
    }
  }
})
