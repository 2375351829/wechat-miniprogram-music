const app = getApp();

const request = (options) => {
  return new Promise((resolve, reject) => {
    const header = {
      'content-type': 'application/json',
      ...options.header
    };
    
    if (app.globalData.token) {
      header['Authorization'] = `Bearer ${app.globalData.token}`;
    }
    
    wx.request({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          app.logout();
          wx.navigateTo({
            url: '/pages/login/login'
          });
          reject(new Error('登录已过期'));
        } else if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data);
          } else {
            const errorMsg = res.data.msg || '请求失败';
            console.error(`API错误 [${options.url}]:`, errorMsg);
            reject(new Error(errorMsg));
          }
        } else if (res.statusCode >= 500) {
          console.error(`服务器错误 [${options.url}]:`, res.statusCode);
          reject(new Error('服务器错误，请稍后重试'));
        } else if (res.statusCode >= 400) {
          console.error(`客户端错误 [${options.url}]:`, res.statusCode);
          reject(new Error(`请求失败: ${res.statusCode}`));
        } else {
          console.error(`未知错误 [${options.url}]:`, res.statusCode);
          reject(new Error(`网络错误: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error(`请求失败 [${options.url}]:`, err);
        
        let errorMsg = '网络错误';
        if (err.errMsg && err.errMsg.includes('timeout')) {
          errorMsg = '请求超时，请检查网络连接';
        } else if (err.errMsg && err.errMsg.includes('fail')) {
          errorMsg = '网络连接失败，请检查网络设置';
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
        
        reject(new Error(errorMsg));
      }
    });
  });
};

const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

const formatDate = (date) => {
  return formatTime(date, 'YYYY-MM-DD');
};

const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const throttle = (fn, delay = 300) => {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last > delay) {
      last = now;
      fn.apply(this, args);
    }
  };
};

const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

const hideLoading = () => {
  wx.hideLoading();
};

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  });
};

const showSuccess = (title) => {
  showToast(title, 'success');
};

const showError = (title) => {
  showToast(title, 'none');
};

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已驳回',
    3: '已播放',
    4: '已取消'
  };
  return statusMap[status] || '未知';
};

const getStatusClass = (status) => {
  const classMap = {
    0: 'tag-pending',
    1: 'tag-approved',
    2: 'tag-rejected',
    3: 'tag-played',
    4: 'tag-muted'
  };
  return classMap[status] || '';
};

module.exports = {
  request,
  formatTime,
  formatDate,
  debounce,
  throttle,
  showLoading,
  hideLoading,
  showToast,
  showSuccess,
  showError,
  getStatusText,
  getStatusClass
};
