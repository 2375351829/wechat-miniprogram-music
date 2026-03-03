const API_BASE_URL = 'http://localhost:6232/api';
const CACHE_PREFIX = 'admin_cache_';
const CACHE_DURATION = 5 * 60 * 1000;

const api = {
    token: null,
    refreshTokenPromise: null,
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('admin_token', token);
    },
    
    getToken() {
        if (!this.token) {
            this.token = localStorage.getItem('admin_token');
        }
        return this.token;
    },
    
    clearToken() {
        this.token = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        this.clearAllCache();
    },
    
    clearAllCache() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },
    
    getCache(key) {
        const cacheKey = CACHE_PREFIX + key;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
            localStorage.removeItem(cacheKey);
            return null;
        } catch {
            return null;
        }
    },
    
    setCache(key, data) {
        const cacheKey = CACHE_PREFIX + key;
        localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    },
    
    removeCache(key) {
        localStorage.removeItem(CACHE_PREFIX + key);
    },
    
    showError(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            background: #e74c3c; color: #fff; border-radius: 4px;
            z-index: 9999; animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    },
    
    showSuccess(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            background: #27ae60; color: #fff; border-radius: 4px;
            z-index: 9999; animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    },
    
    showInfo(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            background: #3498db; color: #fff; border-radius: 4px;
            z-index: 9999; animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    },
    
    async request(url, options = {}) {
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const requestId = `${options.method || 'GET'}_${url}_${Date.now()}`;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            const response = await fetch(API_BASE_URL + url, {
                ...options,
                headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.status === 401) {
                this.clearToken();
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html')) {
                    this.showError('登录已过期，请重新登录');
                    setTimeout(() => {
                        window.location.href = 'pages/login.html';
                    }, 1000);
                }
                return { code: 401, msg: '未授权，请重新登录' };
            }
            
            if (response.status === 403) {
                this.showError('没有权限执行此操作');
                return { code: 403, msg: '没有权限' };
            }
            
            if (response.status === 404) {
                return { code: 404, msg: '请求的资源不存在' };
            }
            
            if (response.status === 500) {
                this.showError('服务器错误，请稍后重试');
                return { code: 500, msg: '服务器错误' };
            }
            
            if (!response.ok) {
                return { code: response.status, msg: `请求失败: ${response.statusText}` };
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                this.showError('请求超时，请检查网络连接');
                return { code: 408, msg: '请求超时' };
            }
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showError('网络连接失败，请检查网络');
                return { code: 0, msg: '网络连接失败' };
            }
            
            console.error('API请求失败:', error);
            this.showError('请求失败，请稍后重试');
            return { code: 500, msg: '请求失败' };
        }
    },
    
    async get(url, params = {}, useCache = false) {
        const filteredParams = {};
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                filteredParams[key] = params[key];
            }
        });
        
        const queryString = new URLSearchParams(filteredParams).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        const cacheKey = `${url}_${queryString}`;
        
        if (useCache) {
            const cached = this.getCache(cacheKey);
            if (cached) {
                return cached;
            }
        }
        
        const result = await this.request(fullUrl, { method: 'GET' });
        
        if (useCache && result.code === 0) {
            this.setCache(cacheKey, result);
        }
        
        return result;
    },
    
    async post(url, data = {}) {
        this.removeCache(url);
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async put(url, data = {}) {
        this.removeCache(url);
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async delete(url) {
        this.removeCache(url);
        return this.request(url, { method: 'DELETE' });
    },
    
    isLoggedIn() {
        return !!this.getToken();
    },
    
    admin: {
        login: async (data) => {
            const res = await api.post('/admin/login', data);
            if (res.code === 0 && res.data) {
                api.setToken(res.data.token);
                localStorage.setItem('admin_info', JSON.stringify(res.data.adminInfo || res.data));
            }
            return res;
        },
        logout: async () => {
            await api.post('/admin/logout');
            api.clearToken();
        },
        getInfo: () => api.get('/admin/info'),
        changePassword: (data) => api.put('/admin/password', data),
        getDashboard: () => api.get('/admin/dashboard'),
        getList: (params) => api.get('/admin/list', params),
        create: (data) => api.post('/admin/create', data),
        update: (id, data) => api.put(`/admin/${id}`, data),
        updateStatus: (id, data) => api.put(`/admin/${id}/status`, data),
        delete: (id) => api.delete(`/admin/${id}`)
    },
    
    user: {
        getList: (params, useCache = false) => api.get('/users/list', params, useCache),
        getDetail: (id) => api.get(`/users/${id}`),
        update: (id, data) => api.put(`/users/${id}`, data),
        updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
        resetPassword: (id, password) => api.put(`/users/${id}/password`, { password }),
        delete: (id) => api.delete(`/users/${id}`),
        batchDeleteUsers: (ids) => api.post('/users/batch-delete', { ids }),
        batchUpdateStatus: (data) => api.post('/users/batch-status', data),
        batchUpdateUsers: (data) => api.post('/users/batch-update', data),
        batchResetPassword: (data) => api.post('/users/batch-reset-password', data),
        exportUsers: (params) => api.get('/users/export', params),
        importUsers: (data) => api.post('/users/import', data),
        getColleges: () => api.get('/users/colleges'),
        getMajors: (college) => api.get('/users/majors', { college }),
        getGrades: () => api.get('/users/grades'),
        getClasses: (params) => api.get('/users/classes', params)
    },
    
    song: {
        getList: (params, useCache = false) => api.get('/songs/list', params, useCache),
        getDetail: (id) => api.get(`/songs/${id}`),
        search: (keyword) => api.get('/songs/search', { keyword }),
        add: (data) => api.post('/songs', data),
        update: (id, data) => api.put(`/songs/${id}`, data),
        delete: (id) => api.delete(`/songs/${id}`),
        updateStatus: (id, data) => api.put(`/songs/${id}/status`, data),
        batchAdd: (songs, conflictStrategy) => api.post('/songs/batch', { songs, conflictStrategy }),
        batchDelete: (ids) => api.post('/songs/batch-delete', { ids }),
        batchStatus: (ids, status) => api.post('/songs/batch-status', { ids, status }),
        batchUpdate: (ids, data) => api.post('/songs/batch-update', { ids, data }),
        importSongs: (songs, conflictStrategy) => api.post('/songs/import', { songs, conflictStrategy }),
        exportSongs: (params) => api.get('/songs/export', params),
        getHot: () => api.get('/songs/hot'),
        getNew: () => api.get('/songs/new')
    },
    
    category: {
        getList: () => api.get('/songs/categories'),
        add: (data) => api.post('/songs/categories', data),
        update: (id, data) => api.put(`/songs/categories/${id}`, data),
        delete: (id) => api.delete(`/songs/categories/${id}`)
    },
    
    songRequest: {
        getList: (params) => api.get('/requests/list', params),
        getPending: (params) => api.get('/requests/pending', params),
        getHistory: (params) => api.get('/requests/history', params),
        getToday: () => api.get('/requests/today'),
        audit: (id, data) => api.put(`/requests/${id}/audit`, data),
        batchAudit: (data) => api.post('/requests/batch-audit', data),
        markPlayed: (id) => api.put(`/requests/${id}/play`),
        delete: (id) => api.delete(`/requests/${id}`)
    },
    
    blessing: {
        getPending: (params) => api.get('/blessings/pending', params),
        getList: (params) => api.get('/blessings/list', params),
        audit: (id, data) => api.put(`/blessings/${id}/audit`, data),
        batchAudit: (data) => api.post('/blessings/batch-audit', data),
        delete: (id) => api.delete(`/blessings/${id}`)
    },
    
    play: {
        getDisplay: () => api.get('/play/display'),
        getQueue: (params) => api.get('/play/queue', params),
        getHistory: (params) => api.get('/play/history', params),
        getStats: () => api.get('/play/stats'),
        getStatus: () => api.get('/play/status'),
        togglePlay: (action) => api.post('/play/toggle', { action }),
        updateProgress: (currentTime, duration) => api.put('/play/progress', { currentTime, duration }),
        updateVolume: (volume) => api.put('/play/volume', { volume }),
        setPlayMode: (mode) => api.put('/play/mode', { mode }),
        playNext: () => api.post('/play/next'),
        stop: () => api.post('/play/stop'),
        updateOrder: (data) => api.put('/play/order', data),
        addSongToQueue: (songId) => api.post('/play/add-song', { songId }),
        removeFromQueue: (id) => api.delete(`/play/queue/${id}`),
        deleteHistory: (id) => api.delete(`/play/history/${id}`),
        batchDeleteHistory: (ids) => api.post('/play/history/batch-delete', { ids }),
        updateHistory: (id, data) => api.put(`/play/history/${id}`, data)
    },
    
    homepage: {
        getData: () => api.get('/homepage/data'),
        getBanners: () => api.get('/homepage/banners'),
        addBanner: (data) => api.post('/homepage/banners', data),
        updateBanner: (id, data) => api.put(`/homepage/banners/${id}`, data),
        deleteBanner: (id) => api.delete(`/homepage/banners/${id}`),
        getAnnouncements: () => api.get('/homepage/announcements'),
        addAnnouncement: (data) => api.post('/homepage/announcements', data),
        updateAnnouncement: (id, data) => api.put(`/homepage/announcements/${id}`, data),
        deleteAnnouncement: (id) => api.delete(`/homepage/announcements/${id}`),
        getRecommendSongs: () => api.get('/homepage/recommend-songs'),
        addRecommendSong: (data) => api.post('/homepage/recommend-songs', data),
        updateRecommendSong: (id, data) => api.put(`/homepage/recommend-songs/${id}`, data),
        deleteRecommendSong: (id) => api.delete(`/homepage/recommend-songs/${id}`),
        updateConfig: (data) => api.put('/homepage/config', data)
    }
};

window.api = api;
