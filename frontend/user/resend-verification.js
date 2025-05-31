document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resendVerificationForm");
  const email = document.getElementById("email");
  const emailHelp = document.getElementById("emailHelp");

  // Function to show alert messages
  function showAlert(message, type = "success") {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertHTML = `
      <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    form.insertAdjacentHTML("beforebegin", alertHTML);

    // If success, redirect to verify-account page after delay
    if (type === "success") {
      setTimeout(() => {
        window.location.href = "verify-account.html";
      }, 2000);
    }
  }

  // Function to update help text
  function updateHelpText(helpElement, isValid, isEmpty) {
    if (isEmpty) {
      helpElement.classList.remove("hidden", "success", "error");
      helpElement.classList.add("info");
    } else if (isValid) {
      helpElement.classList.add("hidden");
      helpElement.classList.remove("success", "error", "info");
    } else {
      helpElement.classList.remove("hidden", "info", "success");
      helpElement.classList.add("error");
    }
  }

  // Email validation
  email.addEventListener("input", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmpty = email.value.trim() === "";
    const isValid = emailRegex.test(email.value);

    updateHelpText(emailHelp, isValid, isEmpty);

    if (isValid) {
      email.classList.remove("is-invalid");
      email.classList.add("is-valid");
    } else if (!isEmpty) {
      email.classList.remove("is-valid");
      email.classList.add("is-invalid");
    } else {
      email.classList.remove("is-valid", "is-invalid");
    }
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailValue = email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      email.classList.add("is-invalid");
      showAlert("Please enter a valid email address.", "danger");
      return;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending Verification Email...';
    submitButton.disabled = true;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/resend-verification/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("Verification email has been sent. Please check your inbox (including spam folder). Redirecting to verification page...");
        form.reset();
        form.style.display = "none";
      } else {
        if (data.detail) {
          showAlert(data.detail, "danger");
        } else if (data.email) {
          showAlert(data.email[0], "danger");
        } else if (data.error) {
          showAlert(data.error, "danger");
        } else if (response.status === 404) {
          showAlert("Email address not found. Please check the email or register a new account.", "danger");
        } else if (response.status === 400) {
          if (data.message === "ALREADY_VERIFIED") {
            showAlert("This account is already verified. Please login.", "info");
            setTimeout(() => {
              window.location.href = "login.html";
            }, 2000);
            form.style.display = "none";
          } else if (data.message) {
            showAlert(data.message, "danger");
          } else if (data.non_field_errors) {
            showAlert(data.non_field_errors[0], "danger");
          } else {
            showAlert("Invalid request. Please check your email and try again.", "danger");
          }
        } else {
          showAlert(`Server error (${response.status}). Please try again later.`, "danger");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error.message === "INVALID_JSON") {
        showAlert("Server returned an invalid response. Please try again.", "danger");
      } else if (!navigator.onLine) {
        showAlert("No internet connection. Please check your connection and try again.", "danger");
      } else {
        showAlert("Connection error. Please make sure the server is running and try again.", "danger");
      }
    } finally {
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    }
  });
});
