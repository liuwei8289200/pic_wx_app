// pages/home/home.js
import { installRouteBuilder } from '../index/route'
import { compareVersion, generateGridListNew, getPicListByDocidList } from '../index/utils'
const { screenWidth } = wx.getSystemInfoSync()
const { init } = require("@cloudbase/wx-cloud-client-sdk");
const client = init(wx.cloud)
const models = client.models
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gridList: [], // 初始化卡片列表
    cardWidth: (screenWidth - 4 * 2 - 4) / 2, // 减去间距
    hasUserInfo: false,
    userInfo: null,
    currentTab: 'likes', // 默认显示赞过的图片标签页
    active: 'like', // 当前活跃的标签
    screenWidth: screenWidth, // 屏幕宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkUserInfo();
    this.loadGridList(); // 加载卡片列表
  },

  /**
   * 检查用户信息
   */
  checkUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      hasUserInfo: !!userInfo && !!userInfo.user_name && !!userInfo.avatar,
      userInfo: userInfo || null
    });
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      active: tab === 'likes' ? 'like' : '' // 当切换到likes标签时，设置active为like
    });
    // 当切换到likes标签且用户已登录时，重新加载图片列表
    if (tab === 'likes' && this.data.hasUserInfo) {
      this.loadGridList();
    }
  },

  /**
   * 跳转到用户信息页面
   */
  goToUserProfile() {
    wx.navigateTo({
      url: '/pages/userProfile/userProfile',
      events: {
        // 监听用户信息更新
        userInfoUpdated: () => {
          this.checkUserInfo();
        }
      }
    });
  },

  /**
   * 退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          this.setData({
            hasUserInfo: false,
            userInfo: null
          });
        }
      }
    });
  },

  async loadGridList() {
    const imageRatio = [
      {
        width: 1,
        height: 1,
        imageRatio: 1 / 1,
      },
    ]
    const ans = [];
    const openid = wx.getStorageSync('openId');
    
    console.log("开始加载赞过的图片, openId:", openid);
    
    if (!openid) {
      this.setData({
        gridList: []
      });
      return;
    }
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });    
    // 获取用户点赞列表
    const { data: likeImagesData } = await models.user_info.get({
      select: {
        connect_user_like_images:true
      },
      filter: {
        where: {
          _id: {
            $eq: openid
          }
        }
      },
    });
    console.log("likeImagesData获取结果:", likeImagesData);
    const likeImages = likeImagesData.connect_user_like_images;
    console.log("点赞图片列表长度:", likeImages ? likeImages.length : 0);
    
    //将图片添加到gridList中
    if (!likeImages || likeImages.length === 0) {
      this.setData({
        gridList: []
      });
      wx.hideLoading();
      return;
    }
    
    // 遍历用户点赞的图片列表
    for (let i = 0; i < likeImages.length; i++) {
      const image = likeImages[i];

      const ratioIdx = Math.floor(Math.random() * imageRatio.length)
      const ratio = imageRatio[ratioIdx]
      const url = `https://6d69-mini-program-7gugok6cdb014aba-1258427370.tcb.qcloud.la/grid_images_online/${image.file_id}`;
          
      // 构建图片对象添加到gridList
      const short_title = image.title.split('：')[0];
      ans.push({
        // id 是自增序号
        id: ans.length,
        docid: image._id,
        ...ratio,
        src: url,
        like: image.like_num,
        content: image.description,
        title: image.title,
        short_title: short_title,
      });
    }
    
    console.log("准备设置gridList，数据长度:", ans.length);
    console.log("gridList第一项示例:", ans.length > 0 ? ans[0] : "无数据");
    
    this.setData({
      gridList: ans
    });
    
    console.log("设置gridList完成，当前数据:", this.data.gridList);
    
    wx.hideLoading();
  },

  navigateTo(e) {
    const { index, url, content, ratio, nickname } = e.currentTarget.dataset;
    const urlContent = `../../pages/detail/detail?index=${index}&url=${url}&content=${content}&ratio=${ratio}&nickname=${nickname}`;
    wx.navigateTo({
      url: urlContent,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时检查用户信息
    this.checkUserInfo();
    if (this.data.hasUserInfo) {
      this.loadGridList();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadGridList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 可以实现加载更多功能
  },

  loadMore() {
    // 可以实现加载更多功能
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的收藏',
      path: '/pages/index/index'
    };
  },

  // 创建数据库索引 - 仅在开发环境使用
  createDatabaseIndex() {
    wx.showLoading({
      title: '创建索引中...',
      mask: true
    });
    
    wx.cloud.callFunction({
      name: 'createMediaLikeIndex',
      data: {}
    }).then(res => {
      wx.hideLoading();
      console.log('创建索引结果:', res);
      wx.showToast({
        title: '索引创建成功',
        icon: 'success'
      });
    }).catch(err => {
      wx.hideLoading();
      console.error('创建索引失败:', err);
      wx.showToast({
        title: '索引创建失败',
        icon: 'none'
      });
    });
  },
})