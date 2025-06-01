document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://127.0.0.1:8000/api/';
    const moviesContainer = document.querySelector('.movies-grid');
    const loadingElement = document.getElementById('loadingMovies');
    const paginationElement = document.getElementById('moviePagination');
    let currentPage = 1;

    // Function to create movie card
    function createMovieCard(movie) {
        const encodedTitle = encodeURIComponent(movie.title);
        return `
            <div class="col">
                <div class="card movie-card shadow h-100">
                    <div class="position-relative">
                        <img src="${movie.poster || 'https://via.placeholder.com/300x450'}" class="card-img-top movie-poster" alt="${movie.title} Poster">
                        <div class="movie-rating">
                            <i class="fas fa-star me-1"></i>${movie.imdb_rating || 'N/A'}
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-white">${movie.title}</h5>
                        <p class="card-text text-white">${Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}</p>
                        <div class="d-grid gap-2">
                            <a href="movies/movie-detail.html?name=${encodedTitle}" class="btn btn-primary">
                                <i class="fas fa-ticket-alt me-2"></i>Book Tickets
                            </a>
                            ${movie.trailer_url ? `
                            <button class="btn btn-outline-light" onclick="window.open('${movie.trailer_url}', '_blank')">
                                <i class="fas fa-play me-2"></i>Watch Trailer
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to create pagination controls
    function createPaginationControls(currentPage, totalPages) {
        const pages = [];
        
        // Previous button
        pages.push(`
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            pages.push(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        // Next button
        pages.push(`
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `);

        return pages.join('');
    }

    // Function to load movies
    async function loadMovies(page = 1) {
        try {
            // Show loading state
            if (loadingElement) loadingElement.style.display = 'block';
            if (moviesContainer) moviesContainer.style.display = 'none';

            const response = await fetch(`${API_URL}movies/home/?page=${page}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Hide loading state
            if (loadingElement) loadingElement.style.display = 'none';
            if (moviesContainer) moviesContainer.style.display = 'flex';

            if (moviesContainer) {
                if (!data.movies || data.movies.length === 0) {
                    moviesContainer.innerHTML = `
                        <div class="col-12 text-center text-white">
                            <i class="fas fa-film fa-3x mb-3"></i>
                            <h3>No Movies Available</h3>
                            <p>Please try again later</p>
                            <div class="mt-3">
                                <button class="btn btn-primary me-2" onclick="window.location.reload()">
                                    <i class="fas fa-sync-alt me-2"></i>Try Again
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    moviesContainer.innerHTML = data.movies.map(movie => createMovieCard(movie)).join('');
                    
                    // Update pagination
                    if (paginationElement && data.total_pages > 1) {
                        paginationElement.innerHTML = `<ul class="pagination justify-content-center">
                            ${createPaginationControls(parseInt(data.current_page), data.total_pages)}
                        </ul>`;
                        
                        // Add click handlers to pagination controls
                        paginationElement.querySelectorAll('.page-link').forEach(link => {
                            link.addEventListener('click', async (e) => {
                                e.preventDefault();
                                const pageLink = e.target.closest('.page-link');
                                if (!pageLink || pageLink.parentElement.classList.contains('disabled')) return;
                                
                                const newPage = parseInt(pageLink.dataset.page);
                                if (newPage && newPage !== currentPage) {
                                    currentPage = newPage;
                                    await loadMovies(currentPage);
                                    
                                    // Scroll to top of movies section
                                    moviesContainer.scrollIntoView({ behavior: 'smooth' });
                                }
                            });
                        });
                    } else if (paginationElement) {
                        paginationElement.innerHTML = ''; // Hide pagination if only one page
                    }
                }
            }
        } catch (error) {
            console.error('Error loading movies:', error);
            
            // Hide loading state
            if (loadingElement) loadingElement.style.display = 'none';
            if (moviesContainer) {
                moviesContainer.style.display = 'flex';
                moviesContainer.innerHTML = `
                    <div class="col-12 text-center text-white">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <h3>Error Loading Movies</h3>
                        <p>Error details: ${error.message}</p>
                        <div class="mt-3">
                            <button class="btn btn-primary me-2" onclick="window.location.reload()">
                                <i class="fas fa-sync-alt me-2"></i>Try Again
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Load initial page
    loadMovies(1);

    // Update navbar based on authentication
    function updateNavbar() {
        const token = localStorage.getItem('access_token');
        const navbarNav = document.querySelector('#navbarNav .navbar-nav');
        if (!navbarNav) return;

        if (token) {
            // Get user data
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            
            // Update auth links
            const authLinks = navbarNav.querySelectorAll('.nav-item:nth-child(n+3)');
            authLinks.forEach(link => link.remove());
            
            // Add user dropdown
            const userDropdown = document.createElement('li');
            userDropdown.className = 'nav-item dropdown';
            userDropdown.innerHTML = `
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="${userData.profile_photo || 'https://via.placeholder.com/32'}" 
                         alt="Profile" 
                         class="rounded-circle me-2"
                         style="width: 32px; height: 32px; object-fit: cover;">
                    <span>${userData.username}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="user/profile.html">
                        <i class="fas fa-user me-2"></i>My Profile
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </a></li>
                </ul>
            `;
            navbarNav.appendChild(userDropdown);

            // Add logout handler
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = 'user/login.html';
                });
            }
        } else {
            // Remove any existing auth items
            const authLinks = navbarNav.querySelectorAll('.nav-item:nth-child(n+3)');
            authLinks.forEach(link => link.remove());
            
            // Add login and register links
            navbarNav.innerHTML += `
                <li class="nav-item">
                    <a class="nav-link" href="user/login.html"><i class="fas fa-sign-in-alt me-1"></i> Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="user/register.html"><i class="fas fa-user-plus me-1"></i> Register</a>
                </li>
            `;
        }
    }

    // Initialize navbar
    updateNavbar();
});
 