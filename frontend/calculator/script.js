// frontend/calculator/script.js
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');
    let currentUser = null;
  
    function redirectToLogin() {
      alert('Your session is invalid or has expired. Please log in again.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '../auth/login.html';
    }
  
    if (userDataString) {
      try {
        currentUser = JSON.parse(userDataString);
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        redirectToLogin();
        return;
      }
    }
  
    if (!authToken || !currentUser) {
      redirectToLogin();
      return;
    }
  
    const usernameDisplay = document.getElementById('usernameCalculator');
    if (usernameDisplay && currentUser && currentUser.name) {
      usernameDisplay.textContent = currentUser.name.toUpperCase();
    }
    // const profileImageDisplay = document.getElementById('profileImageCalculator');
    // if (profileImageDisplay && currentUser && currentUser.profilePictureUrl) { // If you add profile pics
    //   profileImageDisplay.src = currentUser.profilePictureUrl;
    // }
  
    const logoutButton = document.querySelector('.sidebar .logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        redirectToLogin('You have been logged out.');
      });
    }
  
    const calculateButton = document.querySelector('.calculator-section .calculate-btn');
    const totalIncomeInput = document.getElementById('totalIncomeCalculator');
    const totalExpensesInput = document.getElementById('totalExpensesCalculator');
    const remainingBudgetInput = document.getElementById('remainingBudgetCalculator');
  
    // Initialize with some default values or make them editable
    totalIncomeInput.value = "Rp 4.000.000"; // Example
    totalExpensesInput.value = "Rp 2.300.000"; // Example
  
    function performCalculation() {
      const parseCurrency = (rpString) => {
        if (typeof rpString !== 'string') return 0;
        return parseFloat(rpString.replace(/Rp|\.| /g, '').replace(',', '.'));
      };
      const formatCurrency = (amount) => {
        return 'Rp ' + parseFloat(amount || 0).toLocaleString('id-ID', {minimumFractionDigits: 0, maximumFractionDigits: 0});
      };
  
      const income = parseCurrency(totalIncomeInput.value);
      const expenses = parseCurrency(totalExpensesInput.value);
  
      if (!isNaN(income) && !isNaN(expenses)) {
        const remaining = income - expenses;
        remainingBudgetInput.value = formatCurrency(remaining);
      } else {
        remainingBudgetInput.value = 'Invalid input';
      }
    }
  
    if (calculateButton) {
      calculateButton.addEventListener('click', () => {
          performCalculation();
          // alert('Calculation complete (client-side). Remaining budget updated.');
      });
    }
    
    // Add event listeners to recalculate if income/expenses change
    totalIncomeInput.addEventListener('input', performCalculation);
    totalExpensesInput.addEventListener('input', performCalculation);
  
  
    // Initial calculation based on default values
    performCalculation();
  });