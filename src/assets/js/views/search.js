import { songs } from '../services/data.js';
import { getSongCoverPath } from '../utils/helpers.js';

export const renderSearchView = () => {
    const browseContainer = document.getElementById('searchBrowseCategories');
    if (browseContainer && browseContainer.innerHTML.trim() === '') {
        const categories = [
            { name: 'Live Events', color: '#e91e63' },
            { name: 'Made For You', color: '#1e88e5' },
            { name: 'New Releases', color: '#9c27b0' },
            { name: 'Desi', color: '#e65100' },
            { name: 'Pop', color: '#43a047' },
            { name: 'Love', color: '#f44336' },
            { name: 'Instrumental', color: '#607d8b' },
            { name: 'Radio', color: '#795548' }
        ];

        browseContainer.innerHTML = categories.map(cat => `
            <div class="browse-card" onclick="window.searchGenre('${cat.name}')" style="background:${cat.color}; height:100px; border-radius:8px; padding:16px; position:relative; overflow:hidden; cursor:pointer;">
                <h3 style="font-size:18px; font-weight:700;">${cat.name}</h3>
                <div style="position:absolute; bottom:-10px; right:-10px; transform:rotate(25deg); width:60px; height:60px; background:rgba(0,0,0,0.2); border-radius:8px;"></div>
            </div>
        `).join('');
    }

    const input = document.getElementById('searchInputMobile');
    if (input) {
        input.onkeyup = (e) => {
            const query = e.target.value.toLowerCase();
            const resultsDiv = document.getElementById('searchResults');
            const resultsList = document.getElementById('searchResultsList');
            const browseDiv = document.getElementById('searchBrowseCategories');

            if (query.length > 0) {
                if (browseDiv) browseDiv.style.display = 'none';
                if (resultsDiv) resultsDiv.style.display = 'block';

                const matched = songs.filter(s => s.name.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query));

                if (resultsList) {
                    resultsList.innerHTML = matched.length > 0 ? matched.map((s, i) => `
                        <div class="song-row" onclick="window.playSongById('${s.id}')">
                            <img src="${getSongCoverPath(s.cover)}" style="width:40px; height:40px; border-radius:4px;">
                            <div style="flex:1; margin-left:12px;">
                                <div style="font-weight:700;">${s.name}</div>
                                <div style="font-size:12px; opacity:0.7;">${s.artist}</div>
                            </div>
                        </div>
                    `).join('') : '<p style="opacity:0.5">No matches found</p>';
                }
            } else {
                if (browseDiv) browseDiv.style.display = 'grid';
                if (resultsDiv) resultsDiv.style.display = 'none';
            }
        };
    }
};

export const searchGenre = (genre) => {
    const input = document.getElementById('searchInputMobile');
    if (input) {
        input.value = genre;
        input.dispatchEvent(new Event('keyup'));
        document.querySelector('.main-view').scrollTo({ top: 0, behavior: 'smooth' });
    }
};
