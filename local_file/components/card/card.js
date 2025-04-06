const { shared } = wx.worklet

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
    likeImage(event) {
      const { docid } = event.currentTarget.dataset
      console.log("doc_id is", docid);


      // 更新点赞数字
      const tmp_num = this.data.item.like + 1;
      this.setData({
        'item.like': tmp_num // 立即更新点赞数
      });
      wx.cloud.callFunction({
        name: 'dbCommand',
        data: {
          action: 'updateLikeNum',
          data: {
            docid: docid,
          }
        },
        success: res => {
          console.log('云函数updateLikeNum调用成功：', res.result);
        },
        fail: err => {
          console.error('云函数调用失败：', err);
        }
      });
      // 获取openid
      const openid = wx.getStorageSync('openId');
      // 异步写入数据库
      wx.cloud.callFunction({
        name: 'dbCommand',
        data: {
          action: 'updateLikeListByOpenId',
          data: {
            openid: openid,
            docid: docid
          }
        },
        success: res => {
          console.log('云函数updateLikeListByOpenId调用成功：', res);
        },
        fail: err => {
          console.error('云函数调用失败：', err);
        }
      });

      // wx.cloud.database().collection('likes').add({
      //   data: {
      //     imageUrl: imageUrl,
      //     userId: wx.getStorageSync('userId') // 假设用户ID存储在本地
      //   },
      //   success: res => {
      //     console.log('点赞成功:', res);
      //   },
      //   fail: err => {
      //     console.error('点赞失败:', err);
      //   }
      // });
      // wx.cloud.database().collection('pic_list').get({
      //   success: function(res) {
      //     // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      //     console.log("res.data", res.data)
      //   }
      // })
      // wx.cloud.database().collection('pic_list').doc('a56e23cd67c445520037fc6d7f232cb8').update({
      //   // data 传入需要局部更新的数据
      //   data: {
      //     // 表示将 done 字段置为 true
      //     like_num: tmp_num
      //   },
      //   success: res => {
      //     console.log('点赞数更新成功:', res);
      //   },
      //   fail: err => {
      //     console.error('点赞数更新失败:', err);
      //   }
      // })
    },
    navigateTo(e) {
      const { index, url, content, ratio, title, short_title } = e.currentTarget.dataset
      console.log("test111111", e.currentTarget.dataset)
      const urlContent = `../../pages/detail/detail?index=${index}&url=${url}&content=${content}&ratio=${ratio}&title=${title}&short_title=${short_title}`
      console.log("test22222222", urlContent)
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
