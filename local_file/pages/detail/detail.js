const { screenWidth } = wx.getSystemInfoSync()
Page({
  onLoad(options) {
    // 处理传入的参数
    this.setData({
      index: options.index,
      content: options.content,
      ratio: options.ratio,
      swiperHeight: screenWidth / options.ratio,
      url: options.url,
      short_title : options.short_title,
      title: options.title,
      isLiked: false,
      likeCount: 10,
      isCollected: false,
      collectCount: 10,
      commentCount: 10,
      showCommentInput: false,
      commentText: ''
    });
  },
  
  // 页面点击事件，用于关闭评论输入框
  onPageTap() {
    if (this.data.showCommentInput) {
      this.hideCommentInput();
    }
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  handleLike() {
    const isLiked = !this.data.isLiked;
    const likeCount = this.data.likeCount + (isLiked ? 1 : -1);
    this.setData({
      isLiked,
      likeCount
    });
    // TODO: 调用后端API更新点赞状态
  },

  handleCollect() {
    const isCollected = !this.data.isCollected;
    const collectCount = this.data.collectCount + (isCollected ? 1 : -1);
    this.setData({
      isCollected,
      collectCount
    });
    // TODO: 调用后端API更新收藏状态
  },

  showCommentInput() {
    console.log("showCommentInput")
    this.setData({
      showCommentInput: true
    });
  },

  hideCommentInput() {
    this.setData({
      showCommentInput: false
    });
  },

  stopPropagation() {
    // 阻止事件冒泡，空函数即可
  },

  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  sendComment() {
    if (!this.data.commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    // TODO: 调用后端API发送评论
    console.log('发送评论:', this.data.commentText);

    this.setData({
      showCommentInput: false,
      commentText: ''
    });
  },

  onShareAppMessage() {
    return {
      title: this.data.title,
      path: '/pages/detail/detail?id=' + this.data.id
    };
  },

  saveImageToAlbum() {
    // 先弹出确认框
    wx.showModal({
      title: '提示',
      content: '是否保存图片到相册？',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定，继续保存流程
          // 获取相册授权
          wx.getSetting({
            success: (res) => {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                // 如果没有权限，获取权限
                wx.authorize({
                  scope: 'scope.writePhotosAlbum',
                  success: () => {
                    this.downloadAndSaveImage();
                  },
                  fail: () => {
                    wx.showModal({
                      title: '提示',
                      content: '需要您授权保存图片到相册',
                      showCancel: false,
                      success: (res) => {
                        if (res.confirm) {
                          // 打开设置页面让用户手动授权
                          wx.openSetting();
                        }
                      }
                    });
                  }
                });
              } else {
                // 有权限，直接保存
                this.downloadAndSaveImage();
              }
            }
          });
        }
      }
    });
  },

  downloadAndSaveImage() {
    wx.showLoading({
      title: '保存中...',
    });

    // 先下载图片
    wx.downloadFile({
      url: this.data.url,
      success: (res) => {
        if (res.statusCode === 200) {
          // 下载成功后保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({
                title: '已保存到相册',
                icon: 'success'
              });
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              });
              console.error('保存失败:', err);
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '图片下载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '图片下载失败',
          icon: 'none'
        });
        console.error('下载失败:', err);
      }
    });
  }
});
// import { Curves, CurveAnimation, lerp } from '../index/route'
// import { clamp } from '../index/utils'

// const { screenWidth } = wx.getSystemInfoSync()
// const { shared, timing, Easing } = wx.worklet

// const GestureState = {
//   POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
//   BEGIN: 1, // 1 手势已识别
//   ACTIVE: 2, // 2 连续手势活跃状态
//   END: 3, // 3 手势终止
//   CANCELLED: 4, // 4 手势取消，
// }

// const transLowerBound = -1/3 * screenWidth
// const transUpperBound = 2/3 * screenWidth

// Component({
//   properties: {
//     index: {
//       type: Number,
//       value: -1,
//     },
//     url: {
//       type: String,
//       value: '',
//     },
//     content: {
//       type: String,
//       value: '',
//     },
//     ratio: {
//       type: Number,
//       value: 1
//     },
//     nickname: {
//       type: String,
//       value: '',
//     }
//   },
//   data: {
//     swiperHeight: 0,
//     imageList: [
//       'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr7lTnuuiwGJPwwjxDVYbDolj05sAxd5cOESVZt4_nl1KwzkiDWTvG56LuhE45xAaZA',
//       'https://res.wx.qq.com/op_res/Ak_VAL-nLvq6laAMVJA86rf3NAZ2vY86v757dfja16Z95xtoxk4BWWDuTCPT-pD1SjGGIddUsH0l6C8Yu5LJlw'
//     ]
//   },
//   lifetimes: {
//     created() {
//       this.startX = shared(0)
//       this.startY = shared(0)
//       this.transX = shared(0)
//       this.transY = shared(0)
//       this.isInteracting = shared(false)
//     },
//     attached() {
//       this.setData({
//         swiperHeight: screenWidth / this.data.ratio
//       })
//       this.customRouteContext = wx.router?.getRouteContext(this);
//       const { 
//         primaryAnimation,
//         primaryAnimationStatus,
//         userGestureInProgress,
//         shareEleTop
//       } = this.customRouteContext || {}

