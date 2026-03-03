const router = {
    currentPage: null,
    routes: {
        'dashboard': { title: '数据概览', page: 'dashboard.html' },
        'songs': { title: '歌曲管理', page: 'songs.html' },
        'audit': { title: '审核管理', page: 'audit.html' },
        'play': { title: '播放控制', page: 'play.html' },
        'users': { title: '用户管理', page: 'users.html' },
        'homepage': { title: '首页配置', page: 'homepage.html' },
        'blessings': { title: '祝福管理', page: 'blessings.html' },
        'settings': { title: '系统设置', page: 'settings.html' }
    },
    
    init() {
        this.handleHashChange();
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.bindMenuEvents();
    },
    
    bindMenuEvents() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.navigate(page);
                }
            });
        });
    },
    
    navigate(page) {
        window.location.hash = page;
    },
    
    handleHashChange() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const route = this.routes[hash];
        
        if (route) {
            this.loadPage(hash, route);
        } else {
            this.loadPage('dashboard', this.routes['dashboard']);
        }
    },
    
    async loadPage(pageName, route) {
        if (this.currentPage === pageName) return;
        
        this.currentPage = pageName;
        this.updateMenu(pageName);
        this.updateTitle(route.title);
        
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('找不到 main-content 元素');
            return;
        }
        
        mainContent.innerHTML = '<div class="loading" style="text-align: center; padding: 40px; color: #999;">加载中...</div>';
        
        try {
            const response = await fetch(`pages/${route.page}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const html = await response.text();
            mainContent.innerHTML = html;
            
            this.executePageScripts(mainContent);
            
        } catch (error) {
            console.error('加载页面失败:', error);
            mainContent.innerHTML = `
                <div class="error-page" style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
                    <h3 style="margin-bottom: 8px;">页面加载失败</h3>
                    <p style="color: #999; margin-bottom: 16px;">${error.message}</p>
                    <button class="btn btn-primary" onclick="router.reload()">重新加载</button>
                </div>
            `;
        }
    },
    
    executePageScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            // 复制所有属性
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.async = false; // 保持脚本执行顺序
            } else {
                newScript.textContent = oldScript.textContent;
            }
            if (oldScript.parentNode) {
                oldScript.parentNode.replaceChild(newScript, oldScript);
            }
        });
    },
    
    updateMenu(pageName) {
        document.querySelectorAll('.menu-item').forEach(item => {
            const isActive = item.getAttribute('data-page') === pageName;
            item.classList.toggle('active', isActive);
        });
    },
    
    updateTitle(title) {
        const titleElement = document.querySelector('.header-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        document.title = `${title} - 校园点歌台管理后台`;
    },
    
    reload() {
        this.currentPage = null;
        this.handleHashChange();
    }
};

window.router = router;
