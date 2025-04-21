// pages/home/home.js
import { installRouteBuilder } from '../index/route'
import { compareVersion, generateGridListNew, getPicListByDocidList } from '../index/utils'
const { screenWidth } = wx.getSystemInfoSync()
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
      currentTab: tab
    });
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

  loadGridList() {
    const imageRatio = [
      {
        width: 1,
        height: 1,
        imageRatio: 1 / 1,
      },
    ]
    const ans = [];
    const openid = wx.getStorageSync('openId');
    
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

    // 使用数据模型获取用户点赞列表
    const app = getApp();
    const { models } = app.cloudClient;
    
    // 获取用户点赞列表
    models.user_like_list.list({
      filter: {
        where: {
          openid: openid
        }
      }
    }).then(async (userLikeResult) => {
      const userLikeData = userLikeResult.data;
      
      // 判断结果是否为空
      if (!userLikeData || !userLikeData.records || userLikeData.records.length === 0) {
        this.setData({ gridList: [] });
        wx.hideLoading();
        return;
      }
      
      const docidList = userLikeData.records[0].like_pic_docid_list;
      
      // 判断点赞列表是否有效
      if (!docidList || docidList.trim() === '') {
        this.setData({ gridList: [] });
        wx.hideLoading();
        return;
      }
      
      // 解析图片ID列表
      const docidArray = docidList.split(',').map(id => id.trim()).filter(id => id !== '');
      
      if (docidArray.length === 0) {
        this.setData({ gridList: [] });
        wx.hideLoading();
        return;
      }
      
      try {
        // 获取图片详情
        const imageList = await getPicListByDocidList(docidArray);
        
        // 为每个图片获取点赞数
        const imageIds = imageList.map(item => item._id);
        const likeCountsPromises = imageIds.map(id => 
          models.media_like.count({
            filter: {
              where: {
                image_id: { $eq: id },
                status: 1
              }
            }
          })
        );
        
        // 等待所有点赞数查询完成
        const likeCountsResults = await Promise.all(likeCountsPromises);
        
        // 构建点赞数映射
        const likeCounts = {};
        imageIds.forEach((id, index) => {
          likeCounts[id] = likeCountsResults[index].data.count || 0;
        });
        
        // 构建图片列表
        imageList.forEach(item => {
          const ratioIdx = Math.floor(Math.random() * imageRatio.length);
          const ratio = imageRatio[ratioIdx];
          const url = `https://6d69-mini-program-7gugok6cdb014aba-1258427370.tcb.qcloud.la/grid_images/${item.file_id}`;
          const short_title = item.title.split('：')[0];
          
          // 使用查询到的点赞数
          const likeCount = likeCounts[item._id] !== undefined 
            ? likeCounts[item._id] 
            : (item.likeCount || 0);
          
          ans.push({
            id: ans.length,
            docid: item._id,
            ...ratio,
            src: url,
            like: likeCount,
            content: item.desc,
            title: item.title,
            short_title: short_title,
          });
        });
        
        this.setData({ gridList: ans });
      } catch (error) {
        console.error('获取图片或点赞数据失败:', error);
        this.setData({ gridList: [] });
      } finally {
        wx.hideLoading();
      }
    }).catch(error => {
      console.error('获取用户点赞列表失败:', error);
      this.setData({ gridList: [] });
      wx.hideLoading();
    });
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
  }
})