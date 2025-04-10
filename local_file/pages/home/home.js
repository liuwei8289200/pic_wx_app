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
      hasUserInfo: !!userInfo && !!userInfo.nickName && !!userInfo.avatarUrl,
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
      // {
      //   width: 3,
      //   height: 4,
      //   imageRatio: 3 / 4,
      // },
      // {
      //   width: 4,
      //   height: 3,
      //   imageRatio: 4 / 3,
      // },
      {
        width: 1,
        height: 1,
        imageRatio: 1 / 1,
      },
    ]
    const ans = [];
    const openid = wx.getStorageSync('openId');
    console.log("openid is", openid);

    if (!openid) {
      this.setData({
        gridList: []
      });
      return;
    }

    wx.cloud.callFunction({
      name: 'dbCommand',
      data: {
        action: 'getLikeListByOpenId',
        data: {
          openid: openid
        }
      },
      success: res => {
        console.log('获取图片列表成功:', res);
        //判断res.result是否为空, 为空的话直接跳出
        if (!res.result || res.result.length === 0) {
          this.setData({
            gridList: []
          });
          return;
        } 
        const docidList = res.result[0].like_pic_docid_list;
        
        // 根据逗号分割获取数组
        const docidArray = docidList.split(',').map(id => id.trim());
        getPicListByDocidList(docidArray).then(res => {
          console.log('获取图片列表成功:', res);
          res.forEach(item => {
            //console.log("item", item);
            const ratioIdx = Math.floor(Math.random() * imageRatio.length)
            const ratio = imageRatio[ratioIdx]
            // src 根据指定格式拼接
            const url = `https://6d69-mini-program-7gugok6cdb014aba-1258427370.tcb.qcloud.la/grid_images/${item.file_id}`;
            
            //根据: 分割
            const short_title = item.title.split('：')[0];
            ans.push({
              // id 是自增序号
              id: ans.length,
              docid: item._id,
              ...ratio,
              src: url,
              like: item.like_num,
              content: item.desc,
              title: item.title,
              short_title: short_title,
            });
            
          });
        
          this.setData({
            gridList: ans
          });
        }).catch(err => {
          console.error('获取图片列表失败:', err);
        });
      },
      fail: err => {
        console.error('获取图片列表失败:', err);
        this.setData({
          gridList: []
        });
      }
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