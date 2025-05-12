// Utility functions for playlist management

// Generate a playlist cover from the songs in the playlist
async function generatePlaylistCover(input) {
    // Handle both array of songs and playlist object
    const songs = Array.isArray(input) ? input : (input.songs || []);
    
    if (!songs || songs.length === 0) {
        return createDefaultPlaylistCover(Array.isArray(input) ? 'New Playlist' : input.name);
    }

    // Get up to 4 song covers for the collage
    const covers = songs.slice(0, 4).map(song => song.coverArt).filter(cover => cover);

    if (covers.length === 0) {
        return createDefaultPlaylistCover(Array.isArray(input) ? 'New Playlist' : input.name);
    }

    // Create a canvas to combine the covers
    const canvas = document.createElement('canvas');
    const size = 300; // Final image size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    try {
        // Load all images
        const images = await Promise.all(covers.map(coverUrl => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = coverUrl;
            });
        }));

        // Draw the collage based on number of images
        switch(images.length) {
            case 1:
                // Single image fills the entire canvas
                ctx.drawImage(images[0], 0, 0, size, size);
                break;
            case 2:
                // Two images side by side
                ctx.drawImage(images[0], 0, 0, size/2, size);
                ctx.drawImage(images[1], size/2, 0, size/2, size);
                break;
            case 3:
                // One image on top, two below
                ctx.drawImage(images[0], 0, 0, size/2, size);
                ctx.drawImage(images[1], size/2, 0, size/2, size/2);
                ctx.drawImage(images[2], size/2, size/2, size/2, size/2);
                break;
            case 4:
                // 2x2 grid
                ctx.drawImage(images[0], 0, 0, size/2, size/2);
                ctx.drawImage(images[1], size/2, 0, size/2, size/2);
                ctx.drawImage(images[2], 0, size/2, size/2, size/2);
                ctx.drawImage(images[3], size/2, size/2, size/2, size/2);
                break;
        }

        // Add a subtle overlay to make text more readable
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, size, size);

        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.error('Error generating playlist cover:', error);
        return createDefaultPlaylistCover(Array.isArray(input) ? 'New Playlist' : input.name);
    }
}

// Create a default cover for empty playlists
function createDefaultPlaylistCover(playlistName) {
    // Create a canvas for the default cover
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    gradient.addColorStop(0, '#0066ff');
    gradient.addColorStop(1, '#00ccff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);

    // Add playlist name
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // If name is too long, reduce it
    let displayName = playlistName;
    if (playlistName.length > 20) {
        displayName = playlistName.substring(0, 17) + '...';
    }
    
    ctx.fillText(displayName, 150, 150);

    return canvas.toDataURL('image/jpeg');
}

// Update playlist cover
async function updatePlaylistCover(playlistId) {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = allPlaylists.find(p => p.id === playlistId);
    
    if (!playlist) return;

    // Get all songs in the playlist
    const allSongs = JSON.parse(localStorage.getItem('songs')) || [];
    const playlistSongs = playlist.songs.map(songId => 
        allSongs.find(song => song.id === songId)
    ).filter(song => song); // Filter out any undefined songs

    try {
        // Generate cover based on songs or create default
        playlist.coverArt = await generatePlaylistCover(playlistSongs);
        localStorage.setItem('playlists', JSON.stringify(allPlaylists));
        return playlist.coverArt;
    } catch (error) {
        console.error('Error updating playlist cover:', error);
        return createDefaultPlaylistCover(playlist.name);
    }
}

async function setCustomPlaylistCover(playlist, imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Create an image to get dimensions
                const img = new Image();
                img.src = e.target.result;
                
                await new Promise(resolve => img.onload = resolve);
                
                // Create canvas for resizing and processing
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                
                // Calculate dimensions to maintain aspect ratio
                let dx = 0, dy = 0, dWidth = 300, dHeight = 300;
                const ratio = img.width / img.height;
                
                if (ratio > 1) {
                    // Image is wider than tall
                    dHeight = 300 / ratio;
                    dy = (300 - dHeight) / 2;
                } else if (ratio < 1) {
                    // Image is taller than wide
                    dWidth = 300 * ratio;
                    dx = (300 - dWidth) / 2;
                }
                
                // Draw background (in case image has transparency)
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, 300, 300);
                
                // Draw the image
                ctx.drawImage(img, dx, dy, dWidth, dHeight);
                
                const coverUrl = canvas.toDataURL('image/jpeg');
                resolve(coverUrl);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}

// Export functions
window.createDefaultPlaylistCover = createDefaultPlaylistCover;
window.generatePlaylistCover = generatePlaylistCover;
window.setCustomPlaylistCover = setCustomPlaylistCover;
window.updatePlaylistCover = updatePlaylistCover; 