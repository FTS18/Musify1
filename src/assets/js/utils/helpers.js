
const coverOverrides = {
    'heroes tonight animagus roy remix': 'heroes tonight',
    'abrar’s entry jamal kudu from animal': 'abrars entry  jamal kudu from animal',
    'aadat remix': 'aadat',
    'kyaa baat haii 20 remix': 'kyaa baat haii 20',
    'be intehaan feat aks dj suketu remix': 'be intehaan feat aks',
    'dil diyan gallan lofi mix': 'dil diyan gallan',
    'ramaiya vastavaiya dj chetas mashup remix': 'ramaiya vastavaiya',
    'levitating vs adore you tik tok remix': 'levitating'
};

export const getSongCoverPath = (cover) => {
    if (!cover) return 'assets/images/cover/__missing__.jpg';

    let name = cover.toLowerCase().trim();

    if (coverOverrides[name]) {
        return `assets/images/cover/${coverOverrides[name]}.jpg`;
    }

    let normalized = name
        .replace(/[’'"]/g, '')
        .replace(/\(remix\)/g, '')
        .replace(/\(kygo remix\)/g, '')
        .replace(/remix/g, '')
        .replace(/lofi mix/g, '')
        .replace(/radio edit/g, '')
        .replace(/\(feat\..*?\)/g, '')
        .replace(/version/g, '')
        .replace(/&/g, '')
        .replace(/-/g, ' ')
        .replace(/\b(x|feat|ft|mix|edit|version|remix)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (coverOverrides[normalized]) {
        return `assets/images/cover/${coverOverrides[normalized]}.jpg`;
    }

    return `assets/images/cover/${normalized}.jpg`;
};

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const updateURLWithSongID = (songId) => {
    const url = new URL(window.location.href);
    url.searchParams.set('id', songId);
    window.history.pushState({}, '', url);
};

export const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
};
