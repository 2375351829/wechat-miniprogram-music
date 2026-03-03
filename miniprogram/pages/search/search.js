const app = getApp();
const { songApi } = require('../../services/api');
const { showLoading, hideLoading, showSuccess, showError, formatTime } = require('../../utils/util');

Page({
  data: {
    keyword: '',
    searchResults: [],
    hotSongs: [],
    recentSongs: [],
    historyKeywords: [],
    historySongs: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    currentTab: 'hot'
  },

  onLoad() {
    this.loadHotSongs();
  },

  onKeywordInput(e) {
    this.setData({
      keyword: e.detail.value.trim()
    });
  },

  onSearch() {
    const { keyword } = this.data;
    
    if (!keyword) {
      showError('请输入搜索关键词');
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await songApi.search(keyword);
      
      this.setData({
        searchResults: res.data || [],
        hotSongs: [],
        recentSongs: [],
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
      showError(err.message || '搜索失败');
    }
  },

  async loadHotSongs() {
    try {
      const res = await songApi.getHot();
      this.setData({
        hotSongs: res.data || []
      });
    } catch (err) {
      console.error('加载热门歌曲失败:', err);
    }
  },

  async loadRecentSongs() {
    try {
      const res = await songApi.getNew();
      this.setData({
        recentSongs: res.data || []
      });
    } catch (err) {
      console.error('加载最新歌曲失败:', err);
    }
  },

  clearSearch() {
    this.setData({
      keyword: '',
      searchResults: []
    });
  },

  selectSong(e) {
    const song = e.currentTarget.dataset.song;
    
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage.route.includes('pages/index/index')) {
      currentPage.selectSong({ detail: { song } });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});
