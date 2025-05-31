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
function loadReviews() {
  // In a real application, you would fetch reviews from a database
  // For this demo, we'll use sample reviews
  const sampleReviews = [
    {
      id: 1,
      name: "John D.",
      avatar: "JD",
      date: "May 15, 2023",
      rating: 5,
      content:
        "Absolutely loved this movie! The special effects were mind-blowing and the story kept me engaged throughout. Definitely worth watching in IMAX!",
      helpful: 24,
      notHelpful: 3,
    },
    {
      id: 2,
      name: "Sarah M.",
      avatar: "SM",
      date: "May 12, 2023",
      rating: 4,
      content:
        "Great performances by the entire cast. The cinematography was beautiful, though I felt the ending was a bit rushed. Still, I'd recommend it to anyone who enjoys this genre.",
      helpful: 18,
      notHelpful: 2,
    },
    {
      id: 3,
      name: "Michael T.",
      avatar: "MT",
      date: "May 10, 2023",
      rating: 3,
      content:
        "It was okay. Some parts were exciting, but overall it didn't live up to the hype. The middle section dragged on a bit too long for my taste.",
      helpful: 7,
      notHelpful: 12,
    },
  ]

  const reviewsContainer = document.getElementById("reviewsList")
  if (!reviewsContainer) return

  // Clear existing reviews
  reviewsContainer.innerHTML = ""

  // Add reviews to the container
  sampleReviews.forEach((review) => {
    const reviewElement = createReviewElement(review)
    reviewsContainer.appendChild(reviewElement)
  })

  // Update review count
  const reviewCount = document.getElementById("reviewCount")
  if (reviewCount) {
    reviewCount.textContent = sampleReviews.length
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

  reviewElement.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">${review.avatar}</div>
                <div>
                    <div class="reviewer-name">${review.name}</div>
                    <div class="review-date">${review.date}</div>
                </div>
            </div>
            <div class="review-rating">
                ${starsHtml}
            </div>
        </div>
        <div class="review-content">
            ${review.content}
        </div>
        <div class="review-actions">
            <div class="review-action review-helpful">
                <i class="fas fa-thumbs-up"></i> Helpful (${review.helpful})
            </div>
            <div class="review-action review-not-helpful">
                <i class="fas fa-thumbs-down"></i> Not Helpful (${review.notHelpful})
            </div>
        </div>
    `

  return reviewElement
}

// Function to submit a new review
function submitReview() {
  const nameInput = document.getElementById("reviewerName")
  const ratingInputs = document.querySelectorAll('input[name="rating"]')
  const contentInput = document.getElementById("reviewContent")

  // Get values
  const name = nameInput.value.trim()
  let rating = 0
  for (const input of ratingInputs) {
    if (input.checked) {
      rating = Number.parseInt(input.value)
      break
    }
  }
  const content = contentInput.value.trim()

  // Validate inputs
  if (name === "" || rating === 0 || content === "") {
    alert("Please fill in all fields and select a rating.")
    return
  }

  // Create new review object
  const newReview = {
    id: Date.now(), // Use timestamp as ID
    name: name,
    avatar: name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase(),
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    rating: rating,
    content: content,
    helpful: 0,
    notHelpful: 0,
  }

  // Add review to the list
  const reviewsContainer = document.getElementById("reviewsList")
  const reviewElement = createReviewElement(newReview)
  reviewsContainer.insertBefore(reviewElement, reviewsContainer.firstChild)

  // Update review count
  const reviewCount = document.getElementById("reviewCount")
  if (reviewCount) {
    reviewCount.textContent = Number.parseInt(reviewCount.textContent) + 1
  }

  // Reset form
  document.getElementById("reviewForm").reset()

  // Show success message
  alert("Thank you for your review!")
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
