document.addEventListener('DOMContentLoaded', () => {
  // Extract verification parameters from URL
  // Example URL: verify-account.html/[uidb64]/[token]
  const url = window.location.href;
  const urlParts = url.split('verify-account.html/');
  
  let uidb64 = null;
  let token = null;
  
  // Parse URL to extract verification tokens if they exist
  if (urlParts.length > 1) {
    const params = urlParts[1].split('/');
    if (params.length >= 2) {
      uidb64 = params[0];
      token = params[1];
    }
  }

  // Select all UI elements that will be updated during verification
  const icon = document.querySelector('.fa-circle-notch');
  const title = document.querySelector('.card-title');
  const message = document.querySelector('.card-text');
  const button = document.querySelector('.btn');
  const headerIcon = document.querySelector('.page-header i');
  const headerText = document.querySelector('.page-header h1');

  console.log('URL:', url);
  console.log('UID:', uidb64);
  console.log('Token:', token);

  // Only attempt verification if we have valid tokens
  if (uidb64 && token) {
    // Send verification request to backend API
    fetch(`http://127.0.0.1:8000/api/users/verify-email/${uidb64}/${token}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.message && data.message.includes("successfully")) {
        // Update UI for successful verification
        icon.classList.remove('fa-circle-notch', 'fa-spin', 'text-primary');
        icon.classList.add('fa-check-circle', 'text-success');

        title.textContent = 'Account Verified Successfully!';
        title.style.color = '#198754'; // Bootstrap success color
        message.textContent = 'Your email has been successfully verified. You can now log in to your account and enjoy our premium cinema services.';
        
        // Update button to redirect to login page
        button.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login to Account';
        button.href = 'login.html';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');

        // Update header to show success state
        if (headerIcon && headerText) {
          headerIcon.classList.remove('fa-circle-notch', 'fa-spin');
          headerIcon.classList.add('fa-check-circle');
          headerText.innerHTML = '<i class="fas fa-check-circle me-2"></i>Account Verification';
        }
      } else {
        // Show error UI if verification failed
        showError("Sorry, email verification failed. Please try again or request a new verification link.");
      }
    })
    .catch(error => {
      console.error('Verification error:', error);
      showError("Connection error. Please try again later.");
    });
  } else {
    // Show instructions if user visits page directly without verification tokens
    showError(`
      <div style="text-align: left; padding: 15px;">
        <h5 style="color: #0d6efd; margin-bottom: 15px;">Please follow these steps to verify your account:</h5>
        
        <ol style="list-style-type: decimal; padding-left: 20px; margin-bottom: 20px;">
          <li style="margin-bottom: 10px;">Open your email inbox</li>
          <li style="margin-bottom: 10px;">Look for a verification email from Online Cinema</li>
          <li style="margin-bottom: 10px;">Click the verification link in the email</li>
        </ol>

        <div style="color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
          If you haven't received the verification email, you can request a new one using the button below.
        </div>
      </div>
    `);
  }

  /**
   * Updates the UI to show error state with custom message
   * @param {string} errorMessage - The error message to display
   */
  function showError(errorMessage) {
    // Update icon to show error state
    icon.classList.remove('fa-circle-notch', 'fa-spin', 'text-primary');
    icon.classList.add('fa-times-circle', 'text-danger');

    // Update title and message
    title.textContent = 'Email Verification';
    title.style.color = '#dc3545'; // Bootstrap danger color
    message.innerHTML = errorMessage;

    // Update button to request new verification link
    button.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Request New Verification Link';
    button.href = 'resend-verification.html';
    button.classList.remove('btn-primary');
    button.classList.add('btn-danger');

    // Update header to show verification pending state
    if (headerIcon && headerText) {
      headerIcon.classList.remove('fa-circle-notch', 'fa-spin');
      headerIcon.classList.add('fa-envelope');
      headerText.innerHTML = '<i class="fas fa-envelope me-2"></i>Email Verification';
    }
  }
});
