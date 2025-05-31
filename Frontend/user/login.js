document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailHelp = document.getElementById("emailHelp");
  const passwordHelp = document.getElementById("passwordHelp");
  const loginButton = document.getElementById("loginButton");

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

  function validateEmail() {
    const value = emailInput.value.trim();
    const isEmpty = value === "";
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    updateHelpText(emailHelp, isValid, isEmpty);

    if (isEmpty) {
      emailInput.classList.remove("is-valid", "is-invalid");
      document.getElementById("emailFeedback").textContent = "Please enter your email address.";
      return false;
    }

    if (!isValid) {
      emailInput.classList.add("is-invalid");
      emailInput.classList.remove("is-valid");
      document.getElementById("emailFeedback").textContent = "Please enter a valid email address.";
      return false;
    }

    emailInput.classList.remove("is-invalid");
    emailInput.classList.add("is-valid");
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    const isEmpty = value === "";
    const isValid = value.length >= 6 && /\d/.test(value);

    updateHelpText(passwordHelp, isValid, isEmpty);

    if (isEmpty) {
      passwordInput.classList.remove("is-valid", "is-invalid");
      document.getElementById("passwordFeedback").textContent = "Please enter your password.";
      return false;
    }

    if (value.length < 6) {
      passwordInput.classList.add("is-invalid");
      passwordInput.classList.remove("is-valid");
      document.getElementById("passwordFeedback").textContent = "Password must be at least 6 characters long.";
      return false;
    }

    if (!/\d/.test(value)) {
      passwordInput.classList.add("is-invalid");
      passwordInput.classList.remove("is-valid");
      document.getElementById("passwordFeedback").textContent = "Password must include at least one number.";
      return false;
    }

    passwordInput.classList.remove("is-invalid");
    passwordInput.classList.add("is-valid");
    return true;
  }

  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", validatePassword);

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i> Please correct the errors in the form.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
      loginForm.insertAdjacentHTML("beforebegin", alertHTML);
      return;
    }

    loginButton.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Logging in...`;
    loginButton.disabled = true;

    const data = {
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
      loginButton.disabled = false;

      if (response.ok) {
        // احفظ التوكن لو فيه
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        const alertHTML = `
          <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            <i class="fas fa-check-circle me-2"></i> ${result.message || "Login successful!"} Redirecting...
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
        loginForm.insertAdjacentHTML("beforebegin", alertHTML);

        setTimeout(() => {
          window.location.href = "../index.html";
        }, 2000);
      } else {
        const error = result.detail || result.error || "Login failed. Please try again.";
        const alertHTML = `
          <div class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i> ${error}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
        loginForm.insertAdjacentHTML("beforebegin", alertHTML);
      }
    } catch (err) {
      loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
      loginButton.disabled = false;

      const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i> Network error. Please try again later.
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
