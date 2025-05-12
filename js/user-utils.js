// User verification utilities
const userUtils = {
    // Check if a user is verified (artist with 150+ followers or official account)
    isVerified: function(user) {
        if (user.username === 'MusicHub') return true;
        return user.accountType === 'artist' && 
               user.followers && 
               user.followers.length >= 150;
    },

    // Get user verification badge HTML if verified
    getVerificationBadge: function(user) {
        return this.isVerified(user) ? 
            '<i class="bi bi-patch-check-fill verified-badge" title="Verified Artist"></i>' : 
            '';
    },

    // Update verification status for all users
    updateVerificationStatus: function() {
        const users = JSON.parse(localStorage.getItem('userAccounts')) || [];
        users.forEach(user => {
            if (user.username === 'MusicHub') {
                user.isVerified = true;
            } else if (user.accountType === 'artist') {
                const followerCount = user.followers ? user.followers.length : 0;
                user.isVerified = followerCount >= 150;
            }
        });
        localStorage.setItem('userAccounts', JSON.stringify(users));
    }
};

// Add CSS for verification badge if not already present
if (!document.getElementById('verification-styles')) {
    const style = document.createElement('style');
    style.id = 'verification-styles';
    style.textContent = `
        .verified-badge {
            color: var(--accent-blue);
            font-size: 1rem;
            margin-left: 0.25rem;
            vertical-align: middle;
        }
        
        .verified-badge:hover::after {
            content: 'Verified Artist';
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-top: 1.5rem;
            transform: translateX(-50%);
            white-space: nowrap;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
} 