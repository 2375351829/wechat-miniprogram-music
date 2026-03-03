const app = getApp();
const { blessingApi } = require('../../services/api');
const { showLoading, hideLoading, showSuccess, showError, formatTime } = require('../../utils/util');

Page({
  data: {
    blessingTypes: [
      { index: 0, name: '生日祝福' },
      { index: 1, name: '节日祝福' },
      { index: 2, name: '毕业祝福' },
      { index: 3, name: '表白祝福' },
      { index: 4, name: '友情祝福' },
      { index: 5, name: '其他' }
    ],
    currentType: 0,
    receiver: '',
    content: '',
    isAnonymous: false,
    blessingList: [],
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.loadBlessingList();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadBlessingList();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMore();
    }
  },

  async loadBlessingList() {
    try {
      const res = await blessingApi.getList({
        page: 1,
        pageSize: this.data.pageSize
      });
      
      const list = (res.data.list || []).map(item => ({
        ...item,
        create_time: formatTime(item.create_time, 'MM-DD HH:mm')
      }));
      
      this.setData({
        blessingList: list,
        hasMore: list.length >= this.data.pageSize
      });
    } catch (err) {
      console.error('加载祝福列表失败:', err);
    }
  },

  async loadMore() {
    const { page, pageSize, blessingList } = this.data;
    
    try {
      const res = await blessingApi.getList({
        page: page + 1,
        pageSize
      });
      
      const list = (res.data.list || []).map(item => ({
        ...item,
        create_time: formatTime(item.create_time, 'MM-DD HH:mm')
      }));
      
      this.setData({
        blessingList: [...blessingList, ...list],
        page: page + 1,
        hasMore: list.length >= pageSize
      });
    } catch (err) {
      console.error('加载更多失败:', err);
    }
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentType: type
    });
  },

  onReceiverInput(e) {
    this.setData({
      receiver: e.detail.value
    });
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  toggleAnonymous() {
    this.setData({
      isAnonymous: !this.data.isAnonymous
    });
  },

  async submitBlessing() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    const { currentType, blessingTypes, receiver, content, isAnonymous } = this.data;
    
    if (!receiver) {
      showError('请输入接收者');
      return;
    }
    
    if (!content) {
      showError('请输入祝福内容');
      return;
    }
    
    showLoading('提交中...');
    
    try {
      await blessingApi.submit({
        type: currentType,
        typeName: blessingTypes[currentType].name,
        receiver,
        content,
        isAnonymous
      });
      
      hideLoading();
      showSuccess('提交成功，请等待审核');
      
      this.setData({
        receiver: '',
        content: '',
        isAnonymous: false
      });
      
      this.loadBlessingList();
    } catch (err) {
      hideLoading();
      console.error('提交祝福失败:', err);
      showError(err.message || '提交失败，请稍后重试');
    }
  }
});
