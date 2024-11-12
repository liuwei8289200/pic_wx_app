// push-pinned-header/index.js
import { getLandscapeImages } from '../utils/image'

function getnewList() {
  const newList = new Array(20).fill(0)
  const imgUrlList = getLandscapeImages()
  let count = 0
  for (let i = 0; i < newList.length; i++) {
    newList[i] = {
      idx: i,
      title: `scroll-view`,
      desc: `默认只会渲染在屏节点，会根据直接子节点是否在屏来按需渲染`,
      time: `19:20`,
      like: 88,
      image_url: imgUrlList[(count++) % imgUrlList.length],
    }
  }
  return newList
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list1: new Array(15).fill(0),
    list: getnewList(),
    crossAxisCount: 2,
    crossAxisGap: 8,
    mainAxisGap: 8,
  },

  bindscrolltolower() {
    this.setData({
      list: this.data.list.concat(getnewList())
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const res = wx.getMenuButtonBoundingClientRect()

    console.log(res)

    this.setData({
      menuTop: res.top,
      menuHeight: res.height,
      menuLeft: res.width + 10
    })


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