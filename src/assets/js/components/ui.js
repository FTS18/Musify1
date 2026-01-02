import { userData } from '../services/auth.js';
import { stateManager } from '../services/state.js';

export const toggleDropdown = (el) => {
    const list = el.nextElementSibling;
    if (list) {
        if (list.style.display === 'none') {
            list.style.display = 'block';
            const arrow = el.querySelector('.dropdown-arrow');
            if (arrow) arrow.innerText = 'expand_less';
        } else {
            list.style.display = 'none';
            const arrow = el.querySelector('.dropdown-arrow');
            if (arrow) arrow.innerText = 'expand_more';
        }
    }
};

export const renderFollowedArtists = () => {
    const list = document.getElementById('followedArtistsContainer');
    if (!list) return;

    const followed = userData.followedArtists || [];
    if (followed.length === 0) {
        list.innerHTML = '<p style="font-size: 12px; opacity: 0.5; padding: 8px 16px;">No artists followed yet</p>';
        return;
    }

    // This requires artists data which is usually derived from songs.
    // Ideally we should import derived artist data or store it in state/data service.
    // For now, assume auth userData has followedArtistsData populated.

    list.innerHTML = '';
    followed.forEach(name => {
        const data = userData.followedArtistsData?.[name] || { name };
        const item = document.createElement('div');
        item.className = 'followed-artist-item';
        item.style.cursor = 'pointer';
        item.onclick = () => window.openArtistProfile(name);
        item.innerHTML = `
                <img src="${data.img || 'assets/images/placeholder.svg'}" alt="${name}" style="width:32px; height:32px; border-radius:4px; object-fit:cover;">
                <span style="flex:1; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${name}</span>
        `;
        list.appendChild(item);
    });
};
