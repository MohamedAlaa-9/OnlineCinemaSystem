import { updateNavbar } from "./auth.js";
document.addEventListener("DOMContentLoaded", () => {
    const profileUrl = "http://127.0.0.1:8000/api/users/profile/";
    const logoutUrl = "http://127.0.0.1:8000/api/users/logout/";
    const cartUrl = "http://127.0.0.1:8000/api/bookings/cart/";

    const token = localStorage.getItem("access_token");
    let currentUser = null; // Store current user data

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Initialize navbar
    updateNavbar();

    // Function to format date as DD/MM/YY
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    }

    // Function to get initials from username
    function getInitials(username) {
        return username ? username.slice(0, 2).toUpperCase() : 'US';
    }

    // Function to create default avatar
    function createDefaultAvatar(username) {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        const colorIndex = username ? username.length % colors.length : 0;
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="${colors[colorIndex]}"/>
                <text x="50" y="50" dy="0.35em" 
                    fill="white" 
                    font-family="Arial" 
                    font-size="40" 
                    text-anchor="middle">${getInitials(username)}</text>
            </svg>
        `)}`;
    }

    // Function to update profile pictures
    function updateProfilePictures(photoUrl, username) {
        const defaultAvatar = createDefaultAvatar(username);
        const finalPhotoUrl = photoUrl || defaultAvatar;

        if (profilePhoto) {
            profilePhoto.src = finalPhotoUrl;
            profilePhoto.alt = `${username}'s profile picture`;
        }
        if (navProfilePic) {
            navProfilePic.src = finalPhotoUrl;
            navProfilePic.alt = `${username}'s profile picture`;
        }
    }

    // Profile picture upload functionality
    const profilePhoto = document.getElementById("profilePhoto");
    const photoInput = document.getElementById("photoInput");
    const navProfilePic = document.getElementById("navProfilePic");
    const navUsername = document.getElementById("navUsername");

    if (photoInput) {
        photoInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type and size
            if (!file.type.startsWith("image/")) {
                showAlert("Please select an image file.", "danger");
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showAlert("Image size should be less than 5MB.", "danger");
                return;
            }

            // Show loading state
            const uploadBtn = document.querySelector('label[for="photoInput"]');
            const originalBtnText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
            uploadBtn.disabled = true;

            const formData = new FormData();
            formData.append("profile_photo", file);

            try {
                const response = await fetch(profileUrl, {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.detail || "Failed to upload image");
                }

                // Create a temporary URL for the uploaded file
                const tempImageUrl = URL.createObjectURL(file);
                
                // Update profile pictures immediately with the actual uploaded file
                if (profilePhoto) {
                    profilePhoto.src = tempImageUrl;
                }
                if (navProfilePic) {
                    navProfilePic.src = tempImageUrl;
                }

                // Update stored user data
                currentUser = { ...currentUser, profile_photo: result.profile_photo };
                localStorage.setItem("user", JSON.stringify(currentUser));

                showAlert("Profile picture updated successfully!", "success");

                // Fetch updated profile to ensure we have the correct server URL
                const updatedProfile = await fetch(profileUrl, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (updatedProfile.ok) {
                    const updatedData = await updatedProfile.json();
                    if (updatedData.profile_photo) {
                        // Update with the actual server URL
                        if (profilePhoto) {
                            profilePhoto.src = updatedData.profile_photo;
                        }
                        if (navProfilePic) {
                            navProfilePic.src = updatedData.profile_photo;
                        }
                        currentUser = updatedData;
                        localStorage.setItem("user", JSON.stringify(currentUser));
                    }
                }

            } catch (error) {
                console.error("Upload error:", error);
                showAlert(error.message || "Failed to upload profile picture. Please try again.", "danger");
            } finally {
                uploadBtn.innerHTML = originalBtnText;
                uploadBtn.disabled = false;
            }
        });
    }

    // Fetch user profile
    fetch(profileUrl, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
    })
    .then(data => {
        // Store current user data
        currentUser = data;

        // Update profile pictures
        updateProfilePictures(data.profile_photo, data.username);

        // Update usernames
        if (navUsername) {
            navUsername.textContent = data.username;
        }

        // Update profile header
        document.getElementById("profileName").textContent = data.first_name || data.username;
        document.getElementById("profileUsername").textContent = "@" + data.username;

        // Update detailed profile info with formatted dates
        const infoFields = {
            "infoUsername": data.username,
            "infoEmail": data.email,
            "infoFirstName": data.first_name || "Not set",
            "infoLastName": data.last_name || "Not set",
            "infoDateJoined": formatDate(data.date_joined),
            "infoLastLogin": formatDate(data.last_login)
        };

        Object.entries(infoFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data));
    })
    .catch(error => {
        console.error("Profile error:", error);
        showAlert("Failed to load profile. Please try logging in again.", "danger");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    });

    // Fetch booked tickets
    fetch(cartUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to load tickets");
        return res.json();
    })
    .then(data => {
        const tableBody = document.getElementById("ticketsTable");
        tableBody.innerHTML = "";

        if (data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4' class='text-center'>No tickets booked.</td></tr>";
            return;
        }

        data.forEach(ticket => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${ticket.movie_poster || 'https://via.placeholder.com/40x60'}" 
                             alt="Movie" 
                             class="me-2" 
                             style="width: 40px; height: 60px; object-fit: cover;">
                        <span>${ticket.movie_name || "Unknown Movie"}</span>
                    </div>
                </td>
                <td>${ticket.date || "N/A"}</td>
                <td>${ticket.time || "N/A"}</td>
                <td>${Array.isArray(ticket.seats) ? ticket.seats.join(', ') : "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Tickets error:", error);
    });

    // Logout functionality with confirmation
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showLogoutConfirmation();
        });
    }

    // Utility function to show alerts
    function showAlert(message, type = "info") {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === "success" ? "check-circle" : type === "danger" ? "exclamation-triangle" : "info-circle"} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        
        const container = document.querySelector(".container");
        if (container) {
            container.insertAdjacentHTML("afterbegin", alertHTML);
        }
    }
});
