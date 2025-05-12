// Album Manager
const albumManager = {
    // Initialize albums in localStorage
    init() {
        if (!localStorage.getItem('albums')) {
            localStorage.setItem('albums', JSON.stringify([]));
        }
    },

    // Get all albums
    getAllAlbums() {
        return JSON.parse(localStorage.getItem('albums')) || [];
    },

    // Get album by ID
    getAlbum(albumId) {
        const albums = this.getAllAlbums();
        return albums.find(album => album.id === albumId);
    },

    // Create new album
    async createAlbum(albumData, songs, coverArtFile) {
        try {
            // Convert cover art to base64
            const coverArtBase64 = await songManager.fileToBase64(coverArtFile);

            // Create album object
            const album = {
                id: crypto.randomUUID(),
                title: albumData.title,
                artist: albumData.artist,
                description: albumData.description,
                genres: albumData.genres,
                coverArt: coverArtBase64,
                releaseDate: new Date().toISOString(),
                songs: songs.map(song => song.id), // Store song IDs
                totalDuration: songs.reduce((total, song) => total + song.duration, 0),
                plays: 0,
                likes: []
            };

            // Add to localStorage
            const albums = this.getAllAlbums();
            albums.push(album);
            localStorage.setItem('albums', JSON.stringify(albums));

            return album;
        } catch (error) {
            console.error('Error creating album:', error);
            throw error;
        }
    },

    // Get album songs
    getAlbumSongs(albumId) {
        const album = this.getAlbum(albumId);
        if (!album) return [];

        return album.songs.map(songId => songManager.getSong(songId)).filter(Boolean);
    },

    // Delete album
    deleteAlbum(albumId) {
        const albums = this.getAllAlbums();
        const updatedAlbums = albums.filter(album => album.id !== albumId);
        localStorage.setItem('albums', JSON.stringify(updatedAlbums));
    },

    // Like/unlike album
    toggleLike(albumId, username) {
        const albums = this.getAllAlbums();
        const album = albums.find(a => a.id === albumId);
        
        if (!album) return false;
        
        const likeIndex = album.likes.indexOf(username);
        if (likeIndex === -1) {
            album.likes.push(username);
        } else {
            album.likes.splice(likeIndex, 1);
        }
        
        localStorage.setItem('albums', JSON.stringify(albums));
        return likeIndex === -1;
    },

    // Increment play count
    incrementPlays(albumId) {
        const albums = this.getAllAlbums();
        const album = albums.find(a => a.id === albumId);
        
        if (album) {
            album.plays = (album.plays || 0) + 1;
            localStorage.setItem('albums', JSON.stringify(albums));
        }
    }
};

// Initialize album manager
albumManager.init();

// Export to window object
window.albumManager = albumManager; 