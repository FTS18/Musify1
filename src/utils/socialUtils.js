/**
 * Social Sharing Utility
 * Share songs, playlists, and artists across social platforms and copy links
 */

/**
 * Generate shareable link for a song
 */
export const generateSongShareLink = (song) => {
    const baseUrl = window.location.origin;
    return {
        url: `${baseUrl}?song=${song.id}`,
        text: `Check out "${song.name}" by ${song.artist} on Musify! 🎵`,
        longText: `I'm listening to "${song.name}" by ${song.artist} on Musify! Want to listen too?`
    };
};

/**
 * Generate shareable link for a playlist
 */
export const generatePlaylistShareLink = (playlist) => {
    const baseUrl = window.location.origin;
    return {
        url: `${baseUrl}?playlist=${playlist.id}`,
        text: `Check out "${playlist.name}" playlist on Musify! 🎶`,
        longText: `I've created a playlist "${playlist.name}" with ${playlist.songs?.length || 0} songs on Musify!`
    };
};

/**
 * Generate shareable link for an artist
 */
export const generateArtistShareLink = (artist) => {
    const baseUrl = window.location.origin;
    return {
        url: `${baseUrl}?artist=${encodeURIComponent(artist.name)}`,
        text: `Check out ${artist.name} on Musify! 🎤`,
        longText: `I'm following ${artist.name} on Musify! They have some amazing tracks.`
    };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/**
 * Share via Web Share API (if available)
 */
export const shareViaWebShare = async (title, text, url) => {
    if (!navigator.share) {
        console.log('Web Share API not supported');
        return false;
    }

    try {
        await navigator.share({
            title,
            text,
            url
        });
        return true;
    } catch (err) {
        console.error('Share failed:', err);
        return false;
    }
};

/**
 * Share to specific platform
 */
export const shareToSocialMedia = (platform, shareData) => {
    const { url, text, longText } = shareData;
    
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const encodedLongText = encodeURIComponent(longText);

    const platforms = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedLongText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedLongText} ${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedLongText}`,
        email: `mailto:?subject=Check this out on Musify&body=${encodedLongText}%0A%0A${encodedUrl}`
    };

    if (platforms[platform]) {
        window.open(platforms[platform], '_blank', 'width=600,height=400');
        return true;
    }
    return false;
};

export default {
    generateSongShareLink,
    generatePlaylistShareLink,
    generateArtistShareLink,
    copyToClipboard,
    shareViaWebShare,
    shareToSocialMedia
};
