        // Get movie ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        
        // In a real application, you would fetch movie details from a database
        // For this demo, we'll use a simple object with movie data
        const movies = {
            "avengers": {
                title: "Avengers: Endgame",
                genres: "Action, Adventure, Sci-Fi",
                rating: "8.5",
                duration: "3h 1m",
                year: "2019",
                synopsis: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
                director: "Anthony Russo, Joe Russo",
                cast: "Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson",
                releaseDate: "April 26, 2019",
                language: "English",
                poster: "https://via.placeholder.com/600x900",
                trailer: "TcMBFSGVi1c",
                rating: "PG-13"
            },
            "batman": {
                title: "The Batman",
                genres: "Action, Crime, Drama",
                rating: "9.0",
                duration: "2h 56m",
                year: "2022",
                synopsis: "When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
                director: "Matt Reeves",
                cast: "Robert Pattinson, Zoë Kravitz, Jeffrey Wright, Colin Farrell",
                releaseDate: "March 4, 2022",
                language: "English",
                poster: "https://via.placeholder.com/600x900",
                trailer: "mqqft2x_Aa4",
                rating: "PG-13"
            },
            "dune": {
                title: "Dune",
                genres: "Adventure, Drama, Sci-Fi",
                rating: "7.8",
                duration: "2h 35m",
                year: "2021",
                synopsis: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.",
                director: "Denis Villeneuve",
                cast: "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Josh Brolin",
                releaseDate: "October 22, 2021",
                language: "English",
                poster: "https://via.placeholder.com/600x900",
                trailer: "8g18jFHCLXk",
                rating: "PG-13"
            }
        };
        
        // Default to Avengers if no ID is provided or ID is not found
        const movie = movies[movieId] || movies.avengers;
        
        // Update page with movie details
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('movieGenres').textContent = movie.genres;
        document.getElementById('movieRating').textContent = movie.rating;
        document.getElementById('movieDuration').textContent = movie.duration;
        document.getElementById('movieYear').textContent = movie.year;
        document.getElementById('movieSynopsis').textContent = movie.synopsis;
        document.getElementById('movieDirector').textContent = movie.director;
        document.getElementById('movieCast').textContent = movie.cast;
        document.getElementById('movieReleaseDate').textContent = movie.releaseDate;
        document.getElementById('movieLanguage').textContent = movie.language;
        document.getElementById('moviePoster').src = movie.poster;
        
        // Update cart details
        document.getElementById('cartMovieTitle').textContent = movie.title;
        document.getElementById('cartMovieDetails').textContent = `${movie.duration} | ${movie.rating}`;
        document.getElementById('cartMoviePoster').src = movie.poster;
        
        // Update page title
        document.title = `${movie.title} - Cinema`;
        
        // Update trailer iframe
        const trailerIframe = document.querySelector('.ratio iframe');
        if (trailerIframe && movie.trailer) {
            trailerIframe.src = `https://www.youtube.com/embed/${movie.trailer}`;
        }
        
        // Cart functionality
        let ticketCount = 2;
        const ticketPrice = 12.00;
        const availableSeats = 150 - ticketCount;
        
        // Update cart display
        function updateCart() {
            document.getElementById('ticketCount').textContent = ticketCount;
            document.getElementById('itemTotal').textContent = `$${(ticketCount * ticketPrice).toFixed(2)}`;
            document.getElementById('cartTotal').textContent = `$${(ticketCount * ticketPrice).toFixed(2)}`;
            document.getElementById('availableSeats').textContent = availableSeats;
            
            // Update checkout button URL with parameters
            const dateSelect = document.getElementById('dateSelect');
            const timeSelect = document.getElementById('timeSelect');
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            const checkoutUrl = `../payment/payment.html?movie=${encodeURIComponent(movie.title)}&date=${dateSelect.value}&time=${encodeURIComponent(timeSelect.value)}&tickets=${ticketCount}&total=${(ticketCount * ticketPrice).toFixed(2)}`;
            checkoutBtn.href = checkoutUrl;
        }
        
        // Initialize cart
        updateCart();
        
        // Ticket counter buttons
        document.getElementById('decreaseTickets').addEventListener('click', function() {
            if (ticketCount > 1) {
                ticketCount--;
                updateCart();
            }
        });
        
        document.getElementById('increaseTickets').addEventListener('click', function() {
            if (ticketCount < availableSeats) {
                ticketCount++;
                updateCart();
            }
        });
        
        // Update date and time in cart
        function updateDateTime() {
            const dateSelect = document.getElementById('dateSelect');
            const timeSelect = document.getElementById('timeSelect');
            
            const dateObj = new Date(dateSelect.value);
            const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            
            document.getElementById('cartDateTime').textContent = `${formattedDate} | ${timeSelect.value}`;
            
            // Update checkout button URL
            updateCart();
        }
        
        // Add event listeners for date and time selects
        document.getElementById('dateSelect').addEventListener('change', updateDateTime);
        document.getElementById('timeSelect').addEventListener('change', updateDateTime);
        
        // Initialize date and time display
        updateDateTime();