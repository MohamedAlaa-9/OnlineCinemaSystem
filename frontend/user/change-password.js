document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const form = document.getElementById("changePasswordForm");
    const oldPassword = document.getElementById("old_password");
    const newPassword = document.getElementById("new_password");
    const confirmPassword = document.getElementById("confirm_password");
    const lengthCheck = document.getElementById("length-check");
    const numberCheck = document.getElementById("number-check");

    // Function to show alert messages
    function showAlert(message, type = "success") {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
                <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        form.insertAdjacentHTML("beforebegin", alertHTML);
    }

    // Password validation
    function validatePassword(password) {
        const isLongEnough = password.length >= 6;
        const hasNumber = /\d/.test(password);
        
        // Update requirement indicators
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
    });

    // Real-time validation for confirm password
    confirmPassword.addEventListener("input", () => {
        const matches = confirmPassword.value === newPassword.value;
        if (matches && confirmPassword.value !== "") {
            confirmPassword.classList.remove("is-invalid");
            confirmPassword.classList.add("is-valid");
        } else {
            confirmPassword.classList.remove("is-valid");
            confirmPassword.classList.add("is-invalid");
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validate all fields
        if (!oldPassword.value) {
            oldPassword.classList.add("is-invalid");
            return;
        }

        if (!validatePassword(newPassword.value)) {
            newPassword.classList.add("is-invalid");
            return;
        }

        if (newPassword.value !== confirmPassword.value) {
            confirmPassword.classList.add("is-invalid");
            return;
        }

        // Prepare the request
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Changing Password...';
        submitButton.disabled = true;

        try {
            const response = await fetch("http://127.0.0.1:8000/api/users/change-password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: oldPassword.value,
                    new_password: newPassword.value,
                    confirm_password: confirmPassword.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert("Password changed successfully! Redirecting to profile...");
                setTimeout(() => {
                    window.location.href = "profile.html";
                }, 2000);
            } else {
                showAlert(data.error || "Failed to change password. Please try again.", "danger");
            }
        } catch (error) {
            console.error("Change password error:", error);
            showAlert("Network error. Please try again.", "danger");
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
}); 