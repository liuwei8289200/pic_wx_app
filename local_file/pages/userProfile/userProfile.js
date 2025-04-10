// pages/userProfile/userProfile.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    nickname: ''
  },
  
  onLoad() {
    // 获取已存储的用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (userInfo.avatarUrl) {
      this.setData({
        avatarUrl: userInfo.avatarUrl
      });
    }
    if (userInfo.nickName) {
      this.setData({
        nickname: userInfo.nickName
      });
    }
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl
    });
  },
  
  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    });
  },
  
  saveUserInfo() {
    if (!this.data.nickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    // 保存用户信息
    const userInfo = {
      avatarUrl: this.data.avatarUrl,
      nickName: this.data.nickname,
      _openid: wx.getStorageSync('openId') || ''
    };
    
    wx.setStorageSync('userInfo', userInfo);
    
    // 触发用户信息更新事件
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel && eventChannel.emit) {
      eventChannel.emit('userInfoUpdated', userInfo);
    }
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
}); 