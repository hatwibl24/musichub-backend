class PlayBar {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'none'; // none, one, all
        this.currentTrack = null;
        this.queue = [];
        this.volume = 1;
        this.isMuted = false;

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Main container
        this.playBar = document.getElementById('playBar');

        // Buttons
        this.playPauseButton = document.getElementById('playPauseButton');
        this.previousButton = document.getElementById('previousButton');
        this.nextButton = document.getElementById('nextButton');
        this.shuffleButton = document.getElementById('shuffleButton');
        this.repeatButton = document.getElementById('repeatButton');
        this.volumeButton = document.getElementById('volumeButton');

        // Progress and volume elements
        this.progressBar = document.getElementById('progressBar');
        this.progress = document.getElementById('progress');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.totalTimeDisplay = document.getElementById('totalTime');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeLevel = document.getElementById('volumeLevel');

        // Track info elements
        this.trackArt = document.getElementById('currentTrackArt');
        this.trackTitle = document.getElementById('currentTrackTitle');
        this.trackArtist = document.getElementById('currentTrackArtist');
    }

    setupEventListeners() {
        // Playback control listeners
        this.playPauseButton.addEventListener('click', () => this.togglePlay());
        this.previousButton.addEventListener('click', () => this.playPrevious());
        this.nextButton.addEventListener('click', () => this.playNext());
        this.shuffleButton.addEventListener('click', () => this.toggleShuffle());
        this.repeatButton.addEventListener('click', () => this.toggleRepeat());
        this.volumeButton.addEventListener('click', () => this.toggleMute());

        // Progress bar listeners
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        // Volume slider listeners
        this.volumeSlider.addEventListener('click', (e) => this.setVolume(e));

        // Audio element listeners
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
    }

    show() {
        this.playBar.classList.add('visible');
    }

    hide() {
        this.playBar.classList.remove('visible');
    }

    loadTrack(track) {
        this.currentTrack = track;
        this.audio.src = track.audioUrl;
        this.trackArt.src = track.coverArt || 'assets/default-cover.jpg';
        this.trackTitle.textContent = track.title;
        this.trackArtist.textContent = track.artist;
        
        this.show();
        this.play();
    }

    play() {
        this.audio.play();
        this.isPlaying = true;
        this.playPauseButton.querySelector('i').className = 'bi bi-pause-fill';
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseButton.querySelector('i').className = 'bi bi-play-fill';
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    playNext() {
        // Implementation depends on queue management
        console.log('Playing next track');
    }

    playPrevious() {
        // Implementation depends on queue management
        console.log('Playing previous track');
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleButton.classList.toggle('active', this.isShuffle);
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        const icon = this.repeatButton.querySelector('i');
        icon.className = this.repeatMode === 'one' ? 'bi bi-repeat-1' : 'bi bi-repeat';
        this.repeatButton.classList.toggle('active', this.repeatMode !== 'none');
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        
        const icon = this.volumeButton.querySelector('i');
        if (this.isMuted) {
            icon.className = 'bi bi-volume-mute-fill';
            this.volumeLevel.style.width = '0%';
        } else {
            icon.className = 'bi bi-volume-up-fill';
            this.volumeLevel.style.width = (this.volume * 100) + '%';
        }
    }

    seekTo(event) {
        const bounds = this.progressBar.getBoundingClientRect();
        const percent = (event.clientX - bounds.left) / bounds.width;
        this.audio.currentTime = percent * this.audio.duration;
    }

    setVolume(event) {
        const bounds = this.volumeSlider.getBoundingClientRect();
        const volume = (event.clientX - bounds.left) / bounds.width;
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        this.volumeLevel.style.width = (this.volume * 100) + '%';
        
        // Update volume icon
        const icon = this.volumeButton.querySelector('i');
        if (this.volume === 0) {
            icon.className = 'bi bi-volume-mute-fill';
        } else if (this.volume < 0.5) {
            icon.className = 'bi bi-volume-down-fill';
        } else {
            icon.className = 'bi bi-volume-up-fill';
        }
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progress.style.width = `${progress}%`;
            this.currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateTotalTime() {
        this.totalTimeDisplay.textContent = this.formatTime(this.audio.duration);
    }

    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all') {
            this.playNext();
        } else {
            this.pause();
            if (this.queue.length > 0) {
                this.playNext();
            }
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize play bar when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.playBar = new PlayBar();
}); 