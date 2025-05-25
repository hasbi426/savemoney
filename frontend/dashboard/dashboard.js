// frontend/dashboard/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    // --- SIMULATE AUTH & USER DATA ---
    // In a real app, this comes from login and localStorage
    const SIMULATE_LOGIN = true; // Set to true to simulate being logged in
    let currentUser = {
      id: 'user-123-simulated',
      name: 'Test User',
      email: 'test@example.com'
    };
    const authToken = 'simulated-auth-token'; // Not used for fetching, but part of the pattern
  
    // --- Authentication Check (Simulated) ---
    if (!SIMULATE_LOGIN) {
      alert('You are not logged in (simulation). Redirecting to login page.');
      // In a real scenario with a login page:
      // window.location.href = '../auth/login.html';
      return;
    }
  
    // --- DOM Elements ---
    const usernameDisplay = document.querySelector('.profile .username');
    // const profileImage = document.getElementById('profileImage'); // If you had one
  
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpensesEl = document.getElementById('totalExpenses');
    const netSavingsEl = document.getElementById('netSavings');
    const recentTransactionsListEl = document.getElementById('recentTransactionsList');
    const periodSelectEl = document.getElementById('periodSelect');
    const expenseChartCanvas = document.getElementById('expenseChart');
    const chartBox = document.querySelector('.chart-box');
    let expenseChartInstance = null;
  
    const modal = document.getElementById('addTransactionModal');
    const addIncomeBtn = document.getElementById('addIncomeBtn');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const transactionForm = document.getElementById('transactionForm');
    const modalTitle = document.getElementById('modalTitle');
    const transactionTypeField = document.getElementById('transactionTypeField');
    const descriptionField = document.getElementById('descriptionField');
    const amountField = document.getElementById('amountField');
    const dateField = document.getElementById('dateField');
    const categoryField = document.getElementById('categoryField');
  
    // --- LOCAL DATA STORE (SIMULATED DATABASE) ---
    let localTransactions = [
      { id: 'tx1', userId: 'user-123-simulated', description: 'Gaji Bulanan', amount: 5000000, type: 'income', date: '2024-03-01', category: 'Gaji', createdAt: new Date().toISOString() },
      { id: 'tx2', userId: 'user-123-simulated', description: 'Belanja Bulanan', amount: 1200000, type: 'expense', date: '2024-03-05', category: 'Kebutuhan Pokok', createdAt: new Date().toISOString() },
      { id: 'tx3', userId: 'user-123-simulated', description: 'Makan Siang', amount: 50000, type: 'expense', date: '2024-03-10', category: 'Makanan', createdAt: new Date().toISOString() },
      { id: 'tx4', userId: 'user-123-simulated', description: 'Transportasi', amount: 200000, type: 'expense', date: '2024-03-12', category: 'Transportasi', createdAt: new Date().toISOString() },
      { id: 'tx5', userId: 'user-123-simulated', description: 'Bonus Proyek', amount: 1000000, type: 'income', date: '2024-03-15', category: 'Bonus', createdAt: new Date().toISOString() },
      { id: 'tx6', userId: 'user-123-simulated', description: 'Nonton Bioskop', amount: 150000, type: 'expense', date: '2024-03-18', category: 'Hiburan', createdAt: new Date().toISOString() },
    ];
  
  
    // --- Update UI with user info (Simulated) ---
    if (usernameDisplay && currentUser.name) usernameDisplay.textContent = currentUser.name.toUpperCase();
    // if (profileImage && currentUser.profilePictureUrl) profileImage.src = currentUser.profilePictureUrl;
  
    // --- Helper Functions (Remain the same) ---
    function formatCurrency(amount) {
      return 'Rp ' + parseFloat(amount || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    }
  
    // --- Chart Rendering (Remains the same, uses data passed to it) ---
    function renderExpenseChart(expensesByCategory) {
      if (!expenseChartCanvas) return;
      const ctx = expenseChartCanvas.getContext('2d');
      if (expenseChartInstance) {
          expenseChartInstance.destroy();
      }
      if (!expensesByCategory || expensesByCategory.length === 0) {
          chartBox.innerHTML = '<h3>Pengeluaran per Kategori</h3><p style="text-align:center;">Belum ada data pengeluaran untuk ditampilkan.</p><canvas id="expenseChart" style="display:none;"></canvas>';
          return;
      }
      expenseChartCanvas.style.display = 'block'; // Ensure canvas is visible
  
      const labels = expensesByCategory.map(item => item.category);
      const data = expensesByCategory.map(item => item.total_amount);
      const backgroundColors = data.map((_, index) => `hsl(${(index * 360 / data.length + 45) % 360}, 70%, 60%)`);
  
  
      expenseChartInstance = new Chart(ctx, {
        type: 'pie',
        data: { labels: labels, datasets: [{ label: 'Expenses by Category', data: data, backgroundColor: backgroundColors, borderWidth: 1 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: (c) => `${c.label}: ${formatCurrency(c.parsed)}` } } }
        }
      });
    }
  
    // --- SIMULATED Fetch and Display Dashboard Data ---
    function fetchDashboardData(period = 'month') {
      // Simulate filtering by period
      const now = new Date();
      let startDate, endDate;
  
      if (period === 'month') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'year') {
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
      } else if (period === 'week') {
          const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1) )); // Monday
          startDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate());
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // Sunday
      }
      
      // Filter localTransactions based on the period
      const filteredTransactions = localTransactions.filter(tx => {
          const txDate = new Date(tx.date);
          // Adjust txDate to midnight to avoid time zone issues with comparison
          const normalizedTxDate = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
          return normalizedTxDate >= startDate && normalizedTxDate <= endDate;
      });
  
  
      let totalIncome = 0;
      let totalExpenses = 0;
      const expensesByCategoryMap = {};
  
      filteredTransactions.forEach(tx => {
        if (tx.type === 'income') {
          totalIncome += tx.amount;
        } else if (tx.type === 'expense') {
          totalExpenses += tx.amount;
          const category = tx.category || 'Uncategorized';
          expensesByCategoryMap[category] = (expensesByCategoryMap[category] || 0) + tx.amount;
        }
      });
  
      const expensesByCategory = Object.entries(expensesByCategoryMap)
          .map(([category, total_amount]) => ({ category, total_amount }))
          .sort((a, b) => b.total_amount - a.total_amount);
  
      const recentTransactions = [...localTransactions] // Create a copy to sort
          .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date then by creation
          .slice(0, 5);
  
      // Update DOM
      totalIncomeEl.textContent = formatCurrency(totalIncome);
      totalExpensesEl.textContent = formatCurrency(totalExpenses);
      netSavingsEl.textContent = formatCurrency(totalIncome - totalExpenses);
  
      recentTransactionsListEl.innerHTML = '';
      if (recentTransactions.length > 0) {
        recentTransactions.forEach(tx => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span class="transaction-desc">${tx.description} (${formatDate(tx.date)})</span>
            <span class="transaction-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}</span>
          `;
          recentTransactionsListEl.appendChild(li);
        });
      } else {
        recentTransactionsListEl.innerHTML = '<li>Belum ada transaksi terkini.</li>';
      }
  
      renderExpenseChart(expensesByCategory);
    }
  
  
    // --- Event Listeners (Remain mostly the same, but transactionForm submit is simulated) ---
    periodSelectEl.addEventListener('change', (e) => {
      fetchDashboardData(e.target.value);
    });
  
    function openModal(type) {
      transactionTypeField.value = type;
      modalTitle.textContent = type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran';
      transactionForm.reset();
      dateField.valueAsDate = new Date();
      modal.style.display = 'block';
    }
    function closeModal() {
      modal.style.display = 'none';
    }
  
    addIncomeBtn.onclick = () => openModal('income');
    addExpenseBtn.onclick = () => openModal('expense');
    closeModalBtn.onclick = closeModal;
    window.onclick = (event) => {
      if (event.target == modal) closeModal();
    };
  
    // SIMULATED Transaction form submission
    transactionForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const newTransaction = {
        id: 'tx' + (localTransactions.length + 1) + '-' + Date.now(), // Simple unique ID
        userId: currentUser.id,
        description: descriptionField.value,
        amount: parseFloat(amountField.value),
        type: transactionTypeField.value,
        date: dateField.value,
        category: categoryField.value || null,
        createdAt: new Date().toISOString()
      };
  
      if (!newTransaction.description || !newTransaction.amount || !newTransaction.type || !newTransaction.date) {
          alert("Mohon lengkapi semua field yang wajib diisi (Deskripsi, Jumlah, Tanggal, Tipe).");
          return;
      }
      if (newTransaction.amount <= 0) {
          alert("Jumlah transaksi harus lebih besar dari 0.");
          return;
      }
  
      console.log('Adding new transaction (simulated):', newTransaction);
      localTransactions.push(newTransaction); // Add to our local array
  
      closeModal();
      fetchDashboardData(periodSelectEl.value); // Refresh dashboard data from local store
      alert('Transaksi berhasil ditambahkan (simulasi)!');
    });
  
    // SIMULATED Logout
    const logoutButton = document.querySelector('.sidebar .logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        // In a real app, clear localStorage and redirect
        alert('Anda telah logout (simulasi).');
        // window.location.href = '../auth/login.html'; // If you had a login page
      });
    }
  
    // --- Initial Load ---
    fetchDashboardData(); // Load data for the default period
  });