// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        alert('You have been logged out successfully!');
        window.location.href = 'login.html';
    }
});

// Change photo functionality
document.getElementById('photoInput').addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            document.getElementById('profilePhoto').src = e.target.result;
            document.getElementById('navProfilePic').src = e.target.result;
        }
        
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Format dates function
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatDateTime(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    };
    return new Date(date).toLocaleString('en-US', options);
}

// Fetch user profile from API and update UI
function loadUserProfile() {
    fetch('http://127.0.0.1:8000/api/users/profile', {
        method: 'GET',
        credentials: 'include', // if cookies/session auth is used
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer <token>'  // if use token add here 
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        return response.json();
    })
    .then(data => {
        // Update profile picture if available
        if (data.profile_photo_url) {
            document.getElementById('profilePhoto').src = data.profile_photo_url;
            document.getElementById('navProfilePic').src = data.profile_photo_url;
        }
        
        document.getElementById('navUsername').textContent = data.username || '';
        document.getElementById('profileName').textContent = `${data.first_name || ''} ${data.last_name || ''}`;
        document.getElementById('profileUsername').textContent = `@${data.username || ''}`;
        document.getElementById('infoUsername').textContent = data.username || '';
        document.getElementById('infoEmail').textContent = data.email || '';
        document.getElementById('infoFirstName').textContent = data.first_name || '';
        document.getElementById('infoLastName').textContent = data.last_name || '';
        document.getElementById('infoDateJoined').textContent = data.date_joined ? formatDate(data.date_joined) : '';
        document.getElementById('infoLastLogin').textContent = data.last_login ? formatDateTime(data.last_login) : '';
    })
    .catch(error => {
        console.error('Error loading profile:', error);
        alert('Error loading profile data. Please try again later.');
    });
}

// Load user profile on page load
window.addEventListener('DOMContentLoaded', loadUserProfile);
