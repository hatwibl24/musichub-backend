// Social Interactions Handler

// Like a song
function likeSong(songId) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return false;

    // Initialize likes array if it doesn't exist
    if (!userData.likedSongs) userData.likedSongs = [];

    const isLiked = userData.likedSongs.includes(songId);
    
    if (isLiked) {
        // Unlike
        userData.likedSongs = userData.likedSongs.filter(id => id !== songId);
    } else {
        // Like
        userData.likedSongs.push(songId);
    }

    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Update like button state
    const likeBtn = document.querySelector(`[data-song-id="${songId}"] .like-btn`);
    if (likeBtn) {
        likeBtn.className = `like-btn ${!isLiked ? 'active' : ''}`;
        likeBtn.innerHTML = `
            <i class="bi ${!isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
            <span class="like-count">${getLikeCount(songId)}</span>
        `;
    }

    return !isLiked;
}

// Like an album
function likeAlbum(albumId) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return false;

    // Initialize likes array if it doesn't exist
    if (!userData.likedAlbums) userData.likedAlbums = [];

    const isLiked = userData.likedAlbums.includes(albumId);
    
    if (isLiked) {
        // Unlike
        userData.likedAlbums = userData.likedAlbums.filter(id => id !== albumId);
    } else {
        // Like
        userData.likedAlbums.push(albumId);
    }

    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Update like button state
    const likeBtn = document.querySelector(`[data-album-id="${albumId}"] .like-btn`);
    if (likeBtn) {
        likeBtn.className = `like-btn ${!isLiked ? 'active' : ''}`;
        likeBtn.innerHTML = `
            <i class="bi ${!isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
            <span class="like-count">${getAlbumLikeCount(albumId)}</span>
        `;
    }

    return !isLiked;
}

// Get like count for a song
function getLikeCount(songId) {
    const allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    return allUsers.reduce((count, user) => {
        if (user.likedSongs && user.likedSongs.includes(songId)) {
            return count + 1;
        }
        return count;
    }, 0);
}

// Get like count for an album
function getAlbumLikeCount(albumId) {
    const allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    return allUsers.reduce((count, user) => {
        if (user.likedAlbums && user.likedAlbums.includes(albumId)) {
            return count + 1;
        }
        return count;
    }, 0);
}

// Check if current user has liked a song
function isLikedBySong(songId) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.likedSongs) return false;
    return userData.likedSongs.includes(songId);
}

// Check if current user has liked an album
function isLikedByAlbum(albumId) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.likedAlbums) return false;
    return userData.likedAlbums.includes(albumId);
}

// Get user's followers count
function getFollowersCount(username) {
    const allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    return allUsers.reduce((count, user) => {
        if (user.following && user.following.includes(username)) {
            return count + 1;
        }
        return count;
    }, 0);
}

// Get user's following count
function getFollowingCount(username) {
    const user = JSON.parse(localStorage.getItem('userAccounts'))
        .find(u => u.username === username);
    return user && user.following ? user.following.length : 0;
}

// Check if a user is following another user
function isFollowing(followerUsername, targetUsername) {
    const user = JSON.parse(localStorage.getItem('userAccounts'))
        .find(u => u.username === followerUsername);
    return user && user.following && user.following.includes(targetUsername);
}

// Generate HTML for like button
function generateLikeButton(id, type, isLiked, likeCount) {
    return `
        <button class="like-btn ${isLiked ? 'active' : ''}" 
                onclick="${type === 'song' ? 'likeSong' : 'likeAlbum'}('${id}')"
                data-${type}-id="${id}">
            <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
            <span class="like-count">${likeCount}</span>
        </button>
    `;
}

// CSS for like buttons
const styles = `
    .like-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 8px;
    }

    .like-btn:hover {
        color: #ff4081;
        background: rgba(255, 64, 129, 0.1);
    }

    .like-btn.active {
        color: #ff4081;
    }

    .like-btn i {
        font-size: 1.2rem;
    }

    .like-count {
        font-size: 0.9rem;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 