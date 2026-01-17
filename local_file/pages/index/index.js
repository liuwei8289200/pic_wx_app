import { installRouteBuilder } from './route'
import { 
  compareVersion, 
  generateGridListNew, 
  getModelsGridImages, 
  getTotalImagesCount, 
  getRandomPageNumber, 
  getNextUnusedPageNumber,
  // 新增：导入完全随机加载相关函数
  initializeImageData,
  getRandomUnviewedImages,
  resetImageData,
  getImageDataStatus,
  markImageAsViewed,
  saveViewedImages // 新增：导入保存浏览记录的函数
} from './utils'
import { on } from '../../utils/eventBus';

const { screenWidth } = wx.getSystemInfoSync()

Component({
  properties: {},
  
  data: {
    swiperImages: [],
    imageList: [], // 瀑布流图片
    page: 1, // 当前页数
    pageSize: 20, // 每页加载图片数量
    isLoading: false, // 是否正在加载
    crossAxisCount: 3,
    crossAxisGap: 8,
    mainAxisGap: 8,
    imageWidth: 0,
    imageMargin: 12, // 图片间距
    lineLimit: 3, // 每行多少张图片
    list: [],
    randomSeed: 0,
    totalImagesCount: 0, // 图片总数

    gridList: [],
    padding: 4,
    cardWidth: (screenWidth - 4 * 2 - 4) / 2, // 减去间距
    
    // 新增：完全随机加载相关状态
    isInitializing: true, // 是否正在初始化数据
    dataStatus: null, // 数据状态信息
    showDebugInfo: false, // 是否显示调试信息
    
    // 新增：轮播图尺寸
    swiperWidth: 0,
    swiperHeight: 0,
  },

  lifetimes: {
    attached() {
      this.onLoad();
      // 监听点赞事件
      on('likeChanged', ({ imageId, isLiked, likeCount }) => {
        const gridList = this.data.gridList.map(item => {
          if (item.id === imageId) {
            return { ...item, isLiked, likeCount };
          }
          return item;
        });
        this.setData({ gridList });
      });
    }
  },

  pageLifetimes: {
    show() {
      // 页面显示时触发
      this.onShow();
    },
    // 新增：页面隐藏时保存浏览记录
    hide() {
      console.log("页面隐藏，保存浏览记录");
      saveViewedImages();
    }
  },

  methods: {
    onLoad() {
      // 生成一个随机种子 (1-1000000之间的整数)
      const randomSeed = Math.floor(Math.random() * 1000000) + 1;
      this.setData({
        randomSeed: randomSeed
      });
      console.log("生成随机种子:", randomSeed);
      
      // 计算轮播图尺寸（约占1/4屏幕高度，16:9比例）
      const { screenWidth, screenHeight } = wx.getSystemInfoSync();
      const targetHeight = screenHeight / 4; // 目标高度为屏幕的1/4
      const swiperHeight = targetHeight;
      const swiperWidth = screenWidth - 32; // 左右各留16rpx边距
      
      this.setData({
        swiperWidth: swiperWidth,
        swiperHeight: swiperHeight
      });
      console.log("轮播图尺寸 - 宽:", swiperWidth, "高:", swiperHeight);
      
      this.loadSwiperImages();
      
      // 新的初始化逻辑：使用完全随机加载
      this.initializeCompleteRandomData();
      
      const { imageMargin, lineLimit } = this.data
      this.setData({
        imageWidth: (screenWidth - imageMargin * 4) / lineLimit, // 图片宽度
      })
    },
    
    // 新增：初始化完全随机数据
    async initializeCompleteRandomData() {
      this.setData({ 
        isLoading: true,
        isInitializing: true 
      });
      
      try {
        console.log("开始初始化完全随机数据");
        
        // 初始化图片数据（预缓存 + 后台加载全量数据）
        const initialImages = await initializeImageData();
        
        // 获取第一批随机图片
        const firstBatch = getRandomUnviewedImages(this.data.pageSize);
        
        this.setData({
          gridList: firstBatch,
          isLoading: false,
          isInitializing: false,
          dataStatus: this.data.showDebugInfo ? getImageDataStatus() : null
        });
        
        console.log("完全随机数据初始化完成, 首批图片数量:", firstBatch.length);
        
      } catch (error) {
        console.error("初始化完全随机数据失败:", error);
        
        // 如果新方法失败，回退到原有方法
        console.log("回退到原有加载方法");
        this.loadInitialGridListFallback();
      }
    },
    
    // 新增：回退方法（保留原有逻辑作为备用）
    async loadInitialGridListFallback() {
      console.log("使用回退方法加载数据");
      
      // 先获取图片总数
      await this.getTotalCount();
      
      // 获取随机页码并加载数据
      this.loadInitialGridList();
    },
    
    // 获取图片总数
    async getTotalCount() {
      try {
        const count = await getTotalImagesCount();
        this.setData({
          totalImagesCount: count
        });
        console.log("设置图片总数:", count);
      } catch (error) {
        console.error("获取图片总数失败:", error);
      }
    },
    
    // 首次加载时使用随机页码（保留原有逻辑作为备用）
    async loadInitialGridList() {
      if (this.data.isLoading) return;
      this.setData({ isLoading: true });
      
      // 根据图片总数和每页大小生成随机页码
      const randomPage = getRandomPageNumber(this.data.totalImagesCount, this.data.pageSize);
      
      // 设置初始页码
      this.setData({ page: randomPage });
      console.log("初始随机页码:", randomPage);
      
      // 加载对应页码的数据
      await getModelsGridImages(randomPage, this.data.pageSize, this.data.randomSeed).then(ans => {
        this.setData({
          gridList: ans,
          isLoading: false,
          isInitializing: false
        });
      }).catch(err => {
        console.error('获取图片列表失败:', err);
        this.setData({ 
          isLoading: false,
          isInitializing: false
        });
      });
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
    //通过数据模型表拉取GridList（保留原有逻辑作为备用）
    async loadGridListFromModels() {
      if (this.data.isLoading) return; // 如果正在加载，直接返回
      this.setData({ isLoading: true }); // 设置加载状态

      // 获取未使用过的下一个页码
      const nextPage = getNextUnusedPageNumber(
        this.data.totalImagesCount, 
        this.data.pageSize, 
        this.data.page
      );
      
      // 模拟异步加载数据
      await getModelsGridImages(nextPage, this.data.pageSize, this.data.randomSeed).then(ans => {
        this.setData({
          gridList: this.data.gridList.concat(ans), // 追加新数据
          page: nextPage, // 更新为新的页码
          isLoading: false // 重置加载状态
        });
      }).catch(err => {
        console.error('获取图片列表失败:', err);
        this.setData({ isLoading: false }); // 重置加载状态
      });
    },
    
    // 修改：加载更多数据（优先使用完全随机方法）
    loadMore() {
      // 优先使用完全随机加载
      this.loadMoreCompleteRandom();
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

    // 分享给朋友
    onShareAppMessage() {
      const app = getApp();
      return {
        title: '发现好看的图片，快来看看吧！',
        path: '/pages/index/index',
        imageUrl: this.data.swiperImages[0] || app.globalData.shareInfo.imageUrl
      };
    },

    // 分享到朋友圈
    onShareTimeline() {
      const app = getApp();
      return {
        title: '发现好看的图片，快来看看吧！',
        query: '',
        imageUrl: this.data.swiperImages[0] || app.globalData.shareInfo.imageUrl
      };
    },

    // 新增：完全随机加载更多图片
    loadMoreCompleteRandom() {
      if (this.data.isLoading) return;
      
      console.log("加载更多完全随机图片");
      this.setData({ isLoading: true });
      
      try {
        // 获取下一批随机未浏览图片
        const moreImages = getRandomUnviewedImages(this.data.pageSize);
        
        if (moreImages.length === 0) {
          console.log("没有更多图片了");
          wx.showToast({
            title: '没有更多图片了',
            icon: 'none'
          });
          this.setData({ isLoading: false });
          return;
        }
        
        // 追加新图片到现有列表
        const updatedGridList = this.data.gridList.concat(moreImages);
        
        this.setData({
          gridList: updatedGridList,
          isLoading: false,
          dataStatus: this.data.showDebugInfo ? getImageDataStatus() : null
        });
        
        console.log("加载更多完全随机图片成功, 新增数量:", moreImages.length);
        
      } catch (error) {
        console.error("加载更多完全随机图片失败:", error);
        
        // 如果新方法失败，回退到原有方法
        console.log("回退到原有加载更多方法");
        this.loadGridListFromModels();
      }
    },
    
    // 新增：重新初始化数据（刷新功能）
    async refreshData() {
      console.log("刷新数据");
      
      // 重置所有数据
      resetImageData();
      
      // 重新初始化
      await this.initializeCompleteRandomData();
      
      wx.showToast({
        title: '数据已刷新',
        icon: 'success'
      });
    },
    
    // 新增：切换调试信息显示
    toggleDebugInfo() {
      const newShowDebugInfo = !this.data.showDebugInfo;
      this.setData({ 
        showDebugInfo: newShowDebugInfo,
        dataStatus: newShowDebugInfo ? getImageDataStatus() : null
      });
      
      wx.showToast({
        title: newShowDebugInfo ? '调试信息已开启' : '调试信息已关闭',
        icon: 'none'
      });
    },
    
    // 新增：获取当前数据状态（调试用）
    getDataStatus() {
      const status = getImageDataStatus();
      console.log("当前数据状态:", status);
      
      wx.showModal({
        title: '数据状态详情',
        content: `预缓存: ${status.prefetchedCount}张
全量数据: ${status.allDataCount}张
已浏览: ${status.viewedCount}张
剩余: ${status.remainingCount}张
全量数据已加载: ${status.isAllDataLoaded ? '是' : '否'}`,
        showCancel: true,
        cancelText: '刷新数据',
        confirmText: '确定',
        success: (res) => {
          if (res.cancel) {
            // 用户点击了刷新数据
            this.refreshData();
          }
        }
      });
      
      return status;
    },
    
    // 新增：保存轮播图图片
    saveSwiperImage(e) {
      const { url } = e.currentTarget.dataset;
      
      if (!url) {
        wx.showToast({
          title: '图片地址无效',
          icon: 'none'
        });
        return;
      }
      
      wx.showModal({
        title: '提示',
        content: '是否保存图片到相册？',
        success: (res) => {
          if (res.confirm) {
            wx.getSetting({
              success: (res) => {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                  wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: () => {
                      this.doSaveSwiperImage(url);
                    },
                    fail: () => {
                      wx.showModal({
                        title: '提示',
                        content: '需要您授权保存图片到相册',
                        success: (res) => {
                          if (res.confirm) {
                            wx.openSetting();
                          }
                        }
                      });
                    }
                  });
                } else {
                  this.doSaveSwiperImage(url);
                }
              }
            });
          }
        }
      });
    },

    // 执行保存轮播图图片
    doSaveSwiperImage(url) {
      wx.showLoading({
        title: '保存中...',
        mask: true
      });
      
      wx.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.hideLoading();
                wx.showToast({
                  title: '保存成功',
                  icon: 'success'
                });
              },
              fail: (err) => {
                wx.hideLoading();
                console.error('保存图片失败:', err);
                wx.showToast({
                  title: '保存失败',
                  icon: 'error'
                });
              }
            });
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '下载失败',
              icon: 'error'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('下载图片失败:', err);
          wx.showToast({
            title: '下载失败',
            icon: 'error'
          });
        }
      });
    }
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