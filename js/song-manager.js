// Song Manager
const songManager = {
    // Initialize songs in localStorage
    init() {
        if (!localStorage.getItem('songs')) {
            const sampleSongs = [
                {
                    id: crypto.randomUUID(),
                    title: "Sample Song 1",
                    artist: "Artist 1",
                    coverArt: "assets/default-cover.jpg",
                    audioUrl: "assets/sample1.mp3",
                    addedAt: new Date().toISOString()
                },
                {
                    id: crypto.randomUUID(),
                    title: "Sample Song 2",
                    artist: "Artist 2",
                    coverArt: "assets/default-cover.jpg",
                    audioUrl: "assets/sample2.mp3",
                    addedAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('songs', JSON.stringify(sampleSongs));
        }
        if (!localStorage.getItem('audioData')) {
            localStorage.setItem('audioData', JSON.stringify({}));
        }
    },

    // Get all songs
    getAllSongs() {
        return JSON.parse(localStorage.getItem('songs')) || [];
    },

    // Search songs by title or artist
    searchSongs(query) {
        const songs = this.getAllSongs();
        const searchTerm = query.toLowerCase();
        
        return songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm)
        );
    },

    // Get song by ID
    getSong(songId) {
        const songs = this.getAllSongs();
        const song = songs.find(song => song.id === songId);
        if (song) {
            // Get audio data from separate storage
            const audioData = JSON.parse(localStorage.getItem('audioData') || '{}');
            song.audioData = audioData[songId];
        }
        return song;
    },

    // Add new song
    async addSong(songData, audioFile, coverArtFile) {
        try {
            // Convert cover art to base64 (keep this as it's smaller)
            const coverArtBase64 = await this.fileToBase64(coverArtFile);

            // Create song object
            const song = {
                id: crypto.randomUUID(),
                title: songData.title,
                artist: songData.artist,
                description: songData.description,
                genres: songData.genres,
                coverArt: coverArtBase64,
                fileName: audioFile.name,
                fileSize: audioFile.size,
                duration: await this.getAudioDuration(audioFile),
                uploadDate: new Date().toISOString(),
                plays: 0,
                likes: [],
                audioUrl: songData.audioUrl,
                addedAt: new Date().toISOString()
            };

            // Store audio data in chunks
            const audioBase64 = await this.fileToBase64(audioFile);
            const chunkSize = 1024 * 1024; // 1MB chunks
            const chunks = Math.ceil(audioBase64.length / chunkSize);
            
            // Store chunks
            for (let i = 0; i < chunks; i++) {
                const start = i * chunkSize;
                const end = start + chunkSize;
                const chunk = audioBase64.slice(start, end);
                
                try {
                    localStorage.setItem(`audio_${song.id}_${i}`, chunk);
                } catch (error) {
                    // Clean up previously stored chunks
                    for (let j = 0; j < i; j++) {
                        localStorage.removeItem(`audio_${song.id}_${j}`);
                    }
                    throw new Error('Storage quota exceeded. Please try a smaller file or clear some space.');
                }
            }
            
            // Store chunk count
            localStorage.setItem(`audio_${song.id}_chunks`, chunks.toString());

            // Add song metadata to localStorage
            const songs = this.getAllSongs();
            songs.push(song);
            localStorage.setItem('songs', JSON.stringify(songs));

            return song;
        } catch (error) {
            console.error('Error adding song:', error);
            throw error;
        }
    },

    // Get audio data for a song
    getAudioData(songId) {
        const chunks = parseInt(localStorage.getItem(`audio_${songId}_chunks`) || '0');
        if (!chunks) return null;
        
        let audioData = '';
        for (let i = 0; i < chunks; i++) {
            audioData += localStorage.getItem(`audio_${songId}_${i}`) || '';
        }
        return audioData;
    },

    // Delete song
    deleteSong(songId) {
        // Remove audio chunks
        const chunks = parseInt(localStorage.getItem(`audio_${songId}_chunks`) || '0');
        for (let i = 0; i < chunks; i++) {
            localStorage.removeItem(`audio_${songId}_${i}`);
        }
        localStorage.removeItem(`audio_${songId}_chunks`);

        // Remove song metadata
        const songs = this.getAllSongs();
        const updatedSongs = songs.filter(song => song.id !== songId);
        localStorage.setItem('songs', JSON.stringify(updatedSongs));

        // Also remove the song from all playlists
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        const updatedPlaylists = playlists.map(playlist => ({
            ...playlist,
            songs: playlist.songs.filter(song => song.id !== songId)
        }));
        localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
        
        return true;
    },

    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    },

    // Get audio duration
    getAudioDuration(audioFile) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            const objectUrl = URL.createObjectURL(audioFile);
            
            audio.addEventListener('loadedmetadata', () => {
                URL.revokeObjectURL(objectUrl);
                resolve(audio.duration);
            });
            
            audio.addEventListener('error', () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Failed to load audio file'));
            });
            
            audio.src = objectUrl;
        });
    },

    // Like/unlike song
    toggleLike(songId, username) {
        const songs = this.getAllSongs();
        const song = songs.find(s => s.id === songId);
        
        if (!song) return false;
        
        const likeIndex = song.likes.indexOf(username);
        if (likeIndex === -1) {
            song.likes.push(username);
        } else {
            song.likes.splice(likeIndex, 1);
        }
        
        localStorage.setItem('songs', JSON.stringify(songs));
        return likeIndex === -1;
    },

    // Increment play count
    incrementPlays(songId) {
        const songs = this.getAllSongs();
        const song = songs.find(s => s.id === songId);
        
        if (song) {
            song.plays = (song.plays || 0) + 1;
            localStorage.setItem('songs', JSON.stringify(songs));
        }
    },

    // Update existing song
    updateSong(songId, updates) {
        const songs = this.getAllSongs();
        const songIndex = songs.findIndex(song => song.id === songId);
        
        if (songIndex === -1) return false;
        
        songs[songIndex] = {
            ...songs[songIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('songs', JSON.stringify(songs));
        return true;
    }
};

// Initialize song manager
songManager.init();

// Export to window object
window.songManager = songManager; 