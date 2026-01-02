/**
 * Context Menu Component
 * Handles the "More Options" menu globally.
 */
export const ContextMenu = {
    element: null,
    currentSongId: null,

    init() {
        if (this.element) return;
        this.element = document.createElement('div');
        this.element.className = 'context-menu';
        this.element.innerHTML = `
            <div class="menu-item" data-action="play-next"><span class="material-icons">queue_play_next</span> Play Next</div>
            <div class="menu-item" data-action="add-queue"><span class="material-icons">add_to_queue</span> Add to Queue</div>
            <div class="menu-item" data-action="add-playlist">
                <span class="material-icons">playlist_add</span> Add to Playlist
                <i class="material-icons">chevron_right</i>
                <div class="submenu" id="playlist-submenu">
                    <div class="menu-item" data-action="new-playlist"><b>+ Create New</b></div>
                    <div id="user-playlists-list"></div>
                </div>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" data-action="go-to-artist"><span class="material-icons">person</span> Go to Artist</div>
            <div class="menu-divider"></div>
            <div class="menu-item" data-action="share"><span class="material-icons">share</span> Share</div>
            <div class="menu-item" data-action="like"><span class="material-icons">favorite_border</span> Like</div>
        `;
        document.body.appendChild(this.element);

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) this.hide();
        });

        this.element.addEventListener('click', (e) => this.handleAction(e));
    },

    show(x, y, songId, playlists = []) {
        this.init();
        this.currentSongId = songId;

        // Populate submenu
        const list = document.getElementById('user-playlists-list');
        if (list) {
            list.innerHTML = playlists.map(pl => `
                <div class="menu-item" data-action="add-to-pl" data-pl-id="${pl.id}">${pl.name}</div>
            `).join('');
        }

        // Position menu
        this.element.style.display = 'block';
        const rect = this.element.getBoundingClientRect();

        // Keep inside window
        if (x + rect.width > window.innerWidth) x -= rect.width;
        if (y + rect.height > window.innerHeight) y -= rect.height;

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.classList.add('active');
    },

    hide() {
        if (this.element) {
            this.element.classList.remove('active');
            this.element.style.display = 'none';
        }
    },

    async handleAction(e) {
        const item = e.target.closest('.menu-item');
        if (!item) return;

        const action = item.dataset.action;
        const plId = item.dataset.plId;

        if (action === 'add-playlist') return; // Submenu trigger

        this.hide();

        // Dispatch global custom event for app.js to handle
        const event = new CustomEvent('context-menu-action', {
            detail: { action, songId: this.currentSongId, plId }
        });
        document.dispatchEvent(event);
    }
};
