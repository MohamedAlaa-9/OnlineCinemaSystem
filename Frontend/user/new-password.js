document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newPasswordForm")
  const newPassword = document.getElementById("new_password")
  const confirmPassword = document.getElementById("confirm_password")
  const passwordHelp = document.getElementById("passwordHelp")
  const confirmHelp = document.getElementById("confirmHelp")

  // Password requirement elements
  const lengthCheck = document.getElementById("length-check")
  const numberCheck = document.getElementById("number-check")

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

  // Password validation
  newPassword.addEventListener("input", () => {
    const value = newPassword.value
    const isEmpty = value === ""
    const hasLength = value.length >= 6
    const hasNumber = /[0-9]/.test(value)
    const isValid = hasLength && hasNumber

    updateHelpText(passwordHelp, isValid, isEmpty)

    // Check length
    if (hasLength) {
      lengthCheck.innerHTML = '<i class="fas fa-check text-success"></i> Be at least 6 characters long'
      lengthCheck.classList.add("valid")
      lengthCheck.classList.remove("invalid")
    } else if (!isEmpty) {
      lengthCheck.innerHTML = '<i class="fas fa-times text-danger"></i> Be at least 6 characters long'
      lengthCheck.classList.add("invalid")
      lengthCheck.classList.remove("valid")
    } else {
      lengthCheck.innerHTML = '<i class="fas fa-circle help-icon"></i> Be at least 6 characters long'
      lengthCheck.classList.remove("valid", "invalid")
    }

    // Check number
    if (hasNumber) {
      numberCheck.innerHTML = '<i class="fas fa-check text-success"></i> Include at least one number'
      numberCheck.classList.add("valid")
      numberCheck.classList.remove("invalid")
    } else if (!isEmpty) {
      numberCheck.innerHTML = '<i class="fas fa-times text-danger"></i> Include at least one number'
      numberCheck.classList.add("invalid")
      numberCheck.classList.remove("valid")
    } else {
      numberCheck.innerHTML = '<i class="fas fa-circle help-icon"></i> Include at least one number'
      numberCheck.classList.remove("valid", "invalid")
    }

    // Overall password validation
    if (isValid) {
      newPassword.classList.remove("is-invalid")
      newPassword.classList.add("is-valid")
    } else if (!isEmpty) {
      newPassword.classList.remove("is-valid")
      newPassword.classList.add("is-invalid")
    } else {
      newPassword.classList.remove("is-valid", "is-invalid")
    }

    // Check if passwords match
    if (confirmPassword.value) {
      const passwordsMatch = newPassword.value === confirmPassword.value
      updateHelpText(confirmHelp, passwordsMatch, false)

      if (passwordsMatch) {
        confirmPassword.classList.remove("is-invalid")
        confirmPassword.classList.add("is-valid")
      } else {
        confirmPassword.classList.remove("is-valid")
        confirmPassword.classList.add("is-invalid")
      }
    }
  })

  // Confirm password validation
  confirmPassword.addEventListener("input", () => {
    const isEmpty = confirmPassword.value === ""
    const passwordsMatch = newPassword.value === confirmPassword.value && newPassword.value !== ""

    updateHelpText(confirmHelp, passwordsMatch, isEmpty)

    if (passwordsMatch) {
      confirmPassword.classList.remove("is-invalid")
      confirmPassword.classList.add("is-valid")
    } else if (!isEmpty) {
      confirmPassword.classList.remove("is-valid")
      confirmPassword.classList.add("is-invalid")
    } else {
      confirmPassword.classList.remove("is-valid", "is-invalid")
    }
  })

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Validate password
    const passwordValue = newPassword.value
    const isPasswordValid = passwordValue.length >= 6 && /[0-9]/.test(passwordValue)

    if (!isPasswordValid) {
      newPassword.classList.add("is-invalid")
      return
    }

    // Check if passwords match
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.classList.add("is-invalid")
      return
    }

    // If all validations pass
    alert("Password has been reset successfully!")
    window.location.href = "login.html"
  })
})
