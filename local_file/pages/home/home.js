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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadGridList(); // 加载卡片列表
  },

  loadGridList() {
    const imageRatio = [
      {
        width: 3,
        height: 4,
        imageRatio: 3 / 4,
      },
      {
        width: 4,
        height: 3,
        imageRatio: 4 / 3,
      },
      {
        width: 1,
        height: 1,
        imageRatio: 1 / 1,
      },
    ]
    const ans = [];
    const openid = wx.getStorageSync('openId');
    console.log("openid is", openid);
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
        if (res.result.length === 0) {
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})