// frontend/auth/loginScript.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('messageLogin');
    const togglePassword = document.getElementById('togglePasswordLogin');
    const passwordInput = document.getElementById('password');
  
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
      });
    }
  
    if (loginForm) {
      loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
  
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
  
        messageDiv.textContent = '';
        messageDiv.style.color = 'red';
  
        if (!email || !password) {
          messageDiv.textContent = 'Email and password are required.';
          return;
        }
  
        const loginData = { email, password };
  
        try {
          // Ensure this matches your backend server address and port
          const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            messageDiv.textContent = data.message || 'Login successful! Redirecting...';
            messageDiv.style.color = 'green';
  
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
  
            setTimeout(() => {
              window.location.href = '../dashboard/index.html'; // Redirect to dashboard
            }, 1500);
  
          } else {
            messageDiv.textContent = data.message || `Error: ${response.status}`;
          }
        } catch (error) {
          console.error('Login error:', error);
          messageDiv.textContent = 'An unexpected error occurred. Please try again.';
        }
      });
    }
  });