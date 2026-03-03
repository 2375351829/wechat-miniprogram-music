const app = getApp();
const { request } = require('../utils/util');

const userApi = {
  login: (data) => request({ url: '/users/login', method: 'POST', data }),
  
  loginByStudent: (data) => request({ url: '/users/login-by-student', method: 'POST', data }),
  
  bindStudent: (data) => request({ url: '/users/bind-student', method: 'POST', data }),
  
  getUserInfo: () => request({ url: '/users/info', method: 'GET' }),
  
  updateUserInfo: (data) => request({ url: '/users/info', method: 'PUT', data }),
  
  logout: () => request({ url: '/users/logout', method: 'POST' }),
  
  getUserStats: () => request({ url: '/users/stats', method: 'GET' }),
  
  changePassword: (data) => request({ url: '/users/change-password', method: 'POST', data }),
  
  getUserHistory: (params) => request({ url: '/users/history', method: 'GET', data: params })
};

const songApi = {
  search: (keyword) => request({ url: '/songs/search', method: 'GET', data: { keyword } }),
  
  getList: (params) => request({ url: '/songs/list', method: 'GET', data: params }),
  
  getHot: () => request({ url: '/songs/hot', method: 'GET' }),
  
  getNew: () => request({ url: '/songs/new', method: 'GET' }),
  
  getDetail: (id) => request({ url: `/songs/${id}`, method: 'GET' })
};

const requestApi = {
  submit: (data) => request({ url: '/requests/submit', method: 'POST', data }),
  
  getMy: (params) => request({ url: '/requests/my', method: 'GET', data: params }),
  
  getHistory: (params) => request({ url: '/requests/history', method: 'GET', data: params }),
  
  getToday: () => request({ url: '/requests/today', method: 'GET' }),
  
  cancel: (id) => request({ url: `/requests/${id}/cancel`, method: 'PUT' })
};

const blessingApi = {
  submit: (data) => request({ url: '/blessings/submit', method: 'POST', data }),
  
  getMy: (params) => request({ url: '/blessings/my', method: 'GET', data: params }),
  
  getList: (params) => request({ url: '/blessings/list', method: 'GET', data: params }),
  
  cancel: (id) => request({ url: `/blessings/${id}/cancel`, method: 'PUT' })
};

const homepageApi = {
  getData: () => request({ url: '/homepage/data', method: 'GET' }),
  
  getBanners: () => request({ url: '/homepage/banners', method: 'GET' }),
  
  getAnnouncements: () => request({ url: '/homepage/announcements', method: 'GET' }),
  
  getRecommendSongs: () => request({ url: '/homepage/recommend-songs', method: 'GET' })
};

const playApi = {
  getDisplay: () => request({ url: '/play/display', method: 'GET' }),
  
  getHistory: (params) => request({ url: '/play/history', method: 'GET', data: params })
};

module.exports = {
  userApi,
  songApi,
  requestApi,
  blessingApi,
  homepageApi,
  playApi
};
