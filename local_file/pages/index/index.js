import { installRouteBuilder } from './route'
import { compareVersion, generateGridListNew } from './utils'

const { screenWidth } = wx.getSystemInfoSync()
const descList = [
    '这里风景好美～',
    '这是哪里呀？快介绍一下～～～～'
]
Page({});
Component({
  data: {
    swiperImages: [],
    imageList: [], // 瀑布流图片
    page: 0, // 当前页数
    pageSize: 20, // 每页加载图片数量
    crossAxisCount: 3,
    crossAxisGap: 8,
    mainAxisGap: 8,
    imageWidth: 0,
    imageMargin: 12, // 图片间距
    lineLimit: 3, // 每行多少张图片
    list: [],

    gridList: [],
    padding: 4,
    cardWidth: (screenWidth - 4 * 2 - 4) / 2, // 减去间距
  },
  methods:{
    onLoad() {
      this.loadSwiperImages();
      this.loadGridList();
      const { imageMargin, lineLimit } = this.data
      const { screenWidth } = wx.getSystemInfoSync()
      this.setData({
        imageWidth: (screenWidth - imageMargin * 4) / lineLimit, // 图片宽度
      })
    },
    onShow() {
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
          const pngFiles = res.result.data.filter(file => file.Size > 0 ).map(file => `cloud://mini-program-7gugok6cdb014aba.6d69-mini-program-7gugok6cdb014aba-1258427370/${file.Key}`);
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
    loadGridList() {
      generateGridListNew(100, 2).then(ans => {
        console.log("获取的图片列表:", ans);
        this.setData({
          gridList: ans // 将获取到的图片列表设置到组件的状态中
        });
      }).catch(err => {
        console.error('获取图片列表失败:', err);
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
    },
    getAlbumHeight() {
      wx.createSelectorQuery().select(".tab-bar").boundingClientRect(function (rect) {
        console.log('asdsad', rect)
      }).exec((res) => {
        console.log(res)
      })
    },
  },
  lifetimes: {
    created() {
      const {SDKVersion} = wx.getSystemInfoSync()
      // console.log("test2222222", SDKVersion)
      // console.log("test222222", this.cardWidth)
      // console.log("test22222", this.gridList)
      if (compareVersion(SDKVersion, '2.30.1') < 0) {
        wx.showModal({
          content: '基础库版本低于 v2.30.1 可能会有显示问题，建议升级微信体验。',
          showCancel: false
        })
      }
      installRouteBuilder()
    },
  },
});