// Authentication module
const auth = {
    // Check if user is logged in
    isLoggedIn() {
        const userData = localStorage.getItem('userData');
        return !!userData;
    },

    // Get current user data
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('userData'));
        } catch {
            return null;
        }
    },

    // Check if user is artist
    isArtist() {
        const user = this.getCurrentUser();
        return user?.accountType === 'artist';
    },

    // Initialize page authentication
    initPageAuth() {
        // Show/hide artist-only elements
        const artistOnlyElements = document.querySelectorAll('.artist-only');
        artistOnlyElements.forEach(el => {
            el.style.display = this.isArtist() ? 'flex' : 'none';
        });

        return true;
    },

    // Logout user
    logout() {
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
};

// Export auth module
window.auth = auth;

// Authentication System
const Auth = {
    login: function(email, password) {
        // Initialize MusicHub account if it doesn't exist
        const userAccounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
        const musicHubAccount = userAccounts.find(account => account.username === 'MusicHub');
        
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
        
        // Find user with matching email and password
        const user = userAccounts.find(account => 
            account.email === email && account.password === password
        );

        if (user) {
            // Store user data for the session
            localStorage.setItem('userData', JSON.stringify(user));
            
            // Check if user has completed profile setup
            if (!user.hasCompletedProfileSetup) {
                return 'profile-pic';
            }
            return true;
        }
        return false;
    },

    logout: function() {
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    },

    isLoggedIn: function() {
        return localStorage.getItem('userData') !== null;
    }
};

// Make Auth available globally
window.Auth = Auth; 