// frontend/kalkulator/script.js
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');
    let currentUser = null;
  
    function redirectToLogin() {
      alert('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
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
  
    // Update username in the header
    const usernameDisplay = document.getElementById('usernameKalkulator');
    if (usernameDisplay && currentUser && currentUser.name) {
      usernameDisplay.textContent = currentUser.name.toUpperCase();
    }
  
    // Logout Functionality
    const logoutButton = document.querySelector('.sidebar .logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        alert('Anda telah logout.');
        window.location.href = '../auth/login.html';
      });
    }
  
    // Basic Client-Side Calculator Example (not connected to backend data yet)
    const calculateButton = document.querySelector('.calculator .calculate');
    const totalPendapatanInput = document.getElementById('totalPendapatanKalkulator');
    const totalPengeluaranInput = document.getElementById('totalPengeluaranKalkulator');
    const sisaAnggaranInput = document.getElementById('sisaAnggaranKalkulator');
  
    // Initialize with some default values or make them editable
    totalPendapatanInput.value = "Rp 4.000.000"; // Example
    totalPengeluaranInput.value = "Rp 2.300.000"; // Example
  
  
    if (calculateButton) {
      calculateButton.addEventListener('click', () => {
        const parseCurrency = (rpString) => {
          if (!rpString) return 0;
          return parseFloat(rpString.replace(/Rp|\.| /g, '').replace(',', '.'));
        };
        const formatCurrency = (amount) => {
          return 'Rp ' + parseFloat(amount || 0).toLocaleString('id-ID');
        };
  
        const pendapatan = parseCurrency(totalPendapatanInput.value);
        const pengeluaran = parseCurrency(totalPengeluaranInput.value);
  
        if (!isNaN(pendapatan) && !isNaN(pengeluaran)) {
          const sisa = pendapatan - pengeluaran;
          sisaAnggaranInput.value = formatCurrency(sisa);
        } else {
          sisaAnggaranInput.value = 'Invalid input';
        }
        alert('Perhitungan selesai (client-side). Nilai sisa anggaran diperbarui.');
      });
    }
  
    // Initial calculation based on default/user-input values
    if (calculateButton) calculateButton.click(); // Perform initial calculation if defaults are set
  
  });