//       console.log("test11111111", this.customRouteContext)
//       console.log("test22222222", this.swiperHeight)
//       // 根据进入或返回使用不同曲线换算到的值
//       const _curvePrimaryAnimation = CurveAnimation({
//         animation: primaryAnimation,
//         animationStatus: primaryAnimationStatus,
//         curve: Easing.in(Curves.fastOutSlowIn),
//         reverseCurve: Easing.out(Curves.fastOutSlowIn)
//       })

//       this.applyAnimatedStyle('.detail-content', () => {
//         'worklet'
//         return {
//           opacity: _curvePrimaryAnimation.value
//         }
//       })

//       this.applyAnimatedStyle('#fake-host', () => {
//         'worklet'
//         // pan 手势释放后，触发返回动画，userGestureInProgress 由 startUserGesture() 标记
//         if (userGestureInProgress.value && 
//           globalThis['RouteCardSrcRect'] && 
//           globalThis['RouteCardSrcRect'].value != undefined
//         ) {
//           const begin = globalThis['RouteCardSrcRect'].value
//           const end = globalThis['RouteCardDestRect'].value
          
//           const t = 1 - _curvePrimaryAnimation.value
//           const shareEleX = lerp(begin.left, end.left, t)
//           const shareEleY = lerp(begin.top, end.top, t)
//           const shareEleW = lerp(begin.width, end.width, t)
          
//           const scale = shareEleW / screenWidth
//           const transX = shareEleX
//           // shareEleTop 是完全展开时 share-element 的 top 值，换比例换算
//           // 使得缩放过程中，最后图片顶部对齐卡片图片顶部
//           const transY = shareEleY - shareEleTop.value * scale

//           return {
//             transform: `translateX(${transX}px) translateY(${transY}px) scale(${scale})`,
//             transformOrigin: '0 0',
//           }
//         }
//         // pan 手势移动阶段
//         const transX = this.transX.value
//         const transY = this.transY.value
//         // 根据横坐标位移比例缩放
//         const scale = clamp(1 - transX / screenWidth * 0.5, 0, 1)
//         return {
//           transform: `translateX(${transX}px) translateY(${transY}px) scale(${scale})`,
//           transformOrigin: '50% 50%'
//         }
//       }, { immediate: false })
//     },
//   },
//   methods: {
//     handlePanGesture(e) {
//       'worklet'
//       const {
//         startUserGesture,
//         stopUserGesture,
//         primaryAnimation,
//         didPop,
//       } = this.customRouteContext

//       if (e.state === GestureState.BEGIN) {
//         this.startX.value = e.absoluteX
//         this.startY.value = e.absoluteY
//       } else if (e.state === GestureState.ACTIVE) {
//         // 往右滑时
//         if (e.deltaX > 0 && !this.isInteracting.value) {
//           this.isInteracting.value = true
//         }
//         if (!this.isInteracting.value) return

//         const transX = e.absoluteX - this.startX.value
//         this.transX.value = clamp(transX, transLowerBound, transUpperBound)
//         this.transY.value = e.absoluteY - this.startY.value
//       } else if (e.state === GestureState.END || e.state === GestureState.CANCELLED) {
//         if (!this.isInteracting.value) return
//         this.isInteracting.value = false

//         // 是要返回还是取消返回
//         let shouldFinish = false
//         if (e.velocityX > 500 || this.transX.value / screenWidth > 0.25) {
//           shouldFinish = true
//         }
//         if (shouldFinish) {
//           startUserGesture()
//           primaryAnimation.value = timing(0.0, {
//             duration: 180,
//             easing: Easing.linear
//           }, () => {
//             'worklet'
//             stopUserGesture()
//             didPop()
//           })
//         } else {
//           this.transX.value = timing(0.0, { duration: 100 })
//           this.transY.value = timing(0.0, { duration: 100 })
//         }
//       }
//     },
//   },
// })
