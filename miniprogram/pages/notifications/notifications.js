const app = getApp();
const { formatTime } = require('../../utils/util');

Page({
  data: {
    notifications: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    unreadCount: 0
  },

  onLoad() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.loadNotifications();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadNotifications();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  async loadNotifications() {
    this.setData({ loading: true });
    
    try {
      const res = await this.fetchNotifications(1);
      const list = (res.data?.list || []).map(item => ({
        ...item,
        create_time: formatTime(item.create_time, 'MM-DD HH:mm')
      }));
      
      const unreadCount = list.filter(n => n.is_read === 0).length;
      
      this.setData({
        notifications: list,
        hasMore: list.length >= this.data.pageSize,
        loading: false,
        unreadCount
      });
    } catch (err) {
      console.error('加载通知失败:', err);
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    const { page, pageSize, notifications } = this.data;
    this.setData({ loading: true });
    
    try {
      const res = await this.fetchNotifications(page + 1);
      const list = (res.data?.list || []).map(item => ({
        ...item,
        create_time: formatTime(item.create_time, 'MM-DD HH:mm')
      }));
      
      const newNotifications = [...notifications, ...list];
      const unreadCount = newNotifications.filter(n => n.is_read === 0).length;
      
      this.setData({
        notifications: newNotifications,
        page: page + 1,
        hasMore: list.length >= pageSize,
        loading: false,
        unreadCount
      });
    } catch (err) {
      console.error('加载更多失败:', err);
      this.setData({ loading: false });
    }
  },

  fetchNotifications(page) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.baseUrl + '/users/notifications',
        method: 'GET',
        data: { page, pageSize: this.data.pageSize },
        header: {
          'Authorization': `Bearer ${app.globalData.token}`,
          'content-type': 'application/json'
        },
        success: (res) => {
          if (res.data.code === 0) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.msg));
          }
        },
        fail: reject
      });
    });
  },

  async markAsRead(e) {
    const id = e.currentTarget.dataset.id;
    
    try {
      await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/users/notifications/${id}/read`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${app.globalData.token}`,
            'content-type': 'application/json'
          },
          success: (res) => {
            if (res.data.code === 0) resolve();
            else reject();
          },
          fail: reject
        });
      });
      
      const { notifications } = this.data;
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications[index].is_read = 1;
        const unreadCount = notifications.filter(n => n.is_read === 0).length;
        this.setData({ notifications, unreadCount });
      }
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  },

  async markAllAsRead() {
    try {
      await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/users/notifications/read-all`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${app.globalData.token}`,
            'content-type': 'application/json'
          },
          success: (res) => {
            if (res.data.code === 0) resolve();
            else reject();
          },
          fail: reject
        });
      });
      
      const { notifications } = this.data;
      notifications.forEach(n => n.is_read = 1);
      this.setData({ notifications, unreadCount: 0 });
      
      wx.showToast({
        title: '已全部标记已读',
        icon: 'success'
      });
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  viewDetail(e) {
    const notification = e.currentTarget.dataset.item;
    
    this.markAsRead(e);
    
    if (notification.type === 'request_audit') {
      wx.switchTab({
        url: '/pages/history/history'
      });
    } else if (notification.type === 'blessing_audit') {
      wx.switchTab({
        url: '/pages/history/history'
      });
    } else {
      wx.showModal({
        title: notification.title,
        content: notification.content,
        showCancel: false
      });
    }
  },

  getTypeText(type) {
    const typeMap = {
      'request_audit': '点歌审核',
      'blessing_audit': '祝福审核',
      'system': '系统通知',
      'announcement': '公告'
    };
    return typeMap[type] || '通知';
  }
});
