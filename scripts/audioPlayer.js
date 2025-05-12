class AudioPlayer {
    constructor() {
        if (AudioPlayer.instance) {
            return AudioPlayer.instance;
        }
        AudioPlayer.instance = this;
        
        this.audio = new Audio();
        this.currentTrack = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'none'; // none, one, all
        this.volume = parseFloat(localStorage.getItem('musicHubVolume')) || 1.0;
        this.isMuted = false;
        this.shuffledIndices = [];
        
        // Initialize volume
        this.audio.volume = this.volume;
        
        // Load state from localStorage
        this.loadState();
        
        // Setup audio event listeners
        this.setupEventListeners();
        
        // Initialize player UI when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializePlayerUI());
        } else {
            this.initializePlayerUI();
        }
    }

    setupEventListeners() {
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('error', (e) => this.handleAudioError(e));
        this.audio.addEventListener('loadstart', () => this.handleLoadStart());
        this.audio.addEventListener('canplay', () => this.handleCanPlay());

        // Clean up event listeners before page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    cleanup() {
        this.saveState();
        this.audio.removeEventListener('ended', () => this.handleTrackEnd());
        this.audio.removeEventListener('timeupdate', () => this.updateProgress());
        this.audio.removeEventListener('error', (e) => this.handleAudioError(e));
        this.audio.removeEventListener('loadstart', () => this.handleLoadStart());
        this.audio.removeEventListener('canplay', () => this.handleCanPlay());
    }

    loadState() {
        try {
            const state = JSON.parse(localStorage.getItem('audioPlayerState')) || {};
            this.currentTrack = state.currentTrack || null;
            this.playlist = state.playlist || [];
            this.currentIndex = state.currentIndex || 0;
            this.isShuffled = state.isShuffled || false;
            this.repeatMode = state.repeatMode || 'none';
            this.volume = state.volume || 1.0;
            
            if (this.currentTrack) {
                this.audio.src = this.currentTrack.audioUrl;
                this.audio.currentTime = state.currentTime || 0;
                this.audio.volume = this.volume;
            }

            if (this.isShuffled) {
                this.shuffledIndices = state.shuffledIndices || this.generateShuffledIndices();
            }
        } catch (error) {
            console.error('Error loading player state:', error);
            this.resetState();
        }
    }

    resetState() {
        this.currentTrack = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isShuffled = false;
        this.repeatMode = 'none';
        this.volume = 1.0;
        this.shuffledIndices = [];
        localStorage.removeItem('audioPlayerState');
    }

    saveState() {
        try {
            const state = {
                currentTrack: this.currentTrack,
                playlist: this.playlist,
                currentIndex: this.currentIndex,
                currentTime: this.audio.currentTime,
                isShuffled: this.isShuffled,
                repeatMode: this.repeatMode,
                volume: this.volume,
                shuffledIndices: this.shuffledIndices
            };
            localStorage.setItem('audioPlayerState', JSON.stringify(state));
        } catch (error) {
            console.error('Error saving player state:', error);
        }
    }

    initializePlayerUI() {
        try {
            // Update player UI with current track info
            if (this.currentTrack) {
                this.updatePlayerUI();
            }

            // Setup player control event listeners
            this.setupControlListeners();
            this.setupVolumeControl();
        } catch (error) {
            console.error('Error initializing player UI:', error);
        }
    }

    setupControlListeners() {
        const controls = {
            playBtn: document.querySelector('.player-controls .bi-play-circle-fill, .player-controls .bi-pause-circle-fill'),
            nextBtn: document.querySelector('.player-controls .bi-skip-end-fill'),
            prevBtn: document.querySelector('.player-controls .bi-skip-start-fill'),
            shuffleBtn: document.querySelector('.player-controls .bi-shuffle'),
            repeatBtn: document.querySelector('.player-controls .bi-repeat'),
            progressBar: document.querySelector('.progress-bar')
        };

        if (controls.playBtn) {
            controls.playBtn.addEventListener('click', () => this.togglePlay());
        }
        if (controls.nextBtn) {
            controls.nextBtn.addEventListener('click', () => this.playNext());
        }
        if (controls.prevBtn) {
            controls.prevBtn.addEventListener('click', () => this.playPrevious());
        }
        if (controls.shuffleBtn) {
            controls.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
            controls.shuffleBtn.classList.toggle('active', this.isShuffled);
        }
        if (controls.repeatBtn) {
            controls.repeatBtn.addEventListener('click', () => this.toggleRepeat());
            this.updateRepeatButtonUI(controls.repeatBtn);
        }
        if (controls.progressBar) {
            controls.progressBar.addEventListener('click', (e) => this.seekTo(e));
        }
    }

    setupVolumeControl() {
        const volumeControl = document.querySelector('.volume-control');
        if (volumeControl) {
            volumeControl.value = this.volume * 100;
            volumeControl.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
    }

    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        this.audio.volume = this.volume;
        localStorage.setItem('musicHubVolume', this.volume);
        this.updateVolumeUI();
        
        // Update mute state
        this.isMuted = this.volume === 0;
        this.updateVolumeIcon();
    }

    toggleMute() {
        if (this.isMuted) {
            this.setVolume(this.lastVolume || 1);
        } else {
            this.lastVolume = this.volume;
            this.setVolume(0);
        }
    }

    updateVolumeUI() {
        const volumeLevel = document.getElementById('volumeLevel');
        if (volumeLevel) {
            volumeLevel.style.width = `${this.volume * 100}%`;
        }
    }

    updateVolumeIcon() {
        const volumeIcon = document.getElementById('volumeIcon');
        if (volumeIcon) {
            if (this.volume === 0) {
                volumeIcon.className = 'bi bi-volume-mute volume-icon';
            } else if (this.volume < 0.5) {
                volumeIcon.className = 'bi bi-volume-down volume-icon';
            } else {
                volumeIcon.className = 'bi bi-volume-up volume-icon';
            }
        }
    }

    updatePlayerUI() {
        try {
            const elements = {
                trackTitle: document.querySelector('.track-info h4'),
                artistName: document.querySelector('.track-info p'),
                trackImage: document.querySelector('.now-playing img'),
                playBtn: document.querySelector('.player-controls .bi-play-circle-fill, .player-controls .bi-pause-circle-fill'),
                duration: document.querySelector('.duration'),
                currentTime: document.querySelector('.current-time')
            };

            if (elements.trackTitle) elements.trackTitle.textContent = this.currentTrack.title;
            if (elements.artistName) elements.artistName.textContent = this.currentTrack.artist;
            if (elements.trackImage) elements.trackImage.src = this.currentTrack.coverUrl;
            if (elements.playBtn) {
                elements.playBtn.classList.remove('bi-play-circle-fill', 'bi-pause-circle-fill');
                elements.playBtn.classList.add(this.isPlaying ? 'bi-pause-circle-fill' : 'bi-play-circle-fill');
            }
            
            this.updateTimeDisplay(elements.currentTime, elements.duration);
        } catch (error) {
            console.error('Error updating player UI:', error);
        }
    }

    updateTimeDisplay(currentTimeEl, durationEl) {
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
        if (durationEl) {
            durationEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const progress = document.querySelector('.progress');
        if (progress && this.audio.duration) {
            const percentage = (this.audio.currentTime / this.audio.duration) * 100;
            progress.style.width = `${percentage}%`;
        }
        this.saveState();
    }

    async play(track) {
        try {
            if (track) {
                this.currentTrack = track;
                this.audio.src = track.audioUrl;
            }
            
            if (!this.audio.src) {
                throw new Error('No audio source available');
            }

            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayerUI();
            this.saveState();
        } catch (error) {
            console.error('Error playing audio:', error);
            this.handleAudioError(error);
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayerUI();
        this.saveState();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    handleTrackEnd() {
        switch (this.repeatMode) {
            case 'one':
                this.audio.currentTime = 0;
                this.play();
                break;
            case 'all':
                this.playNext();
                break;
            default:
                if (this.currentIndex < this.playlist.length - 1) {
                    this.playNext();
                }
                break;
        }
    }

    playNext() {
        if (this.playlist.length > 0) {
            if (this.isShuffled) {
                this.currentIndex = this.getNextShuffledIndex();
            } else {
                this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            }
            this.play(this.playlist[this.currentIndex]);
        }
    }

    playPrevious() {
        if (this.playlist.length > 0) {
            if (this.audio.currentTime > 3) {
                // If more than 3 seconds into the song, restart it
                this.audio.currentTime = 0;
            } else {
                if (this.isShuffled) {
                    this.currentIndex = this.getPreviousShuffledIndex();
                } else {
                    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
                }
                this.play(this.playlist[this.currentIndex]);
            }
        }
    }

    seekTo(event) {
        const progressBar = event.currentTarget;
        const clickPosition = event.offsetX / progressBar.offsetWidth;
        this.audio.currentTime = clickPosition * this.audio.duration;
    }

    setPlaylist(tracks, startIndex = 0) {
        this.playlist = tracks;
        this.currentIndex = startIndex;
        if (this.isShuffled) {
            this.shuffledIndices = this.generateShuffledIndices();
        }
        this.play(this.playlist[this.currentIndex]);
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        if (this.isShuffled) {
            this.shuffledIndices = this.generateShuffledIndices();
        }
        
        const shuffleBtn = document.querySelector('.player-controls .bi-shuffle');
        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', this.isShuffled);
        }
        
        this.saveState();
    }

    generateShuffledIndices() {
        const indices = Array.from({ length: this.playlist.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }

    getNextShuffledIndex() {
        const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentIndex);
        return this.shuffledIndices[(currentShuffleIndex + 1) % this.shuffledIndices.length];
    }

    getPreviousShuffledIndex() {
        const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentIndex);
        return this.shuffledIndices[(currentShuffleIndex - 1 + this.shuffledIndices.length) % this.shuffledIndices.length];
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        const repeatBtn = document.querySelector('.player-controls .bi-repeat');
        if (repeatBtn) {
            this.updateRepeatButtonUI(repeatBtn);
        }
        
        this.saveState();
    }

    updateRepeatButtonUI(repeatBtn) {
        repeatBtn.classList.remove('repeat-one', 'repeat-all', 'active');
        switch (this.repeatMode) {
            case 'one':
                repeatBtn.classList.add('repeat-one', 'active');
                break;
            case 'all':
                repeatBtn.classList.add('repeat-all', 'active');
                break;
        }
    }

    handleAudioError(error) {
        console.error('Audio error:', error);
        // Update UI to show error state
        const errorMessage = document.querySelector('.player-error-message');
        if (errorMessage) {
            errorMessage.textContent = 'Error playing track. Please try again.';
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    }

    handleLoadStart() {
        // Show loading state
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
    }

    handleCanPlay() {
        // Hide loading state
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

// Create a single instance of the audio player
const audioPlayer = new AudioPlayer();

// Export for global use
window.audioPlayer = audioPlayer; 