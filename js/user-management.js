// User Management Utilities

// Initialize user data structure
function initializeUserData(userData) {
    // Get all user accounts
    const userAccounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
    
    // Check if MusicHub official account exists
    const musicHubAccount = userAccounts.find(account => account.username === 'MusicHub');
    
    // Create MusicHub official account if it doesn't exist
    if (!musicHubAccount) {
        const officialAccount = {
            id: 'musichub-official',
            username: 'MusicHub',
            email: 'hatwiblube@gmail.com',
            password: 'MH@official2024',
            accountType: 'artist',
            bio: 'I Built This Shit Brick By Brick',
            profile: {
                photo: 'assets/profiles/musichub-official.jpg'
            },
            followers: [],
            following: [],
            playlists: [],
            isVerified: true,
            createdAt: new Date().toISOString()
        };
        userAccounts.push(officialAccount);
        localStorage.setItem('userAccounts', JSON.stringify(userAccounts));
    }

    // Initialize arrays if they don't exist
    if (!userData.following) userData.following = [];
    if (!userData.followers) userData.followers = [];
    if (!userData.playlists) userData.playlists = [];
    if (!userData.likes) userData.likes = {};
    if (!userData.bio) userData.bio = '';
    if (!userData.profile) {
        userData.profile = {
            photo: 'assets/default-avatar.jpg',
            social: {}
        };
    }
    return userData;
}

// Follow/Unfollow functionality
function toggleFollow(targetUsername) {
    const currentUser = JSON.parse(localStorage.getItem('userData'));
    let allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    
    if (!currentUser || !currentUser.username) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    
    const targetUserIndex = allUsers.findIndex(user => user.username === targetUsername);
    const currentUserIndex = allUsers.findIndex(user => user.username === currentUser.username);
    
    if (targetUserIndex === -1 || currentUserIndex === -1) return false;
    
    // Initialize arrays for target user if they don't exist
    if (!allUsers[targetUserIndex].followers) allUsers[targetUserIndex].followers = [];
    if (!allUsers[targetUserIndex].following) allUsers[targetUserIndex].following = [];
    
    const isFollowing = currentUser.following.includes(targetUsername);
    
    if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter(username => username !== targetUsername);
        allUsers[targetUserIndex].followers = allUsers[targetUserIndex].followers.filter(username => username !== currentUser.username);
        allUsers[currentUserIndex].following = allUsers[currentUserIndex].following.filter(username => username !== targetUsername);
    } else {
        // Follow
        currentUser.following.push(targetUsername);
        allUsers[targetUserIndex].followers.push(currentUser.username);
        allUsers[currentUserIndex].following.push(targetUsername);
    }
    
    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(currentUser));
    localStorage.setItem('userAccounts', JSON.stringify(allUsers));
    
    // Update UI if we're on explore or profile page
    if (window.location.pathname.includes('explore.html')) {
        if (typeof loadContent === 'function') {
            loadContent();
        }
    } else if (window.location.pathname.includes('profile.html')) {
        // Update followers/following count if on profile page
        updateFollowerCount(targetUsername);
        updateFollowingCount(currentUser.username);
    }
    
    return !isFollowing;
}

// Get user's followers
function getFollowers(username) {
    const allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    const user = allUsers.find(u => u.username === username);
    return user?.followers || [];
}

// Get user's following
function getFollowing(username) {
    const allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    const user = allUsers.find(u => u.username === username);
    return user?.following || [];
}

// Get user profile
function getUserProfile(username) {
    const allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    return allUsers.find(u => u.username === username);
}

// Check if a user is following another user
function isFollowing(followerUsername, targetUsername) {
    if (!followerUsername || !targetUsername) return false;
    const allUsers = JSON.parse(localStorage.getItem('userAccounts')) || [];
    const follower = allUsers.find(u => u.username === followerUsername);
    return follower?.following?.includes(targetUsername) || false;
}

// Navigate to user profile
function navigateToProfile(username) {
    if (!username) return;
    window.location.href = `profile.html?username=${username}`;
}

// Helper function to update follower count in UI
function updateFollowerCount(username) {
    const followerCountElement = document.getElementById('followersCount');
    if (followerCountElement) {
        const followers = getFollowers(username);
        followerCountElement.textContent = followers.length;
    }
}

// Helper function to update following count in UI
function updateFollowingCount(username) {
    const followingCountElement = document.getElementById('followingCount');
    if (followingCountElement) {
        const following = getFollowing(username);
        followingCountElement.textContent = following.length;
    }
}

// Export all functions
window.userManagement = {
    initializeUserData,
    toggleFollow,
    getFollowers,
    getFollowing,
    getUserProfile,
    isFollowing,
    navigateToProfile,
    updateFollowerCount,
    updateFollowingCount
}; 