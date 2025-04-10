const { screenWidth } = wx.getSystemInfoSync()
const { init } = require("@cloudbase/wx-cloud-client-sdk");
const { compareVersion } = require("../index/utils");
const client = init(wx.cloud)
const models = client.models

Page({
  onLoad(options) {
    // 处理传入的参数
    this.setData({
      image_id: options.image_id,
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
      commentText: '',
      comments: []
    });
    
    // 加载评论列表
    this.loadComments();
    
    // 初始化点赞状态
    this.initLikeStatus();
  },
  
  // 初始化点赞状态
  async initLikeStatus() {
    try {
      // 获取当前用户信息
      const userInfo = wx.getStorageSync('userInfo') || {};
      const user_id = userInfo._openid || '';
      
      if (!user_id) return;
      
      // 查询当前用户是否已点赞
      const { data: likeData } = await models.media_like.list({
        filter: {
          where: {
            image_id: this.data.image_id,
            user_id: user_id
          }
        }
      });
      
      if (likeData.records && likeData.records.length > 0) {
        // 用户已点赞
        this.setData({
          isLiked: true
        });
      }
      
      // 获取图片点赞数
      const { data: imageData } = await models.media_images.get({
        id: this.data.image_id
      });
      
      if (imageData) {
        this.setData({
          likeCount: imageData.likeCount || 0
        });
      }
    } catch (err) {
      console.error('初始化点赞状态失败:', err);
    }
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

  async handleLike() {
    const isLiked = !this.data.isLiked;
    const likeCount = this.data.likeCount + (isLiked ? 1 : -1);
    
    // 更新本地状态
    this.setData({
      isLiked,
      likeCount
    });
    
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    const user_id = userInfo._openid || '';
    
    if (!user_id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    try {
      if (isLiked) {
        // 添加点赞记录
        await models.media_like.add({
          data: {
            image_id: this.data.image_id,
            user_id: user_id,
            createTime: new Date()
          }
        });
        
        // 更新图片点赞数
        await models.media_images.update({
          id: this.data.image_id,
          data: {
            likeCount: models.command.inc(1)
          }
        });
      } else {
        // 取消点赞，删除点赞记录
        const { data: likeData } = await models.media_like.list({
          filter: {
            where: {
              image_id: this.data.image_id,
              user_id: user_id
            }
          }
        });
        
        if (likeData.records && likeData.records.length > 0) {
          const likeId = likeData.records[0]._id;
          await models.media_like.remove({
            id: likeId
          });
          
          // 更新图片点赞数
          await models.media_images.update({
            id: this.data.image_id,
            data: {
              likeCount: models.command.inc(-1)
            }
          });
        }
      }
    } catch (err) {
      console.error('点赞操作失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
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

  async sendComment() {
    if (!this.data.commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '发送中...',
    });

    try {
      // 先进行内容安全检测
      const result = await wx.cloud.callFunction({
        name: 'msgSecCheck',
        data: {
          comment: this.data.commentText,
          scene:2,
          openid: wx.getStorageSync('openId')
        }
      }
    )
      console.log("msgSecCheck comment is", this.data.commentText)
      console.log("msgSecCheck openid is", wx.getStorageSync('openId'))
      console.log("msgSecCheck result", result)
      if (result && result.errCode === 0) {
        // 内容安全检测通过，保存评论到云数据库
        // 获取当前用户信息
        const userInfo = wx.getStorageSync('userInfo') || {};
        
        // 添加评论记录
        await models.media_comment.add({
          data: {
            content: this.data.commentText,
            image_id: this.data.image_id, // 图片ID
            user_id: userInfo._openid || '',
            username: userInfo.nickName || '匿名用户',
            avatar: userInfo.avatarUrl || '/images/default_avatar.png',
            createTime: new Date(),
            time: new Date().toLocaleString()
          }
        });
        
        // 评论成功，更新评论数
        await models.media_images.update({
          id: this.data.image_id,
          data: {
            commentCount: models.command.inc(1)
          }
        });
        
        // 刷新评论列表
        this.loadComments();
        
        wx.hideLoading();
        wx.showToast({
          title: '评论成功',
          icon: 'success'
        });
        
        // 清空输入框并关闭浮窗
        this.setData({
          showCommentInput: false,
          commentText: ''
        });
      } else {
        // 内容安全检测未通过
        wx.hideLoading();
        wx.showToast({
          title: '评论内容含有违规信息',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '评论失败',
        icon: 'none'
      });
      console.error('评论失败:', err);
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.title,
      path: '/pages/detail/detail?image_id=' + this.data.image_id
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
  },

  // 加载评论列表
  async loadComments() {
    console.log("loadComments")
    console.log("this.data.image_id", this.data.image_id)
    try {
      // 查询当前图片的所有评论，按时间倒序排列
      const { data } = await models.media_comment.list({
        filter: {
          where: {
            image_id: {    // 关联模型标识
              $eq: this.data.image_id, // 传入数据 ID
            },
          },
          orderBy: {
            createTime: 'desc'
          }
        }
      });
      
      this.setData({
        comments: data.records || [],
        commentCount: data.records ? data.records.length : 0
      });
    } catch (err) {
      console.error('获取评论失败:', err);
    }
  }
});