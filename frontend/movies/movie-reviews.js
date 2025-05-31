// Global variables
const API_URL = 'http://127.0.0.1:8000/api';
const token = localStorage.getItem('access_token');
const urlParams = new URLSearchParams(window.location.search);
const movieName = urlParams.get('name');

document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on a movie detail page
  const reviewsSection = document.getElementById("reviewsSection")
  if (!reviewsSection) return

  // Load existing reviews
  loadReviews()

  // Add event listener for review form submission
  const reviewForm = document.getElementById("reviewForm")
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault()
      submitReview()
    })
  }

  // Add event listeners for helpful/not helpful buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("review-helpful") || e.target.parentElement.classList.contains("review-helpful")) {
      const reviewId = e.target.closest(".review-card").dataset.reviewId
      updateHelpfulCount(reviewId, true)
    } else if (
      e.target.classList.contains("review-not-helpful") ||
      e.target.parentElement.classList.contains("review-not-helpful")
    ) {
      const reviewId = e.target.closest(".review-card").dataset.reviewId
      updateHelpfulCount(reviewId, false)
    }
  })
})

// Function to load reviews
async function loadReviews() {
  try {
    if (!movieName) {
      throw new Error('Movie name not provided');
    }

    // Get reviews for this movie
    const response = await fetch(`${API_URL}/movies/${encodeURIComponent(movieName)}/reviews/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load reviews: ${response.status}`);
    }

    const reviews = await response.json();
    
    const reviewsContainer = document.getElementById("reviewsList");
    if (!reviewsContainer) return;

    // Clear existing reviews
    reviewsContainer.innerHTML = "";

    if (!reviews || reviews.length === 0) {
      reviewsContainer.innerHTML = `
        <div class="text-center text-muted my-4">
          <i class="fas fa-comments fa-3x mb-3"></i>
          <p>No reviews yet. Be the first to review this movie!</p>
        </div>
      `;
    } else {
      // Add reviews to the container
      reviews.forEach((review) => {
        const reviewElement = createReviewElement(review);
        reviewsContainer.appendChild(reviewElement);
      });
    }

    // Update review count
    const reviewCount = document.getElementById("reviewCount");
    if (reviewCount) {
      reviewCount.textContent = reviews.length;
    }

  } catch (error) {
    console.error('Error loading reviews:', error);
    const reviewsContainer = document.getElementById("reviewsList");
    if (reviewsContainer) {
      reviewsContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          ${error.message || 'Failed to load reviews. Please try again later.'}
        </div>
      `;
    }
  }
}

// Function to create a review element
function createReviewElement(review) {
  const reviewElement = document.createElement("div")
  reviewElement.className = "review-card"
  reviewElement.dataset.reviewId = review.id

  // Create stars HTML
  let starsHtml = ""
  for (let i = 1; i <= 5; i++) {
    if (i <= review.rating) {
      starsHtml += '<i class="fas fa-star"></i>'
    } else {
      starsHtml += '<i class="far fa-star"></i>'
    }
  }

  // Format the date
  const reviewDate = new Date(review.created_at).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Get user initials for avatar
  const userInitials = review.user.split(' ').map(name => name[0]).join('').toUpperCase();

  reviewElement.innerHTML = `
    <div class="review-header">
      <div class="reviewer-info">
        <div class="reviewer-avatar">${userInitials}</div>
        <div>
          <div class="reviewer-name">${review.user}</div>
          <div class="review-date">${reviewDate}</div>
        </div>
      </div>
      <div class="review-rating">
        ${starsHtml}
      </div>
    </div>
    <div class="review-content">
      ${review.comment}
    </div>
  `

  return reviewElement
}

// Function to submit a new review
async function submitReview() {
  try {
    if (!token) {
      alert('Please log in to submit a review');
      window.location.href = '../user/login.html';
      return;
    }

    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const contentInput = document.getElementById("reviewContent");

    // Get values
    let rating = 0;
    for (const input of ratingInputs) {
      if (input.checked) {
        rating = Number.parseInt(input.value);
        break;
      }
    }
    const comment = contentInput.value.trim();

    // Validate inputs
    if (rating === 0 || comment === "") {
      alert("Please provide both a rating and a comment.");
      return;
    }

    // Submit review to backend
    const response = await fetch(`${API_URL}/movies/${encodeURIComponent(movieName)}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rating,
        comment
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to submit review: ${response.status}`);
    }

    // Reset form
    document.getElementById("reviewForm").reset();

    // Wait a bit for the backend to process the review
    setTimeout(() => {
      // Reload reviews to show the new one
      loadReviews();
    }, 1000);

    // Show success message
    alert("Thank you for your review!");

  } catch (error) {
    console.error('Error submitting review:', error);
    alert(error.message || 'Failed to submit review. Please try again later.');
  }
}

// Function to update helpful/not helpful count
function updateHelpfulCount(reviewId, isHelpful) {
  // In a real application, you would update this in a database
  // For this demo, we'll just update the UI
  const reviewElement = document.querySelector(`.review-card[data-review-id="${reviewId}"]`)
  if (!reviewElement) return

  const helpfulElement = reviewElement.querySelector(".review-helpful")
  const notHelpfulElement = reviewElement.querySelector(".review-not-helpful")

  if (isHelpful) {
    const currentCount = Number.parseInt(helpfulElement.textContent.match(/\d+/)[0])
    helpfulElement.innerHTML = `<i class="fas fa-thumbs-up"></i> Helpful (${currentCount + 1})`
  } else {
    const currentCount = Number.parseInt(notHelpfulElement.textContent.match(/\d+/)[0])
    notHelpfulElement.innerHTML = `<i class="fas fa-thumbs-down"></i> Not Helpful (${currentCount + 1})`
  }

  // Disable both buttons after voting
  helpfulElement.style.pointerEvents = "none"
  notHelpfulElement.style.pointerEvents = "none"
  helpfulElement.style.opacity = "0.5"
  notHelpfulElement.style.opacity = "0.5"
}
