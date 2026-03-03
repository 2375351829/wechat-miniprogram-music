const app = {
    adminInfo: null,
    loading: false,
    
    async init() {
        if (!api.isLoggedIn()) {
            window.location.href = 'pages/login.html';
            return;
        }
        
        this.showLoading();
        
        try {
            await this.loadAdminInfo();
            router.init();
            this.setupGlobalErrorHandler();
            this.setupActivityMonitor();
        } catch (error) {
            console.error('应用初始化失败:', error);
            api.showError('应用初始化失败，请刷新页面');
        } finally {
            this.hideLoading();
        }
    },
    
    async loadAdminInfo() {
        const res = await api.admin.getInfo();
        if (res.code === 0) {
            this.adminInfo = res.data;
            localStorage.setItem('admin_info', JSON.stringify(res.data));
            this.updateAdminInfo();
        } else {
            api.clearToken();
            window.location.href = 'pages/login.html';
        }
    },
    
    updateAdminInfo() {
        const adminName = document.querySelector('.admin-name');
        if (adminName && this.adminInfo) {
            adminName.textContent = this.adminInfo.real_name || this.adminInfo.username;
        }
    },
    
    logout() {
        if (confirm('确定要退出登录吗？')) {
            api.admin.logout();
            window.location.href = 'pages/login.html';
        }
    },
    
    showLoading() {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">加载中...</div>
                </div>
            `;
            loader.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(255, 255, 255, 0.9); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
            `;
            const style = document.createElement('style');
            style.textContent = `
                .loader-spinner {
                    width: 40px; height: 40px; border: 3px solid #f3f3f3;
                    border-top: 3px solid #4A90D9; border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .loader-text { margin-top: 12px; color: #666; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `;
            document.head.appendChild(style);
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    },
    
    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    },
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const colors = {
            info: '#4A90D9',
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12'
        };
        
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            background: ${colors[type] || colors.info}; color: #fff;
            border-radius: 4px; z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    showSuccess(message) {
        this.showToast(message, 'success');
    },
    
    showError(message) {
        this.showToast(message, 'error');
    },
    
    showWarning(message) {
        this.showToast(message, 'warning');
    },
    
    confirm(message, title = '确认') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="confirm-content">
                    <div class="confirm-title">${title}</div>
                    <div class="confirm-message">${message}</div>
                    <div class="confirm-buttons">
                        <button class="btn btn-secondary confirm-cancel">取消</button>
                        <button class="btn btn-primary confirm-ok">确定</button>
                    </div>
                </div>
            `;
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
            `;
            
            const content = modal.querySelector('.confirm-content');
            content.style.cssText = `
                background: #fff; padding: 24px; border-radius: 8px;
                min-width: 300px; max-width: 400px;
            `;
            
            modal.querySelector('.confirm-title').style.cssText = `
                font-size: 18px; font-weight: 600; margin-bottom: 12px;
            `;
            
            modal.querySelector('.confirm-message').style.cssText = `
                color: #666; margin-bottom: 20px;
            `;
            
            modal.querySelector('.confirm-buttons').style.cssText = `
                display: flex; justify-content: flex-end; gap: 12px;
            `;
            
            modal.querySelector('.confirm-cancel').onclick = () => {
                modal.remove();
                resolve(false);
            };
            
            modal.querySelector('.confirm-ok').onclick = () => {
                modal.remove();
                resolve(true);
            };
            
            document.body.appendChild(modal);
        });
    },
    
    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    
    formatDateTime(date) {
        if (!date) return '-';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    
    getStatusText(status) {
        const statusMap = {
            0: '待审核',
            1: '已通过',
            2: '已驳回',
            3: '已播放',
            4: '已取消'
        };
        return statusMap[status] || '未知';
    },
    
    getStatusClass(status) {
        const classMap = {
            0: 'status-pending',
            1: 'status-approved',
            2: 'status-rejected',
            3: 'status-played',
            4: 'status-muted'
        };
        return classMap[status] || '';
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    setupGlobalErrorHandler() {
        window.onerror = (message, source, lineno, colno, error) => {
            console.error('全局错误:', { message, source, lineno, colno, error });
            return false;
        };
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            event.preventDefault();
        });
    },
    
    setupActivityMonitor() {
        let lastActivity = Date.now();
        const SESSION_TIMEOUT = 30 * 60 * 1000;
        
        const updateActivity = this.throttle(() => {
            lastActivity = Date.now();
        }, 60000);
        
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });
        
        setInterval(() => {
            if (Date.now() - lastActivity > SESSION_TIMEOUT) {
                api.clearToken();
                api.showError('会话已过期，请重新登录');
                setTimeout(() => {
                    window.location.href = 'pages/login.html';
                }, 1000);
            }
        }, 60000);
    }
};

window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

function initDashboardPage() {
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const res = await api.admin.getDashboard();
        if (res.code === 0) {
            const data = res.data || {};
            const totalSongs = document.getElementById('totalSongs');
            const pendingRequests = document.getElementById('pendingRequests');
            const pendingBlessings = document.getElementById('pendingBlessings');
            const todayPlayed = document.getElementById('todayPlayed');
            
            if (totalSongs) totalSongs.textContent = data.totalSongs || 0;
            if (pendingRequests) pendingRequests.textContent = data.pendingRequests || 0;
            if (pendingBlessings) pendingBlessings.textContent = data.pendingBlessings || 0;
            if (todayPlayed) todayPlayed.textContent = data.todayPlayed || 0;
        }
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-rejected { background: #f8d7da; color: #721c24; }
    .status-played { background: #d1ecf1; color: #0c5460; }
    .status-muted { background: #e2e3e5; color: #383d41; }
`;
document.head.appendChild(style);
