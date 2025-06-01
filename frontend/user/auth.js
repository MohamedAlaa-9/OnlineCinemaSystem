export function updateNavbar() {
    const token = localStorage.getItem("access_token");
    const navbarNav = document.querySelector("#navbarNav .navbar-nav");
    if (!navbarNav) return;

    navbarNav.innerHTML = "";

    if (token) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const dropdown = document.createElement("li");
        dropdown.className = "nav-item dropdown";
        dropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                <img src="${user.profile_photo || 'https://via.placeholder.com/30'}" 
                     alt="Profile" id="navProfilePic"
                     class="rounded-circle me-1" width="30" height="30">
                <span id="navUsername">${user.username || "User"}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>My Profile</a></li>
                <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
            </ul>
        `;
        navbarNav.appendChild(dropdown);

        // Logout action
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.href = "login.html";
            });
        }
    } else {
        navbarNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html"><i class="fas fa-sign-in-alt me-1"></i> Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="register.html"><i class="fas fa-user-plus me-1"></i> Register</a>
            </li>
        `;
    }
}
