document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm")
  const email = document.getElementById("email")
  const username = document.getElementById("username")
  const firstname = document.getElementById("firstname")
  const lastname = document.getElementById("lastname")
  const password = document.getElementById("password")
  const password2 = document.getElementById("password2")
  const termsCheck = document.getElementById("termsCheck")

  // Help text elements
  const emailHelp = document.getElementById("emailHelp")
  const usernameHelp = document.getElementById("usernameHelp")
  const firstnameHelp = document.getElementById("firstnameHelp")
  const lastnameHelp = document.getElementById("lastnameHelp")
  const passwordHelp = document.getElementById("passwordHelp")
  const password2Help = document.getElementById("password2Help")

  // Password requirement elements
  const lengthCheck = document.getElementById("length-check")
  const numberCheck = document.getElementById("number-check")

  // Function to show alert and redirect
  function showAlertAndRedirect(message, type, shouldRedirect = false) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show d-flex align-items-center`;
    alertDiv.role = 'alert';
    
    // Add appropriate icon based on type
    const icon = type === 'success' ? 
      '<i class="fas fa-check-circle me-2"></i>' : 
      '<i class="fas fa-exclamation-circle me-2"></i>';
    
    alertDiv.innerHTML = `
      ${icon}
      <div>
        ${message}
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Insert alert at the top of the form
    const container = form.parentElement;
    container.insertBefore(alertDiv, form);

    // If should redirect, do it after delay
    if (shouldRedirect) {
      setTimeout(() => {
        window.location.href = "verify-account.html";
      }, 2000);
    }
  }

  // Function to prevent number input in name fields
  function preventNumbers(event) {
    if (/[0-9]/.test(event.key)) {
      event.preventDefault()
    }
  }

  // Add keypress event listeners to name fields
  firstname.addEventListener('keypress', preventNumbers)
  lastname.addEventListener('keypress', preventNumbers)

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

  // Email validation function
  function isValidEmail(email) {
    // Basic email format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return false;

    // Check email length
    if (email.length < 5 || email.length > 254) return false;

    // Split email into local and domain parts
    const [localPart, domain] = email.split('@');

    // Check local part length
    if (localPart.length > 64) return false;

    // Check domain length
    if (domain.length > 255) return false;

    // Check if domain is common
    const commonDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'protonmail.com', 'mail.com'
    ];
    
    // If domain is not common, make sure it's at least properly formatted
    if (!commonDomains.includes(domain.toLowerCase())) {
      const domainParts = domain.split('.');
      // Domain should have at least two parts and last part should be 2-6 characters
      if (domainParts.length < 2 || !/^[a-zA-Z]{2,6}$/.test(domainParts[domainParts.length - 1])) {
        return false;
      }
    }

    return true;
  }

  // Email validation
  email.addEventListener("input", () => {
    const emailValue = email.value.trim();
    const isEmpty = emailValue === "";
    const isValidFormat = isValidEmail(emailValue);

    updateHelpText(emailHelp, isValidFormat, isEmpty);

    if (isValidFormat) {
      email.classList.remove("is-invalid");
      email.classList.add("is-valid");
      emailHelp.innerHTML = '<i class="fas fa-check text-success"></i> Valid email format';
    } else if (!isEmpty) {
      email.classList.remove("is-valid");
      email.classList.add("is-invalid");
      if (!emailValue.includes('@')) {
        emailHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Email must contain @';
      } else if (!emailValue.includes('.')) {
        emailHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Email must contain a domain (e.g. .com)';
      } else {
        emailHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Please enter a valid email address';
      }
    } else {
      email.classList.remove("is-valid", "is-invalid");
      emailHelp.innerHTML = '<i class="fas fa-info-circle"></i> Please enter your email address';
    }
  });

  // First name validation
  firstname.addEventListener("input", () => {
    const nameValue = firstname.value.trim()
    const isEmpty = nameValue === ""
    const nameRegex = /^[a-zA-Zء-ي\s]{3,30}$/
    const isValid = nameRegex.test(nameValue)

    updateHelpText(firstnameHelp, isValid, isEmpty)

    if (isValid) {
      firstname.classList.remove("is-invalid")
      firstname.classList.add("is-valid")
      firstnameHelp.innerHTML = '<i class="fas fa-check text-success"></i> Valid name'
    } else if (!isEmpty) {
      firstname.classList.remove("is-valid")
      firstname.classList.add("is-invalid")
      firstnameHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Name should only contain letters (3-30 characters)'
    } else {
      firstname.classList.remove("is-valid", "is-invalid")
      firstnameHelp.innerHTML = '<i class="fas fa-info-circle"></i> Please enter your first name'
    }
  })

  // Last name validation
  lastname.addEventListener("input", () => {
    const nameValue = lastname.value.trim()
    const isEmpty = nameValue === ""
    const nameRegex = /^[a-zA-Zء-ي\s]{3,30}$/
    const isValid = nameRegex.test(nameValue)

    updateHelpText(lastnameHelp, isValid, isEmpty)

    if (isValid) {
      lastname.classList.remove("is-invalid")
      lastname.classList.add("is-valid")
      lastnameHelp.innerHTML = '<i class="fas fa-check text-success"></i> Valid name'
    } else if (!isEmpty) {
      lastname.classList.remove("is-valid")
      lastname.classList.add("is-invalid")
      lastnameHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Name should only contain letters (3-30 characters)'
    } else {
      lastname.classList.remove("is-valid", "is-invalid")
      lastnameHelp.innerHTML = '<i class="fas fa-info-circle"></i> Please enter your last name'
    }
  })

  // Username validation with better rules
  username.addEventListener("input", () => {
    const usernameValue = username.value.trim()
    const isEmpty = usernameValue === ""
    // Username must start with a letter, can contain letters, numbers, and underscore
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/
    const isValid = usernameRegex.test(usernameValue)

    updateHelpText(usernameHelp, isValid, isEmpty)

    if (isValid) {
      username.classList.remove("is-invalid")
      username.classList.add("is-valid")
      usernameHelp.innerHTML = '<i class="fas fa-check text-success"></i> Valid username'
    } else if (!isEmpty) {
      username.classList.remove("is-valid")
      username.classList.add("is-invalid")
      if (usernameValue.length < 5) {
        usernameHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Username must be at least 5 characters'
      } else if (usernameValue.length > 20) {
        usernameHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Username must be less than 20 characters'
      } else if (!/^[a-zA-Z]/.test(usernameValue)) {
        usernameHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Username must start with a letter'
      } else {
        usernameHelp.innerHTML = '<i class="fas fa-times text-danger"></i> Username can only contain letters, numbers, and underscore'
      }
    } else {
      username.classList.remove("is-valid", "is-invalid")
      usernameHelp.innerHTML = '<i class="fas fa-info-circle"></i> Please enter a username'
    }
  })

  // Password validation
  password.addEventListener("input", () => {
    const value = password.value
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

    if (isValid) {
      password.classList.remove("is-invalid")
      password.classList.add("is-valid")
    } else if (!isEmpty) {
      password.classList.remove("is-valid")
      password.classList.add("is-invalid")
    } else {
      password.classList.remove("is-valid", "is-invalid")
    }

    // Check if passwords match
    if (password2.value) {
      const passwordsMatch = password.value === password2.value
      updateHelpText(password2Help, passwordsMatch, false)

      if (passwordsMatch) {
        password2.classList.remove("is-invalid")
        password2.classList.add("is-valid")
      } else {
        password2.classList.remove("is-valid")
        password2.classList.add("is-invalid")
      }
    }
  })

  // Confirm password validation
  password2.addEventListener("input", () => {
    const isEmpty = password2.value === ""
    const passwordsMatch = password.value === password2.value && password.value !== ""

    updateHelpText(password2Help, passwordsMatch, isEmpty)

    if (passwordsMatch) {
      password2.classList.remove("is-invalid")
      password2.classList.add("is-valid")
    } else if (!isEmpty) {
      password2.classList.remove("is-valid")
      password2.classList.add("is-invalid")
    } else {
      password2.classList.remove("is-valid", "is-invalid")
    }
  })

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';

      const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value.trim(),
          username: username.value.trim(),
          first_name: firstname.value.trim(),
          last_name: lastname.value.trim(),
          password: password.value,
          password2: password2.value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store registration data
        const registrationData = {
          email: email.value.trim(),
          timestamp: new Date().getTime(),
          status: 'pending'
        };
        localStorage.setItem('registrationData', JSON.stringify(registrationData));

        // Clear form and show success message
        form.reset();
        showAlertAndRedirect(
          "Registration successful! Please check your email for verification. Redirecting to login page...", 
          "success",
          true
        );
      } else {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;

        // Handle specific error messages
        if (data.email) {
          const message = Array.isArray(data.email) ? data.email[0] : data.email;
          showAlertAndRedirect(message, "danger");
          email.classList.add("is-invalid");
          email.focus();
        } else if (data.username) {
          const message = Array.isArray(data.username) ? data.username[0] : data.username;
          showAlertAndRedirect(message, "danger");
          username.classList.add("is-invalid");
          username.focus();
        } else if (data.password) {
          const message = Array.isArray(data.password) ? data.password[0] : data.password;
          showAlertAndRedirect(message, "danger");
          password.classList.add("is-invalid");
          password.focus();
        } else if (data.detail) {
          showAlertAndRedirect(data.detail, "danger");
        } else if (data.message) {
          showAlertAndRedirect(data.message, "danger");
        } else {
          showAlertAndRedirect("Registration failed. Please check your information and try again.", "danger");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      showAlertAndRedirect("Unable to connect to the server. Please try again later.", "danger");
      
      // Reset button state
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
})
