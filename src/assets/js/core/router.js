export default class Router {
    constructor(routes = {}) {
        this.routes = routes;
        // Switch to History API
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        // Remove leading slash and index.html if present
        let pathStr = window.location.pathname.replace(/^\/|index\.html/g, '');
        // Remove trailing slash
        pathStr = pathStr.replace(/\/$/, '');

        // Default to home
        if (!pathStr) pathStr = 'home';

        const parts = pathStr.split('/');
        const path = parts[0];
        const param = parts[1] || '';

        if (this.routes[path]) {
            this.routes[path](decodeURIComponent(param));
        } else {
            // Default handler if provided, else maybe home
            if (this.routes['home']) this.routes['home']();
        }
        this.updateSidebarUI(path);
    }

    navigate(path, param = '') {
        const url = param ? `/${path}/${encodeURIComponent(param)}` : `/${path}`;
        history.pushState({}, '', url);
        this.handleRoute();
    }

    updateSidebarUI(path) {
        document.querySelectorAll('.nav-links > li:not(.nav-dropdown), .nav-dropdown-content li, .mobile-nav-item').forEach(el => {
            el.classList.remove('active');
            // Strict check for dropdown items to avoid parent matching
            const onclick = el.getAttribute('onclick') || '';
            if ((onclick.includes(`navigate('${path}')`) && path !== 'home') ||
                (path === 'home' && onclick.includes('navigate("home")'))) {
                el.classList.add('active');
            } else if (el.innerText.toLowerCase() === path) {
                el.classList.add('active');
            }
        });
    }
}
