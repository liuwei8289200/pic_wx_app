const { shared } = wx.worklet
import { on } from '../../utils/eventBus';

const FlightDirection = {
  PUSH: 0,
  POP: 1,
}

Component({
  options: {
    virtualHost: true,
  },
  properties: {
    index: {
      type: Number,
      value: -1,
    },
    item: {
      type: Object,
      value: {},
    },
    cardWidth: {
      type: Number,
      value: 0
    },
  },
  data: {
    isLiked: false,
    likeCount: 0,
    likeUsers: [],
  },

  lifetimes: {
    created() {
      this.scale = shared(1)
      this.opacity = shared(0)
      this.direction = shared(0)
      this.srcWidth = shared('100%')
      this.radius = shared(5)

      const beginRect = shared(undefined)
      const endRect = shared(undefined)
      wx.worklet.runOnUI(() => {
        'worklet'
        globalThis['RouteCardSrcRect'] = beginRect
        globalThis['RouteCardDestRect'] = endRect
      })()
    },
    attached() {
      this.initLikeStatus()
      // 监听点赞事件，实现本地同步
      on('likeChanged', ({ imageId, isLiked, likeCount }) => {
        const item = this.data.item || {};
        if (item.docid === imageId) {
          this.setData({
            isLiked,
            likeCount
          });
        }
      });
      this.applyAnimatedStyle(
        '.card_wrap', 
        () => {
          'worklet'
          return {
            width: this.srcWidth.value,
            transform: `scale(${this.scale.value})`,
          }
        }, 
        {
          immediate: false,
          flush: 'sync'
        },
        () => {}, 
      )

      this.applyAnimatedStyle(
        '.card_img',
        () => {
          'worklet'
          return {
            borderTopRightRadius: this.radius.value, // 不带单位默认是 px
            borderTopLeftRadius: this.radius.value,
          }
        },
        {
          immediate: true,
          flush: 'sync'
        },
        () => {}, 
      )

      this.applyAnimatedStyle(
        '.card_desc',
        () => {
          'worklet'
          return {
            opacity: this.opacity.value,
          }
        },
        {
          immediate: false,
          flush: 'sync'
        },
        () => {}, 
      )
    },
  },

  methods: {
    initLikeStatus() {
      const openId = wx.getStorageSync('openId');
      const item = this.data.item || {};
      //console.log("item is", item);
      // 检查connect_image_liked_users是否存在且是数组
      if (item.like_users && Array.isArray(item.like_users)) {
        // 获取点赞列表
        const likeUsers = item.like_users;
        // 判断当前用户是否已点赞
        const isLiked = likeUsers.some(user => user._id === openId);
        // 获取点赞数量
        const likeCount = likeUsers.length;
        
        // 更新数据状态
        this.setData({
          isLiked: isLiked,
          likeCount: likeCount,
          likeUsers: likeUsers
        });
        
        console.log(`图片${item.docid}初始化点赞状态: 已点赞=${isLiked}, 点赞数=${likeCount}`);
      } else {
        // 如果没有点赞数据，设置默认值
        this.setData({
          isLiked: false,
          likeCount: 0,
          likeUsers: []
        });
        
        console.log(`图片${item.docid || '未知'}初始化点赞状态: 无点赞数据`);
      }
    },
    // 判断当前用户是否已点赞
    isUserLiked() {
      const openId = wx.getStorageSync('openId');
      const item = this.data.item || {};
      //console.log("item is", item);
      
      // 检查connect_image_liked_users是否存在且是数组
      if (item.connect_image_liked_users && Array.isArray(item.connect_image_liked_users)) {
        // 检查用户是否在点赞列表中
        return item.connect_image_liked_users.some(user => user._id === openId);
      }
      
      return false;
    },
    
    async likeImage(event) {
      const { docid, likeusers } = event.currentTarget.dataset
      console.log("doc_id is", docid);
      
      // 获取当前用户是否已点赞
      const openId = wx.getStorageSync('openId');
      const loginStatus = wx.getStorageSync('loginStatus');
      if (!openId || !loginStatus) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      try {
        
        const newIsLiked = !this.data.isLiked;
        const newLikeCount = this.data.likeCount + (newIsLiked ? 1 : -1);
        
        // 使用setData更新状态，触发视图更新
        this.setData({
          isLiked: newIsLiked,
          likeCount: newLikeCount
        });
        
        if (newIsLiked) {
          //调用云函数
          //取出
          const updatedLikeUsers = [...this.data.likeUsers, {_id: openId}];
          this.setData({
            likeUsers: updatedLikeUsers
          });
          
          const { resp } = await wx.cloud.callFunction({
            name: 'dataModelUpdate',
            data: {
              action: 'updateImageLikedUser',
              data: {
                object_id: docid,
                update_list: updatedLikeUsers
              }
            }
          });
          console.log("resp", resp);
        } else {
          const updatedLikeUsers = this.data.likeUsers.filter(user => user._id !== openId);
          this.setData({
            likeUsers: updatedLikeUsers
          });
          
          const { resp } = await wx.cloud.callFunction({
            name: 'dataModelUpdate',
            data: {
              action: 'updateImageLikedUser',
              data: {
                object_id: docid,
                update_list: updatedLikeUsers
              }
            }
          }); 
          console.log("resp", resp);
        }
  
      } catch (err) {
        console.error('点赞操作失败:', err);
        // 发生错误时，回滚UI状态
        this.setData({
          isLiked: !this.data.isLiked,
          likeCount: this.data.likeCount + (!this.data.isLiked ? 1 : -1)
        });
        
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
  
    },
    navigateTo(e) {
      const { index, url, content, ratio, title, short_title, docid } = e.currentTarget.dataset
      const item = this.data.item || {};
      const likeCount = item.like || 0;
      
      // 查询当前登录用户是否已点赞
      const openId = wx.getStorageSync('openId');
      let isLiked = false;
      
      // 如果能获取到点赞状态则传入，否则在详情页重新获取
      if (item.likedUsers && Array.isArray(item.likedUsers)) {
        isLiked = item.likedUsers.some(user => user._id === openId);
      }
      
      const urlContent = `../../pages/detail/detail?index=${index}&url=${url}&content=${content}&ratio=${ratio}&title=${title}&short_title=${short_title}&image_id=${docid}&likeCount=${likeCount}&isLiked=${isLiked}`
      console.log("urlContent", urlContent);
      wx.navigateTo({
        url: urlContent,
        //routeType: 'CardScaleTransition',
      })
    },
    handleFrame(data) {
      'worklet'
      this.direction.value = data.direction
      if (data.direction === FlightDirection.PUSH) { // 进入
        // 飞跃过程中，卡片从 100% 改为固定宽度，通过 scale 手动控制缩放
        this.srcWidth.value = `${data.begin.width}px`
        this.scale.value = data.current.width / data.begin.width
        this.opacity.value = 1 - data.progress
        this.radius.value = 0
        // this.shareImgHeight.value = data.begin.height

      } else if (data.direction === FlightDirection.POP) { // 返回
        this.scale.value = data.current.width / data.end.width
        this.opacity.value = data.progress
        this.radius.value = 5
      }

      // globalThis 是 UI 线程的全局变量，将 share-element 初始和目标尺寸保存起来，用于下一页面的缩放动画的计算
      // TODO: 后续计划优化这里的接口设计
      if (globalThis['RouteCardSrcRect'] && globalThis['RouteCardSrcRect'].value == undefined) {
        globalThis['RouteCardSrcRect'].value = data.begin
      }
      if (globalThis['RouteCardDestRect'] && globalThis['RouteCardDestRect'].value == undefined) {
        globalThis['RouteCardDestRect'].value = data.end
      }
    },
    saveImage(e) {
      const { url } = e.currentTarget.dataset
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
                      this.doSaveImage(url)
                    },
                    fail: () => {
                      wx.showModal({
                        title: '提示',
                        content: '需要您授权保存图片到相册',
                        success: (res) => {
                          if (res.confirm) {
                            wx.openSetting()
                          }
                        }
                      })
                    }
                  })
                } else {
                  this.doSaveImage(url)
                }
              }
            })
          }
        }
      })
    },

    doSaveImage(url) {
      wx.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.showToast({
                  title: '保存成功',
                  icon: 'success'
                })
              },
              fail: () => {
                wx.showToast({
                  title: '保存失败',
                  icon: 'error'
                })
              }
            })
          }
        },
        fail: () => {
          wx.showToast({
            title: '下载失败',
            icon: 'error'
          })
        }
      })
    }
  },
})
