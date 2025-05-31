document.addEventListener("DOMContentLoaded", () => {
    // Common function to show alert messages
    function showAlert(message, type = "success") {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
                <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        const form = document.querySelector("form");
        form.insertAdjacentHTML("beforebegin", alertHTML);
    }

    // Check which form is present on the page
    const resetForm = document.getElementById("resetPasswordForm");
    const newPasswordForm = document.getElementById("newPasswordForm");

    if (resetForm) {
        // Reset Password Request Form
        const email = document.getElementById("email");
        const emailHelp = document.getElementById("emailHelp");

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

        // Form submission for reset request
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailValue = email.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                showAlert("Please enter a valid email address.", "danger");
                email.classList.add("is-invalid");
                return;
            }

            const submitButton = resetForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending Reset Link...';
            submitButton.disabled = true;

            try {
                const response = await fetch("http://localhost:8000/api/users/password-reset/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ email: emailValue })
                });

                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    throw new Error("Server response was not in JSON format");
                }

                if (response.ok) {
                    showAlert("Password reset link has been sent to your email. Please check your inbox (including spam folder).", "success");
                    resetForm.reset();
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 3000);
                } else {
                    if (data.error) {
                        showAlert(data.error, "danger");
                    } else if (response.status === 404) {
                        showAlert("Email address not found. Please check the email or register a new account.", "danger");
                    } else if (response.status === 400) {
                        showAlert("Please enter a valid email address.", "danger");
                    } else if (response.status === 500) {
                        showAlert("Server error. Please try again later.", "danger");
                    } else {
                        showAlert("Failed to send reset link. Please try again.", "danger");
                    }
                }
            } catch (error) {
                console.error("Reset password error:", error);
                if (error.message === "Server response was not in JSON format") {
                    showAlert("Unexpected server response. Please try again later.", "danger");
                } else if (!navigator.onLine) {
                    showAlert("Please check your internet connection and try again.", "danger");
                } else {
                    showAlert("Unable to connect to the server. Please try again later.", "danger");
                }
            } finally {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }

    if (newPasswordForm) {
        // New Password Form
        const newPassword = document.getElementById("new_password");
        const confirmPassword = document.getElementById("confirm_password");
        const lengthCheck = document.getElementById("length-check");
        const numberCheck = document.getElementById("number-check");

        // Get token and uidb64 from URL path
        const pathParts = window.location.pathname.split('/');
        const uidb64 = pathParts[pathParts.length - 2];
        const resetToken = pathParts[pathParts.length - 1];

        if (!resetToken || !uidb64) {
            showAlert("Invalid password reset link. Please request a new one.", "danger");
            setTimeout(() => {
                window.location.href = "reset-password.html";
            }, 3000);
            return;
        }

        // Password validation
        function validatePassword(password) {
            const isLongEnough = password.length >= 6;
            const hasNumber = /\d/.test(password);
            
            lengthCheck.querySelector('.fas').className = 
                `fas ${isLongEnough ? 'fa-check text-success' : 'fa-circle'} help-icon`;
            numberCheck.querySelector('.fas').className = 
                `fas ${hasNumber ? 'fa-check text-success' : 'fa-circle'} help-icon`;

            return isLongEnough && hasNumber;
        }

        // Real-time validation for new password
        newPassword.addEventListener("input", () => {
            const isValid = validatePassword(newPassword.value);
            if (isValid) {
                newPassword.classList.remove("is-invalid");
                newPassword.classList.add("is-valid");
            } else {
                newPassword.classList.remove("is-valid");
                newPassword.classList.add("is-invalid");
            }

            // Check confirm password match if it has a value
            if (confirmPassword.value) {
                if (confirmPassword.value === newPassword.value) {
                    confirmPassword.classList.remove("is-invalid");
                    confirmPassword.classList.add("is-valid");
                } else {
                    confirmPassword.classList.remove("is-valid");
                    confirmPassword.classList.add("is-invalid");
                }
            }
        });

        // Real-time validation for confirm password
        confirmPassword.addEventListener("input", () => {
            if (confirmPassword.value === newPassword.value) {
                confirmPassword.classList.remove("is-invalid");
                confirmPassword.classList.add("is-valid");
            } else {
                confirmPassword.classList.remove("is-valid");
                confirmPassword.classList.add("is-invalid");
            }
        });

        // Form submission for new password
        newPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!validatePassword(newPassword.value)) {
                showAlert("Password must be at least 6 characters long and contain at least one number.", "danger");
                newPassword.classList.add("is-invalid");
                return;
            }

            if (newPassword.value !== confirmPassword.value) {
                showAlert("Passwords do not match.", "danger");
                confirmPassword.classList.add("is-invalid");
                return;
            }

            const submitButton = newPasswordForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Resetting Password...';
            submitButton.disabled = true;

            try {
                const response = await fetch(`http://localhost:8000/api/users/password-reset/confirm/${uidb64}/${resetToken}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        new_password: newPassword.value,
                        confirm_password: confirmPassword.value
                    })
                });

                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    throw new Error("Server response was not in JSON format");
                }

                if (response.ok) {
                    showAlert("Password reset successful! Redirecting to login...", "success");
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    if (data.error) {
                        showAlert(data.error, "danger");
                        if (data.error.includes("Invalid") || data.error.includes("expired")) {
                            setTimeout(() => {
                                window.location.href = "reset-password.html";
                            }, 3000);
                        }
                    } else if (response.status === 400) {
                        showAlert("Invalid or expired reset link. Please request a new one.", "danger");
                        setTimeout(() => {
                            window.location.href = "reset-password.html";
                        }, 3000);
                    } else {
                        showAlert("Failed to reset password. Please try again.", "danger");
                    }
                }
            } catch (error) {
                console.error("Password reset error:", error);
                if (error.message === "Server response was not in JSON format") {
                    showAlert("Unexpected server response. Please try again later.", "danger");
                } else if (!navigator.onLine) {
                    showAlert("Please check your internet connection and try again.", "danger");
                } else {
                    showAlert("Unable to connect to the server. Please try again later.", "danger");
                }
            } finally {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
}); 