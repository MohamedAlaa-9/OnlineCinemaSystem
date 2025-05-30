// Movies page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Search functionality
  const searchInput = document.querySelector('input[placeholder="Search for movies..."]')
  const searchButton = searchInput ? searchInput.nextElementSibling : null

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const searchTerm = searchInput.value.trim().toLowerCase()
      if (searchTerm) {
        // In a real application, this would search the movies
        alert("Searching for: " + searchTerm)
      }
    })
  }

  // Allow search on Enter key
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const searchTerm = searchInput.value.trim().toLowerCase()
        if (searchTerm) {
          // In a real application, this would search the movies
          alert("Searching for: " + searchTerm)
        }
      }
    })
  }

  // Book tickets functionality
  const bookButtons = document.querySelectorAll('.btn-primary[href="#"]')
  bookButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault()
      const movieTitle = this.closest(".card-body").querySelector(".card-title").textContent
      // In a real application, this would redirect to a booking page
      alert("Booking tickets for: " + movieTitle)
    })
  })

  // Notify me functionality
  const notifyButtons = document.querySelectorAll(".btn-outline-primary")
  notifyButtons.forEach((button) => {
    if (button.textContent.includes("Notify Me")) {
      button.addEventListener("click", function () {
        const movieTitle = this.closest(".card-body").querySelector(".card-title").textContent
        // In a real application, this would register for notifications
        alert("You will be notified when " + movieTitle + " is available for booking!")
      })
    }
  })
})
