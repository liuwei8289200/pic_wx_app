const { screenWidth } = wx.getSystemInfoSync()
const { init } = require("@cloudbase/wx-cloud-client-sdk");
const { compareVersion } = require("../index/utils");
const client = init(wx.cloud)
const models = client.models

Page({
  data: {
    // 初始化基础数据
    image_id: '',
    content: '',
    ratio: 1,
    swiperHeight: 0,
    url: '',
    short_title: '',
    title: '',
    // 点赞相关
    isLiked: false,
    likeCount: 0,
    likeUsers: [],
    // 收藏相关
    isCollected: false,
    collectCount: 10,
    // 评论相关
    commentCount: 0,
    showCommentInput: false,
    commentText: '',
    comments: [],
    // 加载状态
    isLoading: true
  },

  onLoad(options) {
    // 处理传入的参数
    const initialData = {
      image_id: options.image_id,
      content: options.content,
      ratio: options.ratio,
      swiperHeight: screenWidth / options.ratio,
      url: options.url,
      short_title: options.short_title,
      title: options.title,
      // 如果从列表页传递了点赞信息，直接使用
      likeCount: options.likeCount ? parseInt(options.likeCount) : 0,
      isLiked: options.isLiked === 'true',
      isLoading: true
    };
    console.log("initialData", initialData);
    this.setData(initialData);
    
    // 并行加载所有数据
    Promise.all([
      this.initLikeStatus(),
      this.loadComments()
    ]).then(() => {
      this.setData({
        isLoading: false
      });
    }).catch(err => {
      console.error('数据加载失败:', err);
      this.setData({
        isLoading: false
      });
    });
  },
  
  // 初始化点赞状态
  async initLikeStatus() {
    try {
      const openId = wx.getStorageSync('openId');
      if (!openId) return;
      
      // 查询点赞关联关系,获取对应图片的指定点赞用户id
      const { data: likeData } = await models.media_image.get({
        select: {
          connect_image_liked_users:{
            _id:true,
          },
        },
        filter: {
          where: {
            _id: {
              $eq: this.data.image_id
            }
          }
        },
      });
      
      if (!likeData || !likeData.connect_image_liked_users) {
        return;
      }
      
      // 从connect_image_liked_users查询是否有openId
      const isLiked = likeData.connect_image_liked_users.some(user => user._id === openId);
      
      // 设置点赞状态
      this.setData({
        likeCount: likeData.connect_image_liked_users.length,
        isLiked: isLiked,
        likeUsers: likeData.connect_image_liked_users
      });
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
    // 检查用户登录状态
    const loginStatus = wx.getStorageSync('loginStatus');
    const openId = wx.getStorageSync('openId');
    console.log("点赞状态", loginStatus);
    if (!loginStatus || !openId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 替换直接修改this.data的方式
      const newIsLiked = !this.data.isLiked;
      const newLikeCount = this.data.likeCount + (newIsLiked ? 1 : -1);
      
      // 使用setData更新状态，触发视图更新
      this.setData({
        isLiked: newIsLiked,
        likeCount: newLikeCount
      });
      
      if (newIsLiked) {
        //调用云函数
        const updatedLikeUsers = [...this.data.likeUsers, {_id: openId}];
        this.setData({
          likeUsers: updatedLikeUsers
        });
        
        const { resp } = await wx.cloud.callFunction({
          name: 'dataModelUpdate',
          data: {
            action: 'updateImageLikedUser',
            data: {
              object_id: this.data.image_id,
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
              object_id: this.data.image_id,
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
        likeCount: this.data.likeCount + (this.data.isLiked ? 1 : -1)
      });
      
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
    // 检查用户登录状态
    const loginStatus = wx.getStorageSync('loginStatus');
    const openId = wx.getStorageSync('openId');
    console.log("评论状态", loginStatus);
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