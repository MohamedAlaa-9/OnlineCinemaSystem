document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetPasswordForm")
  const email = document.getElementById("email")
  const emailFeedback = document.getElementById("emailFeedback")
  const emailHelp = document.getElementById("emailHelp")

  // Function to update help text
  function updateHelpText(helpElement, isValid, isEmpty) {
    if (isEmpty) {
      helpElement.classList.remove("hidden", "success", "error")
      helpElement.classList.add("info")
    } else if (isValid) {
      helpElement.classList.add("hidden")
      helpElement.classList.remove("success", "error", "info")
    } else {
      helpElement.classList.remove("hidden", "info", "success")
      helpElement.classList.add("error")
    }
  }

  // Email validation
  email.addEventListener("input", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmpty = email.value.trim() === ""
    const isValid = emailRegex.test(email.value)

    updateHelpText(emailHelp, isValid, isEmpty)

    if (isValid) {
      email.classList.remove("is-invalid")
      email.classList.add("is-valid")
    } else if (!isEmpty) {
      email.classList.remove("is-valid")
      email.classList.add("is-invalid")
    } else {
      email.classList.remove("is-valid", "is-invalid")
    }
  })

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      email.classList.add("is-invalid")
      return
    }

    // If validation passes
    alert("Password reset link has been sent to your email!")
    window.location.href = "new-password.html"
  })
})
