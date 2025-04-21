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
      likeCount: 0,
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
      // 检查用户登录状态
      const loginStatus = wx.getStorageSync('loginStatus');
      const openId = wx.getStorageSync('openId');
      
      if (!loginStatus || !openId) return;
      
      // 查询当前用户是否已点赞
      const { data: likeData } = await models.media_like.list({
        filter: {
          where: {
            image_id: {
              $eq: this.data.image_id
            },
            user_id: {
              $eq: openId
            },
            status: 1
          }
        }
      });
      
      if (likeData.records && likeData.records.length > 0) {
        // 用户已点赞
        this.setData({
          isLiked: true
        });
      } else {
        this.setData({
          isLiked: false
        });
      }
      
      // 获取图片点赞总数 - 使用数据模型直接查询
      const { data: likeCount } = await models.media_like.count({
        filter: {
          where: {
            image_id: {
              $eq: this.data.image_id
            },
            status: 1
          }
        }
      });
      
      // 更新图片信息中的点赞数
      await models.media_images.update({
        id: this.data.image_id,
        data: {
          likeCount: likeCount.count,
          updateTime: new Date()
        }
      });
      
      this.setData({
        likeCount: likeCount.count || 0
      });
    } catch (err) {
      // 打印错误堆栈
      const stack = err.stack || '';
      console.error('错误堆栈:', stack);
      
      // 提取错误发生的行号信息
      const lineMatch = stack.match(/at\s+.+:(\d+):\d+/);
      if (lineMatch && lineMatch[1]) {
        console.error('错误发生在第 ' + lineMatch[1] + ' 行');
      }
      
      // 显示错误提示给用户
      wx.showToast({
        title: '获取点赞信息失败',
        icon: 'none'
      });
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
    // 检查用户登录状态
    const loginStatus = wx.getStorageSync('loginStatus');
    const openId = wx.getStorageSync('openId');
    
    if (!loginStatus || !openId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '',
      mask: true
    });
    
    try {
      const isLiked = !this.data.isLiked;
      
      // 检查是否已存在点赞记录
      const { data: likeData } = await models.media_like.list({
        filter: {
          where: {
            image_id: {
              $eq: this.data.image_id
            },
            user_id: {
              $eq: openId
            }
          }
        }
      });
      
      if (isLiked) {
        // 点赞操作
        if (likeData.records && likeData.records.length > 0) {
          // 已有记录，更新状态为1
          await models.media_like.update({
            id: likeData.records[0]._id,
            data: {
              status: 1,
              updateTime: new Date()
            }
          });
        } else {
          // 添加点赞记录
          await models.media_like.create({
            data: {
              image_id: {
                _id: this.data.image_id
              },
              user_id: {
                _id: openId
              },
              status: 1,
              createTime: new Date()
            }
          });
        }
        
        // 更新用户的点赞列表
        await this.updateUserLikeListModel(this.data.image_id, openId, true);
        
      } else {
        // 取消点赞，更新状态为0
        if (likeData.records && likeData.records.length > 0) {
          await models.media_like.update({
            id: likeData.records[0]._id,
            data: {
              status: 0,
              updateTime: new Date()
            }
          });
          
          // 从用户的点赞列表中移除
          await this.updateUserLikeListModel(this.data.image_id, openId, false);
        }
      }
      
      // 重新计算图片点赞数
      const { data: likeCount } = await models.media_like.count({
        filter: {
          where: {
            image_id: {
              $eq: this.data.image_id
            },
            status: 1
          }
        }
      });
      
      // 更新图片信息中的点赞数
      await models.media_images.update({
        id: this.data.image_id,
        data: {
          likeCount: likeCount.count,
          updateTime: new Date()
        }
      });
      
      // 更新本地状态
      this.setData({
        isLiked: isLiked,
        likeCount: likeCount.count || 0
      });
      
      wx.hideLoading();
    } catch (err) {
      console.error('点赞操作失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },
  
  // 使用数据模型更新用户点赞列表
  async updateUserLikeListModel(imageId, openId, isAdd) {
    try {
      if (!openId) return;
      
      // 查询用户点赞列表
      const { data: userLikeData } = await models.user_like_list.list({
        filter: {
          where: {
            openid: openId
          }
        }
      });
      
      if (userLikeData.records && userLikeData.records.length > 0) {
        // 已有记录，更新
        const currentList = userLikeData.records[0].like_pic_docid_list || '';
        const docidList = currentList.split(',').filter(id => id.trim() !== '');
        
        if (isAdd) {
          // 添加点赞
          if (!docidList.includes(imageId)) {
            docidList.push(imageId);
          }
        } else {
          // 移除点赞
          const index = docidList.indexOf(imageId);
          if (index !== -1) {
            docidList.splice(index, 1);
          }
        }
        
        // 更新记录
        await models.user_like_list.update({
          id: userLikeData.records[0]._id,
          data: {
            like_pic_docid_list: docidList.join(','),
            updateTime: new Date()
          }
        });
      } else if (isAdd) {
        // 没有记录，且是添加操作，创建新记录
        await models.user_like_list.create({
          data: {
            openid: openId,
            like_pic_docid_list: imageId,
            createTime: new Date(),
            updateTime: new Date()
          }
        });
      }
    } catch (err) {
      console.error('更新用户点赞列表失败:', err);
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
    // 检查用户登录状态
    const loginStatus = wx.getStorageSync('loginStatus');
    const openId = wx.getStorageSync('openId');
    
    if (!loginStatus || !openId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
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
      // 获取当前用户信息
      const userInfo = wx.getStorageSync('userInfo') || {};
      console.log("userInfo", userInfo);
      
      // 先进行内容安全检测
      const respone = await wx.cloud.callFunction({
        name: 'msgSecCheck',
        data: {
          comment: this.data.commentText,
          scene: 2,
          openid: openId
        }
      });
      
      console.log("msgSecCheck comment is", this.data.commentText);
      console.log("msgSecCheck openid is", openId);
      console.log("msgSecCheck result", respone);
      
      if (respone && respone.result.errCode === 0 && respone.result.result.suggest === "pass") {
        // 内容安全检测通过，保存评论到云数据库
        // 添加评论记录
        await models.media_comment.create({
          data: {
            content: this.data.commentText,
            image_id: {
              _id: this.data.image_id,
            },
            user_id: {
              _id: openId,
            },
            user_name: userInfo.user_name,
            avatar: userInfo.avatar,
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