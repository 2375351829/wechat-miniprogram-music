const app = getApp();
const { homepageApi, songApi, requestApi, playApi } = require('../../services/api');
const { showLoading, hideLoading, showSuccess, showError, getStatusText, getStatusClass } = require('../../utils/util');

Page({
  data: {
    banners: [],
    announcements: [],
    hotSongs: [],
    newSongs: [],
    recommendSongs: [],
    config: {
      show_banners: 1,
      show_announcements: 1,
      show_hot_songs: 1,
      show_new_songs: 1,
      show_recommend_songs: 1,
      banner_auto_play: 1,
      banner_interval: 3000
    },
    currentPlaying: null,
    showModal: false,
    selectedSong: {
      id: null,
      name: '',
      singer: ''
    },
    receiver: '',
    blessing: ''
  },

  onLoad() {
    this.loadHomepageData();
    this.loadPlayDisplay();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },

  onPullDownRefresh() {
    this.loadHomepageData();
    this.loadPlayDisplay();
    wx.stopPullDownRefresh();
  },

  async loadHomepageData() {
    try {
      const res = await homepageApi.getData();
      
      this.setData({
        banners: res.data.banners || [],
        announcements: res.data.announcements || [],
        hotSongs: res.data.hotSongs || [],
        newSongs: res.data.newSongs || [],
        recommendSongs: res.data.recommendSongs || [],
        config: res.data.config || this.data.config
      });
    } catch (err) {
      console.error('加载首页数据失败:', err);
      wx.showToast({
        title: '加载失败，请检查网络',
        icon: 'none',
        duration: 2000
      });
    }
  },

  async loadPlayDisplay() {
    try {
      const res = await playApi.getDisplay();
      
      this.setData({
        currentPlaying: res.data.currentPlaying
      });
    } catch (err) {
      console.error('加载播放数据失败:', err);
      wx.showToast({
        title: '播放数据加载失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  showAnnouncements() {
    wx.showModal({
      title: '公告',
      content: this.data.announcements.map(a => a.title + '\n' + a.content).join('\n\n'),
      showCancel: false
    });
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  selectSong(e) {
    const song = e.currentTarget.dataset.song;
    
    this.setData({
      showModal: true,
      selectedSong: {
        id: song.id,
        name: song.name,
        singer: song.singer
      }
    });
  },

  openRequestModal() {
    this.setData({
      showModal: true,
      selectedSong: {
        id: null,
        name: '',
        singer: ''
      },
      receiver: '',
      blessing: ''
    });
  },

  closeModal() {
    this.setData({
      showModal: false
    });
  },

  onSongNameInput(e) {
    this.setData({
      'selectedSong.name': e.detail.value
    });
  },

  onSingerInput(e) {
    this.setData({
      'selectedSong.singer': e.detail.value
    });
  },

  onReceiverInput(e) {
    this.setData({
      receiver: e.detail.value
    });
  },

  onBlessingInput(e) {
    this.setData({
      blessing: e.detail.value
    });
  },

  async submitRequest() {
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    const { selectedSong, receiver, blessing } = this.data;
    
    if (!selectedSong.name) {
      showError('请输入歌曲名称');
      return;
    }
    
    if (!selectedSong.singer) {
      showError('请输入歌手名称');
      return;
    }
    
    showLoading('提交中...');
    
    try {
      await requestApi.submit({
        songId: selectedSong.id,
        songName: selectedSong.name,
        singer: selectedSong.singer,
        receiver: receiver,
        blessing: blessing
      });
      
      hideLoading();
      showSuccess('提交成功，请等待审核');
      
      this.closeModal();
      
      this.setData({
        selectedSong: { id: null, name: '', singer: '' },
        receiver: '',
        blessing: ''
      });
    } catch (err) {
      hideLoading();
      console.error('提交请求失败:', err);
      showError(err.message || '提交失败，请稍后重试');
    }
  }
});
