App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:6232/api'
  },

  onLaunch() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      
      this.checkTokenValid();
    }
  },

  async checkTokenValid() {
    try {
      const res = await this.request({
        url: '/users/check-login',
        method: 'GET'
      });
      
      if (res.code !== 0) {
        this.logout();
      }
    } catch (err) {
      console.error('检查登录状态失败:', err);
    }
  },

  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  request(options) {
    return new Promise((resolve, reject) => {
      const header = {
        'content-type': 'application/json',
        ...options.header
      };
      
      if (this.globalData.token) {
        header['Authorization'] = `Bearer ${this.globalData.token}`;
      }
      
      wx.request({
        url: this.globalData.baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data,
        header,
        success: (res) => {
          if (res.statusCode === 401) {
            this.logout();
            wx.navigateTo({
              url: '/pages/login/login'
            });
            reject(new Error('登录已过期'));
          } else {
            resolve(res.data);
          }
        },
        fail: reject
      });
    });
  },

  getUserInfo() {
    return this.globalData.userInfo;
  },

  isLoggedIn() {
    return !!this.globalData.token;
  }
});
