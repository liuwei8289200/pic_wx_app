Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/images/tabs/home.png",
      selectedIconPath: "/images/tabs/home-active.png",
      text: "首页"
    }, {
      pagePath: "/pages/contact/contact",
      iconPath: "/images/tabs/contact.png",
      selectedIconPath: "/images/tabs/contact-active.png",
      text: "我的"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})