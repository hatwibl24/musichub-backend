class Player {
    constructor() {
        this.audio = new Audio();
        this.currentSong = null;
        this.isPlaying = false;
        this.volume = 1;
        this.initializeFromStorage();
        this.setupEventListeners();
    }

    initializeFromStorage() {
        // Load current playlist
        this.currentPlaylist = StorageManager.getCurrentPlaylist();
        
        // Load last played song position
        const lastPlayed = localStorage.getItem('musichub_last_played');
        if (lastPlayed) {
            const { songId, position } = JSON.parse(lastPlayed);
            const songs = StorageManager.getSongs();
            this.currentSong = songs.find(s => s.id === songId);
            if (this.currentSong) {
                this.audio.src = this.currentSong.url;
                this.audio.currentTime = position;
            }
        }

        // Load last volume setting
        const savedVolume = localStorage.getItem('musichub_volume');
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
            this.audio.volume = this.volume;
        }
    }

    setupEventListeners() {
        // Save position periodically
        this.audio.addEventListener('timeupdate', () => {
            if (this.currentSong) {
                localStorage.setItem('musichub_last_played', JSON.stringify({
                    songId: this.currentSong.id,
                    position: this.audio.currentTime
                }));
            }
        });

        // Handle song end
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });
    }

    async play(song = null) {
        if (song) {
            this.currentSong = song;
            this.audio.src = song.url;
        }

        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updateNowPlaying();
        } catch (error) {
            console.error('Playback error:', error);
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateNowPlaying();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    async playNext() {
        if (!this.currentPlaylist) return;

        const currentIndex = this.currentPlaylist.songs.findIndex(s => s.id === this.currentSong.id);
        const nextIndex = (currentIndex + 1) % this.currentPlaylist.songs.length;
        const nextSong = this.currentPlaylist.songs[nextIndex];

        await this.play(nextSong);
    }

    async playPrevious() {
        if (!this.currentPlaylist) return;

        const currentIndex = this.currentPlaylist.songs.findIndex(s => s.id === this.currentSong.id);
        const previousIndex = (currentIndex - 1 + this.currentPlaylist.songs.length) % this.currentPlaylist.songs.length;
        const previousSong = this.currentPlaylist.songs[previousIndex];

        await this.play(previousSong);
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;
        localStorage.setItem('musichub_volume', this.volume.toString());
    }

    seek(position) {
        if (this.audio.duration) {
            this.audio.currentTime = Math.max(0, Math.min(position, this.audio.duration));
        }
    }

    setPlaylist(playlist) {
        this.currentPlaylist = playlist;
        StorageManager.setCurrentPlaylist(playlist);
    }

    updateNowPlaying() {
        if (this.currentSong) {
            const nowPlaying = {
                id: this.currentSong.id,
                title: this.currentSong.title,
                artist: this.currentSong.artist,
                albumArt: this.currentSong.albumArt,
                isPlaying: this.isPlaying,
                duration: this.audio.duration,
                currentTime: this.audio.currentTime
            };
            localStorage.setItem('musichub_now_playing', JSON.stringify(nowPlaying));
            this.updatePlayerUI(nowPlaying);
        }
    }

    updatePlayerUI(nowPlaying) {
        // Update player UI elements
        document.querySelector('.song-title').textContent = nowPlaying.title;
        document.querySelector('.song-artist').textContent = nowPlaying.artist;
        document.querySelector('.cover-art img').src = nowPlaying.albumArt;
        document.querySelector('.play-pause').textContent = nowPlaying.isPlaying ? '⏸' : '▶';
        
        // Update progress bar
        const progress = (nowPlaying.currentTime / nowPlaying.duration) * 100;
        document.querySelector('.progress').style.width = `${progress}%`;
        
        // Update time displays
        document.querySelector('.time.current').textContent = this.formatTime(nowPlaying.currentTime);
        document.querySelector('.time.total').textContent = this.formatTime(nowPlaying.duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize player
const player = new Player();
window.player = player; 