const app = getApp();
const { userApi } = require('../../services/api');
const { showLoading, hideLoading, showSuccess, showError } = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    stats: {},
    unreadCount: 0,
    showEditModal: false,
    showPasswordModal: false,
    editField: '',
    editLabel: '',
    editValue: '',
    maxLength: 50,
    saving: false,
    passwordForm: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      });
    }
    this.loadUserInfo();
  },

  onPullDownRefresh() {
    this.loadUserInfo();
    wx.stopPullDownRefresh();
  },

  async loadUserInfo() {
    const isLoggedIn = app.isLoggedIn();
    
    this.setData({
      isLoggedIn,
      userInfo: isLoggedIn ? app.globalData.userInfo : null
    });
    
    if (isLoggedIn) {
      try {
        showLoading('加载中...');
        
        let userInfo = null;
        let stats = {};
        
        try {
          const infoRes = await userApi.getUserInfo();
          if (infoRes.code === 0) {
            userInfo = infoRes.data;
            stats = infoRes.data.stats || {};
          }
        } catch (err) {
          console.error('获取用户信息失败:', err);
        }
        
        try {
          const statsRes = await userApi.getUserStats();
          if (statsRes.code === 0) {
            stats = { ...stats, ...statsRes.data };
          }
        } catch (err) {
          console.error('获取统计数据失败:', err);
        }
        
        hideLoading();
        
        if (userInfo) {
          this.setData({
            userInfo,
            stats
          });
          
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
        } else {
          showError('获取用户信息失败');
        }
      } catch (err) {
        hideLoading();
        console.error('加载用户信息失败:', err);
        showError('加载用户信息失败');
      }
    }
  },

  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  editField(e) {
    const { field, label, value } = e.currentTarget.dataset;
    
    let maxLength = 50;
    if (field === 'phone') {
      maxLength = 11;
    } else if (field === 'enrollment_year') {
      maxLength = 4;
    } else if (field === 'real_name') {
      maxLength = 20;
    } else if (field === 'nickname') {
      maxLength = 30;
    }
    
    this.setData({
      showEditModal: true,
      editField: field,
      editLabel: label,
      editValue: value || '',
      maxLength
    });
  },

  closeEditModal() {
    this.setData({
      showEditModal: false,
      editField: '',
      editLabel: '',
      editValue: ''
    });
  },

  onEditInput(e) {
    this.setData({
      editValue: e.detail.value
    });
  },

  validateField(field, value) {
    if (!value || !value.trim()) {
      return { valid: true };
    }
    
    switch (field) {
      case 'phone':
        if (!/^1[3-9]\d{9}$/.test(value)) {
          return { valid: false, message: '请输入正确的手机号' };
        }
        break;
      case 'enrollment_year':
        if (!/^\d{4}$/.test(value)) {
          return { valid: false, message: '请输入正确的年份，如2024' };
        }
        const year = parseInt(value);
        if (year < 2000 || year > new Date().getFullYear() + 1) {
          return { valid: false, message: '年份应在2000年至明年之间' };
        }
        break;
      case 'real_name':
        if (value.length < 2) {
          return { valid: false, message: '姓名至少2个字符' };
        }
        break;
    }
    
    return { valid: true };
  },

  async saveField() {
    const { editField, editValue } = this.data;
    
    const validation = this.validateField(editField, editValue);
    if (!validation.valid) {
      showError(validation.message);
      return;
    }
    
    this.setData({ saving: true });
    showLoading('保存中...');
    
    try {
      const updateData = {};
      updateData[editField] = editValue.trim();
      
      const res = await userApi.updateUserInfo(updateData);
      
      hideLoading();
      this.setData({ saving: false });
      
      if (res.code === 0) {
        showSuccess('保存成功');
        this.closeEditModal();
        this.loadUserInfo();
      } else {
        showError(res.msg || '保存失败');
      }
    } catch (err) {
      hideLoading();
      this.setData({ saving: false });
      showError(err.message || '保存失败');
    }
  },

  changePassword() {
    this.setData({
      showPasswordModal: true,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    });
  },

  closePasswordModal() {
    this.setData({
      showPasswordModal: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    });
  },

  onOldPasswordInput(e) {
    this.setData({
      'passwordForm.oldPassword': e.detail.value
    });
  },

  onNewPasswordInput(e) {
    this.setData({
      'passwordForm.newPassword': e.detail.value
    });
  },

  onConfirmPasswordInput(e) {
    this.setData({
      'passwordForm.confirmPassword': e.detail.value
    });
  },

  validatePasswordForm() {
    const { oldPassword, newPassword, confirmPassword } = this.data.passwordForm;
    
    if (!oldPassword) {
      showError('请输入原密码');
      return false;
    }
    
    if (!newPassword) {
      showError('请输入新密码');
      return false;
    }
    
    if (newPassword.length < 6) {
      showError('新密码至少6位');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      showError('两次输入的密码不一致');
      return false;
    }
    
    if (oldPassword === newPassword) {
      showError('新密码不能与原密码相同');
      return false;
    }
    
    return true;
  },

  async savePassword() {
    if (!this.validatePasswordForm()) return;
    
    const { oldPassword, newPassword } = this.data.passwordForm;
    
    this.setData({ saving: true });
    showLoading('修改中...');
    
    try {
      const res = await userApi.changePassword({
        oldPassword,
        newPassword
      });
      
      hideLoading();
      this.setData({ saving: false });
      
      if (res.code === 0) {
        showSuccess('密码修改成功');
        this.closePasswordModal();
      } else {
        showError(res.msg || '修改失败');
      }
    } catch (err) {
      hideLoading();
      this.setData({ saving: false });
      showError(err.message || '修改失败');
    }
  },

  viewHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  },

  viewNotifications() {
    wx.navigateTo({
      url: '/pages/notifications/notifications'
    });
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '校园点歌台是一个为师生提供点歌和送祝福服务的平台。\n\n版本: 1.0.0\n\n如有问题请联系管理员。',
      showCancel: false
    });
  },

  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系管理员或发送邮件至：\ncampus-radio@example.com',
      showCancel: false
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          
          this.setData({
            userInfo: null,
            isLoggedIn: false,
            stats: {}
          });
          
          showSuccess('已退出登录');
        }
      }
    });
  }
});
