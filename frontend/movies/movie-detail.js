document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://127.0.0.1:8000/api';
    const token = localStorage.getItem('access_token');
    const urlParams = new URLSearchParams(window.location.search);
    const movieName = urlParams.get('name');
    let groupedShowtimes = {};
    // Elements
    const movieTitle = document.getElementById('movieTitle');
    const moviePoster = document.getElementById('moviePoster');
    const movieRating = document.getElementById('movieRating');
    const movieYear = document.getElementById('movieYear');
    const movieGenres = document.getElementById('movieGenres');
    const movieSynopsis = document.getElementById('movieSynopsis');
    const movieDirector = document.getElementById('movieDirector');
    const movieCast = document.getElementById('movieCast');
    const movieReleaseDate = document.getElementById('movieReleaseDate');
    const movieTrailer = document.querySelector('.ratio.ratio-16x9 iframe');
    const cartMoviePoster = document.getElementById('cartMoviePoster');
    const cartMovieTitle = document.getElementById('cartMovieTitle');
    const cartMovieDetails = document.getElementById('cartMovieDetails');
    const bookingForm = document.getElementById('bookingForm');
    const dateSelect = document.getElementById('dateSelect');
    const timeSelect = document.getElementById('timeSelect');
    const ticketCount = document.getElementById('ticketCount');
    const itemTotal = document.getElementById('itemTotal');
    const cartTotal = document.getElementById('cartTotal');
    const decreaseTickets = document.getElementById('decreaseTickets');
    const increaseTickets = document.getElementById('increaseTickets');
    const reviewForm = document.getElementById('reviewForm');
    const reviewCount = document.getElementById('reviewCount');
    const ticketPriceDisplay = document.getElementById('ticketPriceDisplay');
    const movieTotalSeats = document.getElementById('movieTotalSeats');
    const movieAvailableSeats = document.getElementById('movieAvailableSeats');

    let movieData = null;
    let ticketPrice = 0;

    // Function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Function to format price
    function formatPrice(price) {
        return `$${parseFloat(price).toFixed(2)}`;
    }

    // Function to update cart totals
    function updateCartTotals() {
        const count = parseInt(ticketCount.textContent);
        const total = count * ticketPrice;
        itemTotal.textContent = formatPrice(total);
        cartTotal.textContent = formatPrice(total);
    }

    // Load movie details
    async function loadMovieDetails() {
        try {
            if (!movieName) {
                throw new Error('Movie name not provided');
            }

            // First decode the movie name from URL
            const decodedMovieName = decodeURIComponent(movieName);
            console.log('Attempting to load movie:', decodedMovieName);

            // Create the URL with proper encoding
            const url = `${API_URL}/movies/${decodedMovieName}/`;
            console.log('Request URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : undefined,
                    'Accept': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Server returned ${response.status}: ${response.statusText}\n${errorText}`);
            }

            movieData = await response.json();
            console.log('Received movie data:', movieData);
            
            // Get ticket price from backend or use default
            ticketPrice = movieData.ticket_price || 10.00;
            
            // Update ticket price display
            if (ticketPriceDisplay) {
                ticketPriceDisplay.textContent = `${formatPrice(ticketPrice)} per ticket`;
            }

            // Update seats information
            if (movieTotalSeats) {
                movieTotalSeats.textContent = movieData.total_seats || 'Not available';
            }
            if (movieAvailableSeats) {
                movieAvailableSeats.textContent = movieData.seats_available || 'Not available';
            }

            // Update movie details
            document.title = `${movieData.title} - Cinema`;
            movieTitle.textContent = movieData.title;
            moviePoster.src = movieData.poster || 'https://via.placeholder.com/600x900';
            movieRating.textContent = movieData.imdb_rating || 'N/A';
            movieYear.textContent = new Date(movieData.release_date).getFullYear();
            movieGenres.textContent = Array.isArray(movieData.genres) ? movieData.genres.join(', ') : movieData.genres;
            movieSynopsis.textContent = movieData.description;
            movieDirector.textContent = movieData.director;
            movieCast.textContent = movieData.actors;
            movieReleaseDate.textContent = formatDate(movieData.release_date);
            
            if (movieData.trailer_url) {
                movieTrailer.src = movieData.trailer_url;
            }

            // Update cart section
            cartMoviePoster.src = movieData.poster || 'https://via.placeholder.com/100x150';
            cartMovieTitle.textContent = movieData.title;
            cartMovieDetails.textContent = `${movieData.imdb_rating} Rating`;

            // Update initial totals with the correct price
            updateCartTotals();

        } catch (error) {
            console.error('Error loading movie details:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger';
            errorMessage.innerHTML = `
                <h4 class="alert-heading">Error Loading Movie Details</h4>
                <p>There was a problem loading the movie details. This might be because:</p>
                <ul>
                    <li>The movie name contains special characters</li>
                    <li>The server is not responding</li>
                    <li>The movie does not exist in our database</li>
                </ul>
                <hr>
                <p class="mb-0">Technical details: ${error.message}</p>
                <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Try Again
                </button>
            `;
            
            // Insert error message at the top of the page
            const container = document.querySelector('.container');
            if (container) {
                container.insertBefore(errorMessage, container.firstChild);
            }
        }
    }

    // Handle ticket quantity changes
    if (decreaseTickets) {
        decreaseTickets.addEventListener('click', () => {
            const currentCount = parseInt(ticketCount.textContent);
            if (currentCount > 1) {
                ticketCount.textContent = currentCount - 1;
                updateCartTotals();
            }
        });
    }

    if (increaseTickets) {
        increaseTickets.addEventListener('click', () => {
            const currentCount = parseInt(ticketCount.textContent);
            if (currentCount < 10) {
                ticketCount.textContent = currentCount + 1;
                updateCartTotals();
            }
        });
    }
    async function loadShowtimes() {
        try {
            const response = await fetch(`${API_URL}/movies/${encodeURIComponent(movieName)}/showtimes/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching showtimes: ${response.statusText}`);
            }
    
            const showtimes = await response.json();
    
            // Clear selects
            dateSelect.innerHTML = '<option value="">Select Date</option>';
            timeSelect.innerHTML = '<option value="">Select Time</option>';
    
            showtimes.forEach(st => {
                const dt = new Date(st.starts_at);
                const date = dt.toISOString().split('T')[0];
                const time = dt.toTimeString().slice(0, 5);
                const id = st.id;
            
                if (!groupedShowtimes[date]) groupedShowtimes[date] = [];
                groupedShowtimes[date].push({ time, id });
            });
    
            Object.keys(groupedShowtimes).forEach(date => {
                const option = document.createElement('option');
                option.value = date;
                option.textContent = date;
                dateSelect.appendChild(option);
            });
    
            // When a date is selected, populate timeSelect
            dateSelect.addEventListener('change', () => {
                const selectedDate = dateSelect.value;
                timeSelect.innerHTML = '<option value="">Select Time</option>';
                if (groupedShowtimes[selectedDate]) {
                    groupedShowtimes[selectedDate].forEach(entry => {
                        const opt = document.createElement('option');
                        opt.value = entry.id;
                        opt.textContent = entry.time;
                        timeSelect.appendChild(opt);
                    });
                }
            });
    
        } catch (err) {
            console.error('Failed to load showtimes:', err);
        }
    }
    

    // Handle booking form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', async e => {
            e.preventDefault();
        
            const showtime_id = timeSelect.value;
            const count = parseInt(ticketCount.textContent);
            if (!showtime_id || !count) return alert("Select time and number of tickets");
        
            try {
                // 1. Step One: Book tickets and get booking ID
                const bookingRes = await fetch(`${API_URL}/bookings/BookNow/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ showtime_id, count })
                });
        
                if (!bookingRes.ok) {
                    const errData = await bookingRes.json();
                    throw new Error(errData.error || "Booking failed");
                }
        
                const bookingId = await bookingRes.json();
                console.log("Booking created with ID:", bookingId);
        
                // 2. Step Two: Create Stripe Checkout Session
                const stripeRes = await fetch(`${API_URL}/stripe/create-checkout-session/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ showtime_id, quantity: count })
                });
        
                if (!stripeRes.ok) {
                    const errData = await stripeRes.json();
                    throw new Error(errData.error || "Stripe session creation failed");
                }
        
                const stripeData = await stripeRes.json();
                console.log("Redirecting to Stripe Checkout:", stripeData.checkout_url);
                window.location.href = stripeData.checkout_url;
        
            } catch (err) {
                console.error("Error during booking + checkout:", err);
                alert(`Checkout failed: ${err.message}`);
            }
        });
    }        

    // Handle review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!token) {
                alert('Please log in to submit a review');
                window.location.href = '../user/login.html';
                return;
            }

            const rating = document.querySelector('input[name="rating"]:checked')?.value;
            const comment = document.querySelector('#reviewComment').value;

            if (!rating || !comment) {
                alert('Please provide both a rating and a comment');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/movies/${encodeURIComponent(movieName)}/review/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        rating: parseFloat(rating),
                        comment: comment
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                alert('Review submitted successfully!');
                window.location.reload();

            } catch (error) {
                console.error('Error submitting review:', error);
                alert('Failed to submit review. Please try again later.');
            }
        });
    }

    // Update navbar based on authentication
    function updateNavbar() {
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
                    <li><a class="dropdown-item" href="../user/profile.html">
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
                    window.location.href = '../user/login.html';
                });
            }
        } else {
            // Remove any existing auth items
            const authLinks = navbarNav.querySelectorAll('.nav-item:nth-child(n+3)');
            authLinks.forEach(link => link.remove());
            
            // Add login and register links
            navbarNav.innerHTML += `
                <li class="nav-item">
                    <a class="nav-link" href="../user/login.html"><i class="fas fa-sign-in-alt me-1"></i> Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../user/register.html"><i class="fas fa-user-plus me-1"></i> Register</a>
                </li>
            `;
        }
    }

    // Initialize
    loadShowtimes();
    loadMovieDetails();
    
    updateNavbar();
    updateCartTotals();

    // Add click handler for Book Now link
    const bookNowLink = document.querySelector('a[href="#booking-section"]');
    if (bookNowLink) {
        bookNowLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#booking-section').scrollIntoView({ behavior: 'smooth' });
        });
    }
});
