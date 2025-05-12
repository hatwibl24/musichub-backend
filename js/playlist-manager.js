// Playlist Manager
const playlistManager = {
    // Create a new playlist
    async createPlaylist(name, description = '') {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) return null;

        const playlist = {
            id: crypto.randomUUID(),
            name: name,
            description: description,
            createdBy: userData.username,
            createdAt: new Date().toISOString(),
            songs: [],
            likes: [],
            coverArt: await createDefaultPlaylistCover(name)
        };

        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        playlists.push(playlist);
        localStorage.setItem('playlists', JSON.stringify(playlists));

        return playlist;
    },

    // Update existing playlist
    async updatePlaylist(playlistId, updatedPlaylist) {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const playlistIndex = playlists.findIndex(p => p.id === playlistId);
        
        if (playlistIndex === -1) return false;
        
        // Update playlist data
        playlists[playlistIndex] = {
            ...playlists[playlistIndex],
            name: updatedPlaylist.name,
            description: updatedPlaylist.description,
            songs: updatedPlaylist.songs,
            updatedAt: new Date().toISOString()
        };
        
        // Generate new cover art if songs have changed
        try {
            playlists[playlistIndex].coverArt = await generatePlaylistCover(updatedPlaylist.songs);
        } catch (error) {
            console.error('Error generating playlist cover:', error);
            // Keep existing cover art if generation fails
        }
        
        localStorage.setItem('playlists', JSON.stringify(playlists));
        return true;
    },

    // Add song to playlist
    async addSongToPlaylist(playlistId, song) {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const playlistIndex = playlists.findIndex(p => p.id === playlistId);
        
        if (playlistIndex === -1) return false;
        
        // Add song if it doesn't exist
        if (!playlists[playlistIndex].songs.find(s => s.id === song.id)) {
            playlists[playlistIndex].songs.push(song);
            
            // Update cover art if this is one of the first 4 songs
            if (playlists[playlistIndex].songs.length <= 4) {
                try {
                    playlists[playlistIndex].coverArt = await generatePlaylistCover(playlists[playlistIndex].songs);
                } catch (error) {
                    console.error('Error generating playlist cover:', error);
                }
            }
            
            localStorage.setItem('playlists', JSON.stringify(playlists));
            return true;
        }
        return false;
    },

    // Remove song from playlist
    async removeSongFromPlaylist(playlistId, songId) {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const playlistIndex = playlists.findIndex(p => p.id === playlistId);
        
        if (playlistIndex === -1) return false;
        
        const songIndex = playlists[playlistIndex].songs.findIndex(s => s.id === songId);
        if (songIndex !== -1) {
            playlists[playlistIndex].songs.splice(songIndex, 1);
            
            // Update cover art since song list changed
            try {
                playlists[playlistIndex].coverArt = await generatePlaylistCover(playlists[playlistIndex].songs);
            } catch (error) {
                console.error('Error generating playlist cover:', error);
                // Keep existing cover if generation fails
            }
            
            localStorage.setItem('playlists', JSON.stringify(playlists));
            return true;
        }
        return false;
    },

    // Get user's playlists
    getUserPlaylists(username) {
        const allPlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
        return allPlaylists.filter(playlist => playlist.createdBy === username);
    },

    // Get playlist by ID
    getPlaylist(playlistId) {
        const allPlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
        return allPlaylists.find(playlist => playlist.id === playlistId);
    },

    // Delete playlist
    deletePlaylist(playlistId) {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId);
        localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
        return true;
    },

    // Like/unlike playlist
    togglePlaylistLike(playlistId) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const allPlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
        const playlist = allPlaylists.find(p => p.id === playlistId);
        
        if (!playlist) return false;

        const userLikes = playlist.likes || [];
        const userIndex = userLikes.indexOf(userData.username);

        if (userIndex === -1) {
            userLikes.push(userData.username);
        } else {
            userLikes.splice(userIndex, 1);
        }

        playlist.likes = userLikes;
        localStorage.setItem('playlists', JSON.stringify(allPlaylists));
        return userIndex === -1;
    },

    // Check if user has liked a playlist
    hasLikedPlaylist(playlistId) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) return false;
        
        const playlist = this.getPlaylist(playlistId);
        return playlist && playlist.likes && playlist.likes.includes(userData.username);
    },

    // Get playlist songs
    getPlaylistSongs(playlistId) {
        const playlist = this.getPlaylist(playlistId);
        if (!playlist) return [];

        const allSongs = JSON.parse(localStorage.getItem('songs')) || [];
        return playlist.songs
            .map(songId => allSongs.find(song => song.id === songId))
            .filter(song => song); // Filter out any undefined songs
    },

    // Update playlist cover
    async updatePlaylistCover(playlistId, imageFile = null) {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const playlistIndex = playlists.findIndex(p => p.id === playlistId);
        
        if (playlistIndex === -1) return false;
        
        try {
            if (imageFile) {
                // Use custom image
                playlists[playlistIndex].coverArt = await setCustomPlaylistCover(playlists[playlistIndex], imageFile);
            } else {
                // Generate collage from songs
                playlists[playlistIndex].coverArt = await generatePlaylistCover(playlists[playlistIndex]);
            }
            
            localStorage.setItem('playlists', JSON.stringify(playlists));
            return true;
        } catch (error) {
            console.error('Error updating playlist cover:', error);
            return false;
        }
    },

    // Export the playlistManager object
    init: function() {
        // Make sure playlists exist in localStorage
        if (!localStorage.getItem('playlists')) {
            localStorage.setItem('playlists', JSON.stringify([]));
        }
    }
};

// Initialize playlistManager
playlistManager.init();

// Export to window object
window.playlistManager = playlistManager; 