
import { getHeightImages } from '../utils/image'
const app = getApp()


const descList = [
  '这里风景好美～',
  '这是哪里呀？快介绍一下～～～～'
]
function getnewList() {
  const newList = new Array(20).fill(0)
  const imgUrlList = getHeightImages()
  let count = 0
  for (let i = 0; i < newList.length; i++) {
    newList[i] = {
      idx: i,
      title: `scroll-view`,
      desc: descList[count%2],
      time: `19:20`,
      like: 88,
      image_url: imgUrlList[(count++) % imgUrlList.length] || 'http://mmbiz.qpic.cn/sz_mmbiz_jpg/GEWVeJPFkSEV5QjxLDJaL6ibHLSZ02TIcve0ocPXrdTVqGGbqAmh5Mw9V7504dlEiatSvnyibibHCrVQO2GEYsJicPA/0?wx_fmt=jpeg',
    }
  }
  return newList
}

Page({
  data: {
    list: getnewList(),
    crossAxisCount: 3,
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
      error: event.detail.errMsg
    })
  },
  onLoad() {
    console.log('代码片段是一种迷你、可分享的小程序或小游戏项目，可用于分享小程序和小游戏的开发经验、展示组件和 API 的使用、复现开发问题和 Bug 等。可点击以下链接查看代码片段的详细文档：')
    console.log('https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/devtools.html')
  },
})
