// Storage keys
const STORAGE_KEYS = {
    USER: 'musichub_user',
    PLAYLISTS: 'musichub_playlists',
    SONGS: 'musichub_songs',
    SETTINGS: 'musichub_settings',
    CURRENT_PLAYLIST: 'musichub_current_playlist',
    LIKED_SONGS: 'musichub_liked_songs'
};

// Storage utility class
class StorageManager {
    // User Management
    static saveUser(userData) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    }

    static getUser() {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    }

    static isLoggedIn() {
        return !!this.getUser();
    }

    static logout() {
        localStorage.removeItem(STORAGE_KEYS.USER);
    }

    // Playlist Management
    static savePlaylists(playlists) {
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    }

    static getPlaylists() {
        const playlists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
        return playlists ? JSON.parse(playlists) : [];
    }

    static addPlaylist(playlist) {
        const playlists = this.getPlaylists();
        playlist.id = Date.now().toString(); // Simple ID generation
        playlists.push(playlist);
        this.savePlaylists(playlists);
        return playlist;
    }

    static updatePlaylist(playlistId, updatedData) {
        const playlists = this.getPlaylists();
        const index = playlists.findIndex(p => p.id === playlistId);
        if (index !== -1) {
            playlists[index] = { ...playlists[index], ...updatedData };
            this.savePlaylists(playlists);
            return true;
        }
        return false;
    }

    // Song Management
    static saveSongs(songs) {
        localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    }

    static getSongs() {
        const songs = localStorage.getItem(STORAGE_KEYS.SONGS);
        return songs ? JSON.parse(songs) : [];
    }

    static addSong(song) {
        const songs = this.getSongs();
        song.id = Date.now().toString();
        songs.push(song);
        this.saveSongs(songs);
        return song;
    }

    // Liked Songs Management
    static getLikedSongs() {
        const likedSongs = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
        return likedSongs ? JSON.parse(likedSongs) : [];
    }

    static toggleLikedSong(songId) {
        const likedSongs = this.getLikedSongs();
        const index = likedSongs.indexOf(songId);
        
        if (index === -1) {
            likedSongs.push(songId);
        } else {
            likedSongs.splice(index, 1);
        }
        
        localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(likedSongs));
        return index === -1; // Returns true if song was liked, false if unliked
    }

    // Settings Management
    static saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    static getSettings() {
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : {
            theme: 'dark',
            quality: 'high',
            notifications: true,
            language: 'en'
        };
    }

    // Current Playlist Management
    static setCurrentPlaylist(playlist) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYLIST, JSON.stringify(playlist));
    }

    static getCurrentPlaylist() {
        const playlist = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYLIST);
        return playlist ? JSON.parse(playlist) : null;
    }

    // Utility Methods
    static clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    static exportData() {
        const data = {};
        Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
            data[key] = localStorage.getItem(value);
        });
        return JSON.stringify(data);
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
                if (data[key]) {
                    localStorage.setItem(value, data[key]);
                }
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
} 