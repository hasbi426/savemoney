// frontend/auth/script.js
document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const messageDiv = document.getElementById('message');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  // Toggle password visibility
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault(); // Prevent default form submission

      const name = document.getElementById('name').value;
      const birthday = document.getElementById('birthday').value;
      const email = document.getElementById('email').value;
      const password = passwordInput.value;

      messageDiv.textContent = ''; // Clear previous messages
      messageDiv.style.color = 'red'; // Default to error color

      // Basic frontend validation (optional, backend has more robust validation)
      if (!name || !birthday || !email || !password) {
        messageDiv.textContent = 'All fields are required.';
        return;
      }
      if (password.length < 6) {
        messageDiv.textContent = 'Password must be at least 6 characters long.';
        return;
      }

      const userData = {
        name,
        birthday,
        email,
        password,
      };

      try {
        // --- IMPORTANT: Adjust this URL if your backend runs on a different port ---
        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) { // Status 200-299
          messageDiv.textContent = data.message || 'Registration successful! Redirecting...';
          messageDiv.style.color = 'green';
          signupForm.reset(); // Clear the form
          // Optionally redirect to a login page or dashboard
          // setTimeout(() => {
          //   window.location.href = '/login.html'; // Or your login page
          // }, 2000);
        } else {
          // Handle errors (e.g., validation errors, email already exists)
          if (data.errors && Array.isArray(data.errors)) {
            messageDiv.textContent = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          } else {
            messageDiv.textContent = data.message || `Error: ${response.status}`;
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        messageDiv.textContent = 'An unexpected error occurred. Please try again.';
      }
    });
  }
});