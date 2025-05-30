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

  // Username validation
  username.addEventListener("input", () => {
    const usernameRegex = /^(?=.*[a-zA-Z])(?=.*[0-9_])[a-zA-Z0-9_]{3,20}$/
    const isEmpty = username.value.trim() === ""
    const isValid = usernameRegex.test(username.value)

    updateHelpText(usernameHelp, isValid, isEmpty)

    if (isValid) {
      username.classList.remove("is-invalid")
      username.classList.add("is-valid")
    } else if (!isEmpty) {
      username.classList.remove("is-valid")
      username.classList.add("is-invalid")
    } else {
      username.classList.remove("is-valid", "is-invalid")
    }
  })

  // First name validation
  firstname.addEventListener("input", () => {
    const isEmpty = firstname.value.trim() === ""
    const isValid = firstname.value.trim().length >= 2

    updateHelpText(firstnameHelp, isValid, isEmpty)

    if (isValid) {
      firstname.classList.remove("is-invalid")
      firstname.classList.add("is-valid")
    } else if (!isEmpty) {
      firstname.classList.remove("is-valid")
      firstname.classList.add("is-invalid")
    } else {
      firstname.classList.remove("is-valid", "is-invalid")
    }
  })

  // Last name validation
  lastname.addEventListener("input", () => {
    const isEmpty = lastname.value.trim() === ""
    const isValid = lastname.value.trim().length >= 2

    updateHelpText(lastnameHelp, isValid, isEmpty)

    if (isValid) {
      lastname.classList.remove("is-invalid")
      lastname.classList.add("is-valid")
    } else if (!isEmpty) {
      lastname.classList.remove("is-valid")
      lastname.classList.add("is-invalid")
    } else {
      lastname.classList.remove("is-valid", "is-invalid")
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
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      email.classList.add("is-invalid")
      return
    }

    // Validate username
    const usernameRegex = /^(?=.*[a-zA-Z])(?=.*[0-9_])[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username.value)) {
      username.classList.add("is-invalid")
      return
    }

    // Validate names
    if (firstname.value.trim().length < 2) {
      firstname.classList.add("is-invalid")
      return
    }

    if (lastname.value.trim().length < 2) {
      lastname.classList.add("is-invalid")
      return
    }

    // Validate password
    const passwordValue = password.value
    const isPasswordValid = passwordValue.length >= 6 && /[0-9]/.test(passwordValue)

    if (!isPasswordValid) {
      password.classList.add("is-invalid")
      return
    }

    // Check if passwords match
    if (password.value !== password2.value) {
      password2.classList.add("is-invalid")
      return
    }

    // Check terms
    if (!termsCheck.checked) {
      termsCheck.classList.add("is-invalid")
      return
    }

    document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();  // بمنع انه يرسل الارسال التقليدي

    // جمع البيانات من الفورم
    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        first_name: document.getElementById("firstname").value,
        last_name: document.getElementById("lastname").value,
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Registration successful!");
            window.location.href = "verify-account.html"; //دي الصفحة الي هروحلها بعد التسجيل
        } else {
            console.error("Registration failed:", result);
            alert("❌ Registration failed:\n" + JSON.stringify(result));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ An error occurred while registering. Please try again.");
    }
});

  })
})
