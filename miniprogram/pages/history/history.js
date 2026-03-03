const app = getApp();
const { requestApi, blessingApi, playApi } = require('../../services/api');
const { formatTime, getStatusText, showSuccess, showError, showLoading, hideLoading } = require('../../utils/util');

Page({
  data: {
    currentTab: 'request',
    currentStatus: '',
    requestList: [],
    blessingList: [],
    playList: [],
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.checkLoginAndLoad();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadList();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMore();
    }
  },

  checkLoginAndLoad() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.loadList();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      currentStatus: '',
      page: 1,
      hasMore: true
    });
    this.loadList();
  },

  filterByStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status,
      page: 1,
      hasMore: true
    });
    this.loadList();
  },

  async loadList() {
    const { currentTab, currentStatus, pageSize } = this.data;
    
    try {
      let res;
      
      if (currentTab === 'request') {
        res = await requestApi.getMy({
          page: 1,
          pageSize,
          status: currentStatus
        });
        
        const list = (res.data.list || []).map(item => ({
          ...item,
          create_time: formatTime(item.create_time, 'MM-DD HH:mm'),
          statusText: getStatusText(item.status),
          statusClass: this.getStatusClass(item.status)
        }));
        
        this.setData({
          requestList: list,
          hasMore: list.length === pageSize
        });
      } else if (currentTab === 'blessing') {
        res = await blessingApi.getMy({
          page: 1,
          pageSize
        });
        
        const list = (res.data.list || []).map(item => ({
          ...item,
          create_time: formatTime(item.create_time, 'MM-DD HH:mm'),
          statusText: getStatusText(item.status),
          statusClass: this.getStatusClass(item.status)
        }));
        
        this.setData({
          blessingList: list,
          hasMore: list.length === pageSize
        });
      } else if (currentTab === 'play') {
        res = await playApi.getHistory({
          page: 1,
          pageSize
        });
        
        const list = (res.data.list || []).map(item => ({
          ...item,
          playTime: formatTime(item.playTime, 'MM-DD HH:mm')
        }));
        
        this.setData({
          playList: list,
          hasMore: list.length === pageSize
        });
      }
    } catch (err) {
      console.error('加载列表失败:', err);
      this.setData({
        requestList: [],
        blessingList: [],
        playList: [],
        hasMore: false
      });
    }
  },

  async loadMore() {
    const { currentTab, currentStatus, page, pageSize, requestList, blessingList, playList } = this.data;
    
    try {
      let res;
      const nextPage = page + 1;
      
      if (currentTab === 'request') {
        res = await requestApi.getMy({
          page: nextPage,
          pageSize,
          status: currentStatus
        });
        
        const list = (res.data.list || []).map(item => ({
          ...item,
          create_time: formatTime(item.create_time, 'MM-DD HH:mm'),
          statusText: getStatusText(item.status),
          statusClass: this.getStatusClass(item.status)
        }));
        
        this.setData({
          requestList: [...requestList, ...list],
          page: nextPage,
          hasMore: list.length === pageSize
        });
      } else if (currentTab === 'blessing') {
        res = await blessingApi.getMy({
          page: nextPage,
          pageSize
        });
        
        const list = (res.data.list || []).map(item => ({
          ...item,
          create_time: formatTime(item.create_time, 'MM-DD HH:mm'),
          statusText: getStatusText(item.status),
          statusClass: this.getStatusClass(item.status)
        }));
        
        this.setData({
          blessingList: [...blessingList, ...list],
          page: nextPage,
          hasMore: list.length === pageSize
        });
      } else if (currentTab === 'play') {
        res = await playApi.getHistory({
          page: nextPage,
          pageSize
        });
        
        const list = (res.data.list || []).map(item => ({
          ...item,
          playTime: formatTime(item.playTime, 'MM-DD HH:mm')
        }));
        
        this.setData({
          playList: [...playList, ...list],
          page: nextPage,
          hasMore: list.length === pageSize
        });
      }
    } catch (err) {
      console.error('加载更多失败:', err);
    }
  },

  async cancelRequest(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这条点歌请求吗？',
      success: async (res) => {
        if (res.confirm) {
          showLoading('取消中...');
          
          try {
            await requestApi.cancel(id);
            hideLoading();
            showSuccess('已取消');
            this.loadList();
          } catch (err) {
            hideLoading();
            showError(err.message || '取消失败');
          }
        }
      }
    });
  },

  getStatusClass(status) {
    const classMap = {
      0: 'tag-pending',
      1: 'tag-approved',
      2: 'tag-rejected',
      3: 'tag-played',
      4: 'tag-muted'
    };
    return classMap[status] || '';
  }
});
