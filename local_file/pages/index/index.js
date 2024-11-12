
import { getHeightImages } from '../../utils/image'

const descList = [
    '这里风景好美～',
    '这是哪里呀？快介绍一下～～～～'
]
Page({
  data: {
    swiperImages: [],
    imageList: [], // 瀑布流图片
    page: 0, // 当前页数
    pageSize: 20, // 每页加载图片数量
    list: getnewList(),
    crossAxisCount: 3,
    crossAxisGap: 8,
    mainAxisGap: 8,
  },
  onLoad() {
    this.loadSwiperImages();
    this.loadWaterfallImages();
    this.setData({
      list: this.data.list.concat(getnewList())
    })
  },
  loadWaterfallImages() {
    // const { page, pageSize, imageList } = this.data;
    // // 模拟从 CloudBase 加载图片
    // const newImages = Array.from({ length: pageSize }, (_, i) => `/images/waterfall/image${page * pageSize + i + 1}.jpg`);
    // this.setData({
    //   imageList: imageList.concat(newImages),
    //   page: page + 1
    // });
  },
  loadSwiperImages() {
    wx.cloud.callFunction({
      name: 'getFiles',
      data: {
        directoryPath: 'swiper_images/' // 替换为您的文件夹路径
      },
      success: res => {
        console.log('success', res);
        console.log('云函数调用成功：', res.result);
        console.log("test1111111", res.result.data);
        //获取到size>0的后,并将其中的Key值存入数组
        //将数组中的文件名改为cloud://6d69-mini-program-8gte1ziw1d4ac40c-1258427370/swiper_images/1.png
        const pngFiles = res.result.data.filter(file => file.Size > 0 ).map(file => `cloud://mini-program-8gte1ziw1d4ac40c.6d69-mini-program-8gte1ziw1d4ac40c-1258427370/${file.Key}`);
        console.log(pngFiles);
        wx.cloud.getTempFileURL({
          fileList: pngFiles,
          success: res => {
            // fileList 是一个有如下结构的对象数组
            // [{
            //    fileID: 'cloud://xxx.png', // 文件 ID
            //    tempFileURL: '', // 临时文件网络链接
            //    maxAge: 120 * 60 * 1000, // 有效期
            // }]
            console.log(res.fileList)
            this.setData({
              swiperImages: res.fileList.map(file => file.tempFileURL)
            });
            console.log(this.data.swiperImages);
          },
          fail: console.error
        })
      },
      fail: err => {
        console.error('云函数调用失败：', err);
      }
    });

  },
  loadMoreImages() {
    this.loadWaterfallImages();
  },
  viewImageDetail(event) {
    const imageUrl = event.currentTarget.dataset.url;
    wx.navigateTo({
      url: `/pages/detail/detail?imageUrl=${imageUrl}`
    });
  }
});
function getnewList() {
  const newList = new Array(20).fill(0)
  const imgUrlList = getHeightImages()
  console.log("imgUrlList", imgUrlList);
  console.log("descList", descList);
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