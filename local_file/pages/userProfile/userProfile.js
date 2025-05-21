// pages/userProfile/userProfile.js
const { init } = require("@cloudbase/wx-cloud-client-sdk");
const client = init(wx.cloud);
const models = client.models;

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    avatar: defaultAvatarUrl,
    user_name: '',
    isUploading: false
  },
  
  onLoad() {
    // 获取已存储的用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    console.log("userInfo", userInfo)
    if (userInfo.avatar) {
      this.setData({
        avatar: userInfo.avatar
      });
    }
    if (userInfo.user_name) {
      this.setData({
        user_name: userInfo.user_name
      });
    }
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    console.log("avatar", avatarUrl)
    this.setData({
      avatar: avatarUrl
    });
  },
  
  onNicknameInput(e) {
    this.setData({
      user_name: e.detail.value
    });
  },
  
  async saveUserInfo() {
    if (!this.data.user_name.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isUploading: true });
    
    try {
      // 初始化云函数环境
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        return;
      }
      //这个时候openid一定不是空了，因为进来的时候app.js已经初始化过了
      const openId = wx.getStorageSync('openId') || '';
      
      // 上传头像到云存储
      let avatar = this.data.avatar;
      
      // 如果头像被更改过（不是默认头像且不是已有的云存储链接）
      if (avatar !== defaultAvatarUrl && !avatar.includes('cloud://')) {
        wx.showLoading({ title: '上传头像中...' });
        
        // 获取临时文件路径
        const tempFilePath = avatar;
        
        // 生成随机文件名
        const cloudPath = `avatar/${openId || 'unknown'}_${Date.now()}.png`;
        
        // 上传图片到云存储
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath,
        });
        
        wx.hideLoading();
        
        if (uploadRes.fileID) {
          avatar = uploadRes.fileID;
        } else {
          throw new Error('上传头像失败');
        }
      }
      
      // 构建用户信息
      const userInfo = {
        avatar: avatar,
        user_name: this.data.user_name,
      };
      
      // 保存到本地缓存
      wx.setStorageSync('userInfo', userInfo);
      
      // 保存到云数据库
      wx.showLoading({ title: '保存信息中...' });
      
      // 检查用户记录是否已存在
      console.log("openId", openId)
      console.log("userInfo", userInfo)
      const userQuery = await models.user_info.get({
        filter: {
          where: {
            $and: [
              {
                openid: {
                  $eq: openId, // 推荐传入_id数据标识进行操作
                },
              },
            ]
          }
        },
      });
      console.log("userQuery", userQuery)
      
      if (Object.keys(userQuery.data).length > 0) {
        // 更新现有记录
        
        const {data} = await models.user_info.update({
          data: {
              user_name: this.data.user_name,  // 用户名称
              openid: openId,  // openid
              avatar: avatar,  // 头像链接
            },
          filter: {
            where: {
              $and: [
                {
                  openid: {
                    $eq: openId, // 推荐传入_id数据标识进行操作
                  },
                },
              ]
            }
          }
        });
        console.log("更新用户信息结果", data)      
        if (Object.keys(data).length > 0) {
          wx.setStorageSync('loginStatus', true);
          userInfo.user_name = this.data.user_name;
          userInfo.avatar = avatar;
          wx.setStorageSync('userInfo', userInfo);
        }else{
          //抛一个异常
          throw new Error('自己抛出异常：更新用户信息失败');
        }
      } else {
        // 创建新记录
        const {data} = await models.user_info.create({
          data: {
              user_name: this.data.user_name,  // 用户名称
              openid: openId,  // openid
              avatar: avatar,  // 头像链接
              _id: openId,
            }
        });
        console.log("创建用户信息结果", data)
        if (Object.keys(data).length > 0) {
          wx.setStorageSync('loginStatus', true);
          userInfo.user_name = this.data.user_name;
          userInfo.avatar = avatar;
          wx.setStorageSync('userInfo', userInfo);
        }else{
          //抛一个异常
          throw new Error('自己抛出异常：创建用户信息失败');
        }
      }
      
      wx.hideLoading();
      
      // 触发用户信息更新事件
      // const eventChannel = this.getOpenerEventChannel();
      // if (eventChannel && eventChannel.emit) {
      //   eventChannel.emit('userInfoUpdated', userInfo);
      // }
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    } catch (error) {
      console.error('保存用户信息失败', error);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败: ' + error.message,
        icon: 'none'
      });
    } finally {
      this.setData({ isUploading: false });
    }
  }
}); 