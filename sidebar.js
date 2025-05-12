// Navigation configuration
const navItems = [
    { href: 'feed.html', icon: 'house-door', text: 'Home' },
    { href: 'explore.html', icon: 'compass', text: 'Explore' },
    { href: 'album.html', icon: 'collection', text: 'Albums' },
    { href: 'playlist.html', icon: 'music-note-list', text: 'Playlists' },
    { href: 'upload.html', icon: 'cloud-upload', text: 'Upload Music', artistOnly: true },
    { href: 'profile.html', icon: 'person', text: 'Profile' },
    { href: 'settings.html', icon: 'gear', text: 'Settings' }
];

// Function to check if user is logged in and get user type
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    return JSON.parse(userData);
}

// Generate sidebar HTML
function generateSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'feed.html';
    const userData = getCurrentUser();
    const isArtist = userData && userData.accountType === 'artist';
    
    return `
        <div class="sidebar-header">
            <h1>MusicHub</h1>
        </div>
        ${navItems
            .filter(item => !item.artistOnly || (item.artistOnly && isArtist))
            .map(item => `
                <a href="${item.href}" 
                   class="nav-item ${currentPage === item.href ? 'active' : ''}">
                    <i class="bi bi-${item.icon}"></i>
                    <span class="nav-text">${item.text}</span>
                </a>
            `).join('')}
    `;
}

// Function to initialize sidebar
function initSidebar() {
    const sidebarElement = document.querySelector('.sidebar');
    if (sidebarElement) {
        const userData = getCurrentUser();
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }
        
        // Generate sidebar HTML
        sidebarElement.innerHTML = generateSidebar();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSidebar);

// Re-initialize sidebar when user data changes
window.addEventListener('storage', function(e) {
    if (e.key === 'userData') {
        initSidebar();
    }
});

// Export for global use
window.initSidebar = initSidebar;

// Check if user is logged in and handle artist-only elements
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    // Show/hide artist-only elements based on user role
    const artistOnlyElements = document.querySelectorAll('.artist-only');
    artistOnlyElements.forEach(el => {
        el.style.display = userData.accountType === 'artist' ? 'flex' : 'none';
    });
}); 