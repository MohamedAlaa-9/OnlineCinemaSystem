document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const usernameHelp = document.getElementById("usernameHelp");
  const passwordHelp = document.getElementById("passwordHelp");
  const loginButton = document.getElementById("loginButton");

  // Utility function to update help text classes
  function updateHelpText(helpElement, isValid, isEmpty) {
    if (isEmpty) {
      // Show info style if input is empty
      helpElement.classList.remove("hidden", "success", "error");
      helpElement.classList.add("info");
    } else if (isValid) {
      // Hide help text if valid
      helpElement.classList.add("hidden");
      helpElement.classList.remove("success", "error", "info");
    } else {
      // Show error style if invalid
      helpElement.classList.remove("hidden", "info", "success");
      helpElement.classList.add("error");
    }
  }

  // Validate username based on your rules:
  // 3-20 characters, at least one letter, and at least one number or underscore
  function validateUsername() {
    const value = usernameInput.value.trim();
    const isEmpty = value === "";
    const usernameRegex = /^(?=.*[A-Za-z])(?=.*[\d_])[A-Za-z\d_]{3,20}$/;
    const isValid = usernameRegex.test(value);

    updateHelpText(usernameHelp, isValid, isEmpty);

    if (isEmpty) {
      usernameInput.classList.remove("is-valid", "is-invalid");
      document.getElementById("usernameFeedback").textContent =
        "Username is required.";
      return false;
    }

    if (!isValid) {
      usernameInput.classList.add("is-invalid");
      usernameInput.classList.remove("is-valid");
      document.getElementById("usernameFeedback").textContent =
        "Username must be 3-20 characters and contain at least one letter and one number or underscore.";
      return false;
    }

    usernameInput.classList.remove("is-invalid");
    usernameInput.classList.add("is-valid");
    return true;
  }

  // Password validation (unchanged)
  function validatePassword() {
    const value = passwordInput.value;
    const isEmpty = value === "";
    const isValid = value.length >= 6 && /\d/.test(value);

    updateHelpText(passwordHelp, isValid, isEmpty);

    if (isEmpty) {
      passwordInput.classList.remove("is-valid", "is-invalid");
      document.getElementById("passwordFeedback").textContent =
        "Please enter your password.";
      return false;
    }

    if (value.length < 6) {
      passwordInput.classList.add("is-invalid");
      passwordInput.classList.remove("is-valid");
      document.getElementById("passwordFeedback").textContent =
        "Password must be at least 6 characters long.";
      return false;
    }

    if (!/\d/.test(value)) {
      passwordInput.classList.add("is-invalid");
      passwordInput.classList.remove("is-valid");
      document.getElementById("passwordFeedback").textContent =
        "Password must include at least one number.";
      return false;
    }

    passwordInput.classList.remove("is-invalid");
    passwordInput.classList.add("is-valid");
    return true;
  }

  // Event listeners for real-time validation
  usernameInput.addEventListener("input", validateUsername);
  passwordInput.addEventListener("input", validatePassword);

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Show loading state
    loginButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';
    loginButton.disabled = true;

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
      loginButton.disabled = false;

      if (response.ok) {
        if (result.access_token) {
          localStorage.setItem("access_token", result.access_token);
          localStorage.setItem("refresh_token", result.refresh_token);
          
          // Fetch user profile and store it
          const profileResponse = await fetch("http://127.0.0.1:8000/api/users/profile/", {
            headers: {
              "Authorization": `Bearer ${result.access_token}`
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            localStorage.setItem("user", JSON.stringify(profileData));
          }
        }

        const alertHTML = `
          <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            <i class="fas fa-check-circle me-2"></i>Login successful! Redirecting...
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
        loginForm.insertAdjacentHTML("beforebegin", alertHTML);

        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);
      } else {
        const error = result.detail || result.error || "Login failed. Please try again.";
        const alertHTML = `
          <div class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>${error}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
        loginForm.insertAdjacentHTML("beforebegin", alertHTML);
      }
    } catch (error) {
      console.error("Login error:", error);
      loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
      loginButton.disabled = false;

      const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>Network error. Please try again.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
      loginForm.insertAdjacentHTML("beforebegin", alertHTML);
    }
  });

  // Animation on load
  const formElements = loginForm.querySelectorAll("input, button");
  formElements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    setTimeout(() => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, 100 * (index + 1));
  });
});
