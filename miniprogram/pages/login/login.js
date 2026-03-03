const app = getApp();
const { userApi } = require('../../services/api');
const { showLoading, hideLoading, showError, showSuccess } = require('../../utils/util');

Page({
  data: {
    studentId: '',
    password: '',
    showPassword: false,
    loading: false
  },

  onLoad(options) {
    if (app.isLoggedIn()) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  onStudentIdInput(e) {
    this.setData({
      studentId: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  validateForm() {
    const { studentId, password } = this.data;
    
    if (!studentId.trim()) {
      showError('请输入学号');
      return false;
    }
    
    if (studentId.length < 3) {
      showError('学号格式不正确');
      return false;
    }
    
    if (!password) {
      showError('请输入密码');
      return false;
    }
    
    if (password.length < 6) {
      showError('密码长度不能少于6位');
      return false;
    }
    
    return true;
  },

  async studentLogin() {
    if (!this.validateForm()) return;
    
    const { studentId, password } = this.data;
    
    this.setData({ loading: true });
    showLoading('登录中...');
    
    try {
      const res = await userApi.loginByStudent({
        student_id: studentId.trim(),
        password: password
      });
      
      hideLoading();
      this.setData({ loading: false });
      
      if (res.code === 0) {
        app.globalData.token = res.data.token;
        app.globalData.userInfo = res.data.userInfo;
        
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userInfo', res.data.userInfo);
        
        showSuccess('登录成功');
        
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 500);
      } else {
        showError(res.msg || '登录失败');
      }
    } catch (err) {
      hideLoading();
      this.setData({ loading: false });
      showError(err.message || '登录失败，请检查网络');
    }
  }
});
