export const lyricsService = {
  async getLyrics(artist, title) {
    try {
      if (!artist || !title) {
        return 'Lyrics not available';
      }
      
      const cleanArtist = artist.split(',')[0].trim();
      const cleanTitle = title.replace(/\(.*?\)/g, '').trim();
      
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
      
      if (!response.ok) {
        throw new Error('Lyrics not found');
      }
      
      const data = await response.json();
      return data.lyrics || 'Lyrics not available';
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return 'Lyrics not available';
    }
  }
};

export default lyricsService;