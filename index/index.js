
import { getImages } from '../utils/image'
const app = getApp()


function getnewList() {
  const newList = new Array(20).fill(0)
  const imgUrlList = getImages()
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
  data: {
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
  binderror(event) {
    this.setData({
      error: '错误'//event.detail.errMsg
    })
  },
  onLoad() {
    console.log('代码片段是一种迷你、可分享的小程序或小游戏项目，可用于分享小程序和小游戏的开发经验、展示组件和 API 的使用、复现开发问题和 Bug 等。可点击以下链接查看代码片段的详细文档：')
    console.log('https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/devtools.html')
  },
})
