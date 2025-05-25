// frontend/bills/bills.js
document.addEventListener('DOMContentLoaded', () => {
    // --- SIMULATE AUTH & USER DATA ---
    const SIMULATE_LOGIN = true; // Set to true to simulate being logged in
    let currentUser = { id: 'user-123-simulated', name: 'Robert Grant' }; // Match UI
    const authToken = 'simulated-auth-token';

    if (!SIMULATE_LOGIN) {
        alert('Anda tidak login (simulasi). Mengarahkan ke halaman login.');
        // window.location.href = '../auth/login.html'; // Uncomment if login page exists
        return;
    }

    // --- DOM ELEMENTS ---
    const usernameDisplay = document.querySelector('.profile .username');
    // const profileImage = document.getElementById('profileImage'); // If you use dynamic profile images

    const currentBillsContainer = document.getElementById('currentBillsContainer');
    const upcomingGroupedBillsContainer = document.getElementById('upcomingGroupedBillsContainer');
    
    const notificationBellIcon = document.getElementById('notificationBellIcon');
    const reminderModal = document.getElementById('reminderModal');
    const reminderTextEl = document.getElementById('reminderText');
    const closeReminderModalBtn = document.getElementById('closeReminderModalBtn');
    const gotItReminderBtn = document.getElementById('gotItReminderBtn');

    const openAddBillModalBtn = document.getElementById('openAddBillModalBtn');
    const billFormModal = document.getElementById('billFormModal');
    const closeBillFormModalBtn = document.getElementById('closeBillFormModalBtn');
    const billModalTitle = document.getElementById('billModalTitle');
    const billForm = document.getElementById('billForm');
    const billIdField = document.getElementById('billIdField');
    const billNameField = document.getElementById('billNameField');
    const billAmountField = document.getElementById('billAmountField');
    const billDueDateField = document.getElementById('billDueDateField');
    const billRecurrenceField = document.getElementById('billRecurrenceField');
    const billCategoryField = document.getElementById('billCategoryField');
    const billStatusField = document.getElementById('billStatusField');
    const billReminderDateField = document.getElementById('billReminderDateField');
    const billNotesField = document.getElementById('billNotesField');


    // --- Update UI with user info ---
    if (usernameDisplay && currentUser.name) usernameDisplay.textContent = currentUser.name.toUpperCase();
    // if (profileImage && currentUser.profilePictureUrl) profileImage.src = currentUser.profilePictureUrl;

    // --- LOCAL DATA STORE (SIMULATED DATABASE) ---
    let localBills = [
        { id: 'b001', userId: currentUser.id, name: 'Listrik', amount: 500000, dueDate: '2024-04-20', recurrence: 'monthly', category: 'Utilitas', status: 'unpaid', reminderDate: '2024-04-18', notes: 'Bayar via m-banking', icon: '../assets/lightning_icon.png' },
        { id: 'b002', userId: currentUser.id, name: 'Internet', amount: 300000, dueDate: '2024-04-05', recurrence: 'monthly', category: 'Utilitas', status: 'paid', reminderDate: null, notes: '', icon: '../assets/wifi_icon.png' },
        { id: 'b003', userId: currentUser.id, name: 'Air PDAM', amount: 150000, dueDate: '2024-04-10', recurrence: 'monthly', category: 'Utilitas', status: 'paid', reminderDate: null, notes: '', icon: '../assets/water_drop_icon.png' },
        { id: 'b004', userId: currentUser.id, name: 'Asuransi Jiwa', amount: 100000, dueDate: '2024-05-01', recurrence: 'monthly', category: 'Asuransi', status: 'upcoming', reminderDate: '2024-04-25', notes: '', icon: '../assets/insurance_icon.png' },
        { id: 'b005', userId: currentUser.id, name: 'Telepon Pascabayar', amount: 75000, dueDate: '2024-05-15', recurrence: 'monthly', category: 'Komunikasi', status: 'upcoming', reminderDate: null, notes: '', icon: '../assets/phone_icon.png' },
        { id: 'b006', userId: currentUser.id, name: 'TV Kabel', amount: 180000, dueDate: '2024-05-10', recurrence: 'monthly', category: 'Hiburan', status: 'upcoming', reminderDate: null, notes: '', icon: '../assets/tv_cable_icon.png' },
        { id: 'b007', userId: currentUser.id, name: 'Langganan Streaming', amount: 150000, dueDate: '2024-05-20', recurrence: 'monthly', category: 'Hiburan', status: 'upcoming', reminderDate: null, notes: '', icon: '../assets/streaming_icon.png' },
        { id: 'b008', userId: currentUser.id, name: 'Listrik Bulan Depan', amount: 520000, dueDate: '2024-05-20', recurrence: 'monthly', category: 'Utilitas', status: 'upcoming', reminderDate: '2024-05-18', notes: '', icon: '../assets/lightning_icon.png' },
    ];

    // --- Helper Functions ---
    function formatCurrency(amount) {
        return 'Rp ' + parseFloat(amount || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Changed format
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }
    function getIconPath(category, name) {
        // Simple mapping based on name/category - extend this
        if (name.toLowerCase().includes('listrik')) return '../assets/lightning_icon.png';
        if (name.toLowerCase().includes('internet')) return '../assets/wifi_icon.png';
        if (name.toLowerCase().includes('air')) return '../assets/water_drop_icon.png';
        if (category && category.toLowerCase().includes('asuransi')) return '../assets/insurance_icon.png';
        if (category && category.toLowerCase().includes('telepon')) return '../assets/phone_icon.png';
        if (category && category.toLowerCase().includes('kabel')) return '../assets/tv_cable_icon.png';
        if (category && category.toLowerCase().includes('streaming')) return '../assets/streaming_icon.png';
        return '../assets/default_bill_icon.png';
    }


    // --- Render Functions ---
    function renderCurrentBills() {
        if (!currentBillsContainer) return;
        currentBillsContainer.innerHTML = ''; // Clear
        
        const today = new Date();
        today.setHours(0,0,0,0); // Normalize to start of day

        // Filter for bills due this month or past due & unpaid/overdue
        // Or paid this month for history
        const relevantBills = localBills.filter(bill => {
            const dueDate = new Date(bill.dueDate);
            dueDate.setHours(0,0,0,0);
            const isThisMonth = dueDate.getFullYear() === today.getFullYear() && dueDate.getMonth() === today.getMonth();
            
            return (bill.status !== 'paid' && dueDate <= addMonths(today,1) ) || // Unpaid/Overdue/Upcoming in next month
                   (bill.status === 'paid' && isThisMonth); // Paid this month
        }).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));


        if (relevantBills.length === 0) {
            currentBillsContainer.innerHTML = '<p class="empty-message">Tidak ada tagihan berjalan untuk periode ini.</p>';
            return;
        }

        relevantBills.forEach(bill => {
            const billCard = document.createElement('div');
            billCard.className = 'bill-card';
            billCard.dataset.billId = bill.id;

            let statusText = bill.status.charAt(0).toUpperCase() + bill.status.slice(1);
            if(bill.status === 'unpaid' && new Date(bill.dueDate) < today) {
                statusText = 'Terlambat'; // Overdue
                bill.status = 'overdue'; // Visually update status
            }


            billCard.innerHTML = `
                <div class="bill-icon-wrapper"><img src="${getIconPath(bill.category, bill.name)}" alt="${bill.name}"></div>
                <div class="bill-details">
                    <h4>${bill.name}</h4>
                    <p class="bill-due-date">Jatuh tempo: ${formatDate(bill.dueDate)}</p>
                </div>
                <div class="bill-actions-status">
                    <span class="bill-status ${bill.status}">${statusText}</span>
                    <span class="bill-amount">${formatCurrency(bill.amount)}</span>
                </div>
                <div class="bill-manage-buttons">
                    ${bill.status !== 'paid' ? `<button class="pay-btn" data-id="${bill.id}">Bayar</button>` : ''}
                    <button class="edit-btn" data-id="${bill.id}">Edit</button>
                </div>
            `;
            currentBillsContainer.appendChild(billCard);
        });
    }

    function renderUpcomingGroupedBills() {
        if (!upcomingGroupedBillsContainer) return;
        upcomingGroupedBillsContainer.innerHTML = ''; // Clear

        const today = new Date();
        today.setHours(0,0,0,0);
        const nextMonth = addMonths(today, 1);
        const startOfNextMonth = startOfMonth(nextMonth);
        const endOfTwoMonthsFromNext = endOfMonth(addMonths(nextMonth, 1));


        const upcomingBills = localBills.filter(bill => {
            const dueDate = new Date(bill.dueDate);
            dueDate.setHours(0,0,0,0);
            return bill.status !== 'paid' && 
                   dueDate >= startOfNextMonth && 
                   dueDate <= endOfTwoMonthsFromNext;
        })
        .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4); // Show max 4 as per UI

        if (upcomingBills.length === 0) {
            upcomingGroupedBillsContainer.innerHTML = '<p class="empty-message">Tidak ada tagihan mendatang dalam 2 bulan ke depan.</p>';
            return;
        }

        upcomingBills.forEach(bill => {
            const card = document.createElement('div');
            card.className = 'upcoming-bill-card';
            card.innerHTML = `
                <p class="item-name">${bill.name}</p>
                <p class="item-due">${formatDate(bill.dueDate)}</p>
                <p class="item-amount">${formatCurrency(bill.amount)}</p>
            `;
            upcomingGroupedBillsContainer.appendChild(card);
        });
    }


    // --- Reminder Modal Logic ---
    function checkAndShowReminder() {
        const today = new Date();
        today.setHours(0,0,0,0); // Normalize today
        const reminderThreshold = new Date(today);
        reminderThreshold.setDate(today.getDate() + 7); // Bills due within 7 days

        const billToRemind = localBills.find(b => {
            const dueDate = new Date(b.dueDate);
            dueDate.setHours(0,0,0,0);
            const reminderDate = b.reminderDate ? new Date(b.reminderDate) : null;
            if(reminderDate) reminderDate.setHours(0,0,0,0);

            return (b.status === 'unpaid' || b.status === 'upcoming' || b.status === 'overdue') &&
                   (dueDate <= reminderThreshold || (reminderDate && reminderDate <= today));
        });

        if (billToRemind) {
            reminderTextEl.innerHTML = `Segera bayar tagihan <strong>${billToRemind.name}</strong>-mu, sebesar ${formatCurrency(billToRemind.amount)}<br>yang akan jatuh tempo ${formatDate(billToRemind.dueDate)} !!`;
            reminderModal.style.display = 'flex';
        }
    }
    if (notificationBellIcon) {
        notificationBellIcon.addEventListener('click', checkAndShowReminder);
    }
    if (closeReminderModalBtn) closeReminderModalBtn.addEventListener('click', () => reminderModal.style.display = 'none');
    if (gotItReminderBtn) gotItReminderBtn.addEventListener('click', () => reminderModal.style.display = 'none');


    // --- Bill Form Modal Logic ---
    function openBillFormModal(billToEdit = null) {
        billForm.reset();
        if (billToEdit) {
            billModalTitle.textContent = 'Edit Tagihan';
            billIdField.value = billToEdit.id;
            billNameField.value = billToEdit.name;
            billAmountField.value = billToEdit.amount;
            billDueDateField.value = billToEdit.dueDate; // Assumes YYYY-MM-DD format
            billRecurrenceField.value = billToEdit.recurrence;
            billCategoryField.value = billToEdit.category || '';
            billStatusField.value = billToEdit.status;
            billReminderDateField.value = billToEdit.reminderDate || '';
            billNotesField.value = billToEdit.notes || '';
        } else {
            billModalTitle.textContent = 'Tambah Tagihan Baru';
            billIdField.value = ''; // Clear ID for new bill
            billDueDateField.valueAsDate = new Date(); // Default to today
            billStatusField.value = 'upcoming'; // Default for new
        }
        billFormModal.style.display = 'block';
    }

    if (openAddBillModalBtn) openAddBillModalBtn.addEventListener('click', () => openBillFormModal());
    if (closeBillFormModalBtn) closeBillFormModalBtn.addEventListener('click', () => billFormModal.style.display = 'none');
    window.addEventListener('click', (event) => { // Close if clicked outside modal content
        if (event.target === billFormModal) billFormModal.style.display = 'none';
        if (event.target === reminderModal) reminderModal.style.display = 'none';
    });

    billForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const billData = {
            id: billIdField.value || 'b' + Date.now(), // Generate new ID if not editing
            userId: currentUser.id,
            name: billNameField.value,
            amount: parseFloat(billAmountField.value),
            dueDate: billDueDateField.value,
            recurrence: billRecurrenceField.value,
            category: billCategoryField.value || null,
            status: billStatusField.value,
            reminderDate: billReminderDateField.value || null,
            notes: billNotesField.value || null,
            icon: getIconPath(billCategoryField.value, billNameField.value) // Get icon based on new data
        };

        if (!billData.name || !billData.amount || !billData.dueDate || !billData.recurrence) {
            alert('Nama, Jumlah, Tanggal Jatuh Tempo, dan Frekuensi wajib diisi.');
            return;
        }
        if (billData.amount <= 0) {
            alert('Jumlah harus lebih besar dari 0.');
            return;
        }

        if (billIdField.value) { // Editing existing bill
            const index = localBills.findIndex(b => b.id === billIdField.value);
            if (index !== -1) localBills[index] = { ...localBills[index], ...billData };
        } else { // Adding new bill
            localBills.push(billData);
        }

        billFormModal.style.display = 'none';
        renderCurrentBills();
        renderUpcomingGroupedBills();
        alert(`Tagihan "${billData.name}" berhasil ${billIdField.value ? 'diperbarui' : 'ditambahkan'} (simulasi).`);
    });

    // Event delegation for Pay and Edit buttons on current bills
    currentBillsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const billId = target.dataset.id;

        if (!billId) return;

        if (target.classList.contains('pay-btn')) {
            const billIndex = localBills.findIndex(b => b.id === billId);
            if (billIndex !== -1 && localBills[billIndex].status !== 'paid') {
                localBills[billIndex].status = 'paid';
                // Simulate creating an expense transaction
                console.log(`Simulating expense transaction for paying bill: ${localBills[billIndex].name}`);
                alert(`Tagihan "${localBills[billIndex].name}" ditandai sebagai LUNAS (simulasi).`);
                renderCurrentBills(); // Re-render to update status display
            }
        } else if (target.classList.contains('edit-btn')) {
            const billToEdit = localBills.find(b => b.id === billId);
            if (billToEdit) {
                openBillFormModal(billToEdit);
            }
        }
    });

    // --- SIMULATED Logout ---
    const logoutButton = document.querySelector('.sidebar .logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Anda telah logout (simulasi).');
            // For real app:
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userData');
            // window.location.href = '../auth/login.html';
        });
    }

    // --- Initial Render ---
    renderCurrentBills();
    renderUpcomingGroupedBills();
    // setTimeout(checkAndShowReminder, 2000); // Show reminder after a slight delay on page load if applicable
});