// pages/detail/detail.js
Page({
  data: {
      imageUrl: '',
      comments: [],
      newComment: ''
  },
  onLoad(options) {
      this.setData({
          imageUrl: options.imageUrl // 获取传递的图片 URL
      });
  },
  like() {
      // 实现点赞逻辑
      wx.showToast({
          title: '点赞成功',
          icon: 'success'
      });
  },
  onCommentInput(event) {
      this.setData({
          newComment: event.detail.value // 更新评论输入
      });
  },
  submitComment() {
      const { comments, newComment } = this.data;
      if (newComment) {
          this.setData({
              comments: [...comments, newComment], // 添加新评论
              newComment: '' // 清空输入框
          });
      }
  }
});