// Admin Dashboard JavaScript - BookNest

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
});

// Initialize dashboard functionality
function initializeDashboard() {
    // Show user management section by default
    showSection('user-management');
    
    // Load initial data
    loadUserData();
    loadCurrencyData();
    
    // Update cart count
    updateCartCount();
}

// Set up event listeners
function setupEventListeners() {
    // Navigation buttons
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            filterUsers(this.value);
        });
    }
    
    const currencySearch = document.getElementById('currencySearch');
    if (currencySearch) {
        currencySearch.addEventListener('input', function() {
            filterCurrencies(this.value);
        });
    }
    
    // User filter
    const userFilter = document.getElementById('userFilter');
    if (userFilter) {
        userFilter.addEventListener('change', function() {
            filterUsersByType(this.value);
        });
    }
    
    // Currency form
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const exchangeRate = document.getElementById('exchangeRate');
    
    if (fromCurrency && toCurrency) {
        fromCurrency.addEventListener('change', calculateExchangeRate);
        toCurrency.addEventListener('change', calculateExchangeRate);
    }
}

// Show specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Load user data (mock data)
function loadUserData() {
    // This would typically fetch from an API
    const userData = [
        {
            id: 'john-doe',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'customer',
            status: 'active',
            joined: '1/15/2023',
            lastLogin: '1/10/2024',
            orders: 8,
            spent: 156.47
        },
        {
            id: 'jane-smith',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'customer',
            status: 'active',
            joined: '2/23/2023',
            lastLogin: '1/9/2024',
            orders: 4,
            spent: 89.32
        },
        {
            id: 'sarah-johnson',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@bookstore.com',
            role: 'manager',
            status: 'active',
            joined: '6/12/2022',
            lastLogin: '1/11/2024',
            orders: 0,
            spent: 0.00
        },
        {
            id: 'mike-wilson',
            name: 'Mike Wilson',
            email: 'mike.wilson@bookstore.com',
            role: 'staff',
            status: 'active',
            joined: '3/15/2023',
            lastLogin: '1/11/2024',
            orders: 0,
            spent: 0.00
        },
        {
            id: 'robert-brown',
            name: 'Robert Brown',
            email: 'robert.brown@example.com',
            role: 'customer',
            status: 'suspended',
            joined: '5/10/2023',
            lastLogin: '12/20/2023',
            orders: 2,
            spent: 45.99
        }
    ];
    
    // Store in global variable for filtering
    window.allUsers = userData;
    window.filteredUsers = userData;
    
    updateUserStats();
}

// Load currency data (mock data)
function loadCurrencyData() {
    const currencyData = [
        {
            id: 'usd',
            code: 'USD',
            name: 'US Dollar',
            symbol: '$',
            status: 'active',
            updated: '1/11/2024, 6:00:00 PM',
            rates: {
                'eur': 0.85,
                'php': 56.5
            }
        },
        {
            id: 'eur',
            code: 'EUR',
            name: 'Euro',
            symbol: '€',
            status: 'active',
            updated: '1/11/2024, 6:00:00 PM',
            rates: {
                'usd': 1.18,
                'php': 66.7
            }
        },
        {
            id: 'php',
            code: 'PHP',
            name: 'Philippine Peso',
            symbol: '₱',
            status: 'active',
            updated: '1/11/2024, 6:00:00 PM',
            rates: {
                'usd': 0.018,
                'eur': 0.015
            }
        }
    ];
    
    window.allCurrencies = currencyData;
    window.filteredCurrencies = currencyData;
    
    updateCurrencyStats();
}

// Update user statistics
function updateUserStats() {
    const totalUsers = window.allUsers.length;
    const activeUsers = window.allUsers.filter(user => user.status === 'active').length;
    const totalRevenue = window.allUsers.reduce((sum, user) => sum + user.spent, 0);
    
    // Update stat cards
    const statCards = document.querySelectorAll('.admin-stats .stat-card');
    if (statCards.length >= 3) {
        statCards[0].querySelector('.stat-number').textContent = totalUsers;
        statCards[1].querySelector('.stat-number').textContent = activeUsers;
        statCards[2].querySelector('.stat-number').textContent = `$${totalRevenue.toFixed(2)}`;
    }
}

// Update currency statistics
function updateCurrencyStats() {
    const activeCurrencies = window.allCurrencies.filter(currency => currency.status === 'active').length;
    
    const statCards = document.querySelectorAll('.admin-stats .stat-card');
    if (statCards.length >= 4) {
        statCards[3].querySelector('.stat-number').textContent = activeCurrencies;
    }
}

// Filter users by search term
function filterUsers(searchTerm) {
    const filtered = window.allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    window.filteredUsers = filtered;
    renderUsers();
}

// Filter users by type
function filterUsersByType(type) {
    let filtered = window.allUsers;
    
    if (type !== 'all') {
        filtered = window.allUsers.filter(user => user.role === type);
    }
    
    window.filteredUsers = filtered;
    renderUsers();
}

// Filter currencies by search term
function filterCurrencies(searchTerm) {
    const filtered = window.allCurrencies.filter(currency => 
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    window.filteredCurrencies = filtered;
    renderCurrencies();
}

// Render users list
function renderUsers() {
    const usersList = document.querySelector('.users-list');
    if (!usersList) return;
    
    usersList.innerHTML = '';
    
    window.filteredUsers.forEach(user => {
        const userItem = createUserItem(user);
        usersList.appendChild(userItem);
    });
}

// Create user item element
function createUserItem(user) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.innerHTML = `
        <div class="user-avatar">${user.name.split(' ').map(n => n[0]).join('')}</div>
        <div class="user-info">
            <div class="user-name">
                ${user.name}
                <span class="user-badge ${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                <span class="status-badge ${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
            </div>
            <div class="user-email">${user.email}</div>
            <div class="user-details">
                <span>Joined: ${user.joined}</span>
            </div>
        </div>
        <div class="user-stats">
            <div class="user-stat">
                <span class="stat-label">Last Login:</span>
                <span class="stat-value">${user.lastLogin}</span>
            </div>
            <div class="user-stat">
                <span class="stat-label">Orders:</span>
                <span class="stat-value">${user.orders}</span>
            </div>
            <div class="user-stat">
                <span class="stat-label">Spent:</span>
                <span class="stat-value">$${user.spent.toFixed(2)}</span>
            </div>
        </div>
        <div class="user-actions">
            <button class="edit-btn" onclick="editUser('${user.id}')">✏️</button>
            <button class="delete-btn" onclick="deleteUser('${user.id}')">🗑️</button>
        </div>
    `;
    
    return userItem;
}

// Render currencies list
function renderCurrencies() {
    const currenciesList = document.querySelector('.currencies-list');
    if (!currenciesList) return;
    
    currenciesList.innerHTML = '';
    
    window.filteredCurrencies.forEach(currency => {
        const currencyItem = createCurrencyItem(currency);
        currenciesList.appendChild(currencyItem);
    });
}

// Create currency item element
function createCurrencyItem(currency) {
    const currencyItem = document.createElement('div');
    currencyItem.className = 'currency-item';
    
    const ratesHtml = Object.entries(currency.rates)
        .map(([code, rate]) => `<div class="rate-item">1 ${currency.code} = ${rate} ${code.toUpperCase()}</div>`)
        .join('');
    
    currencyItem.innerHTML = `
        <div class="currency-symbol">${currency.symbol}</div>
        <div class="currency-info">
            <div class="currency-name">${currency.code} - ${currency.name}</div>
            <div class="currency-updated">Updated: ${currency.updated}</div>
            <div class="currency-rates">
                ${ratesHtml}
            </div>
        </div>
        <div class="currency-status">
            <span class="status-badge ${currency.status}">${currency.status.charAt(0).toUpperCase() + currency.status.slice(1)}</span>
        </div>
        <div class="currency-actions">
            <button class="edit-btn" onclick="editCurrency('${currency.id}')">✏️</button>
            <button class="delete-btn" onclick="deleteCurrency('${currency.id}')">🗑️</button>
        </div>
    `;
    
    return currencyItem;
}

// Calculate exchange rate
function calculateExchangeRate() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const exchangeRateInput = document.getElementById('exchangeRate');
    
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
        const fromCurrencyData = window.allCurrencies.find(c => c.id === fromCurrency);
        if (fromCurrencyData && fromCurrencyData.rates[toCurrency]) {
            exchangeRateInput.value = fromCurrencyData.rates[toCurrency];
        }
    }
}

// ——— Overrides for Add/Edit User modals ———

// Grab all modal elements
const addUserModal      = document.getElementById('addUserModal');
const editUserModal     = document.getElementById('editUserModal');
const addUserCloseBtn   = document.getElementById('addUserCloseBtn');
const addUserCancelBtn  = document.getElementById('addUserCancelBtn');
const addUserSaveBtn    = document.getElementById('addUserSaveBtn');
const editUserCloseBtn  = document.getElementById('editUserCloseBtn');
const editUserCancelBtn = document.getElementById('editUserCancelBtn');
const editUserSaveBtn   = document.getElementById('editUserSaveBtn');

// Form fields
const addFullName = document.getElementById('addFullName');
const addEmail    = document.getElementById('addEmail');
const addRole     = document.getElementById('addRole');
const addStatus   = document.getElementById('addStatus');

const editFullName = document.getElementById('editFullName');
const editEmail    = document.getElementById('editEmail');
const editRole     = document.getElementById('editRole');
const editStatus   = document.getElementById('editStatus');

// Keep track of which user we’re editing
let currentEditingUser = null;

// Show Add User modal
window.openAddUserModal = function() {
  addFullName.value = '';
  addEmail.value    = '';
  addRole.value     = 'customer';
  addStatus.value   = 'active';
  addUserModal.style.display = 'flex';
};

// Show Edit User modal (overrides alert)
window.editUser = function(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;
  currentEditingUser = user;
  editFullName.value = user.name;
  editEmail.value    = user.email;
  editRole.value     = user.role;
  editStatus.value   = user.status;
  editUserModal.style.display = 'flex';
};

// Close helpers
[addUserCloseBtn, addUserCancelBtn].forEach(btn =>
  btn.addEventListener('click', () => addUserModal.style.display = 'none')
);
[editUserCloseBtn, editUserCancelBtn].forEach(btn =>
  btn.addEventListener('click', () => editUserModal.style.display = 'none')
);

// Click‑outside to close
window.addEventListener('click', e => {
  if (e.target === addUserModal)  addUserModal.style.display = 'none';
  if (e.target === editUserModal) editUserModal.style.display = 'none';
});

// Save New User
addUserSaveBtn.addEventListener('click', () => {
  const newUser = {
    id:      addFullName.value.toLowerCase().replace(/\s+/g,'-'),
    name:    addFullName.value.trim(),
    email:   addEmail.value.trim(),
    role:    addRole.value,
    status:  addStatus.value,
    joined:  new Date().toLocaleDateString(),
    lastLogin: '--',
    orders:  0,
    spent:   0.00
  };
  allUsers.push(newUser);
  filteredUsers.push(newUser);
  renderUsers();
  updateUserStats();
  addUserModal.style.display = 'none';
});

// Save Edited User
editUserSaveBtn.addEventListener('click', () => {
  if (!currentEditingUser) return;
  currentEditingUser.name   = editFullName.value.trim();
  currentEditingUser.email  = editEmail.value.trim();
  currentEditingUser.role   = editRole.value;
  currentEditingUser.status = editStatus.value;
  renderUsers();
  updateUserStats();
  editUserModal.style.display = 'none';
});


function deleteUser(userId) {
    const user = window.allUsers.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete user: ${user.name}?`)) {
        window.allUsers = window.allUsers.filter(u => u.id !== userId);
        window.filteredUsers = window.filteredUsers.filter(u => u.id !== userId);
        renderUsers();
        updateUserStats();
    }
}



// ——— Currency Add/Edit Modal Wiring ———

// Modal elements
const addCurrencyModal      = document.getElementById('addCurrencyModal');
const editCurrencyModal     = document.getElementById('editCurrencyModal');
const addCurrencyCloseBtn   = document.getElementById('addCurrencyCloseBtn');
const addCurrencyCancelBtn  = document.getElementById('addCurrencyCancelBtn');
const addCurrencySaveBtn    = document.getElementById('addCurrencySaveBtn');
const editCurrencyCloseBtn  = document.getElementById('editCurrencyCloseBtn');
const editCurrencyCancelBtn = document.getElementById('editCurrencyCancelBtn');
const editCurrencySaveBtn   = document.getElementById('editCurrencySaveBtn');

// Form fields
const currencyCodeInput     = document.getElementById('currencyCode');
const currencyNameInput     = document.getElementById('currencyName');
const currencySymbolInput   = document.getElementById('currencySymbol');
const currencyActiveInput   = document.getElementById('currencyActive');

const editCurrencyNameInput   = document.getElementById('editCurrencyName');
const editCurrencySymbolInput = document.getElementById('editCurrencySymbol');
const editCurrencyActiveInput = document.getElementById('editCurrencyActive');

let currentEditingCurrency = null;

// Override Add‑Currency opener
window.openAddCurrencyModal = function() {
  currencyCodeInput.value   = '';
  currencyNameInput.value   = '';
  currencySymbolInput.value = '';
  currencyActiveInput.checked = true;
  addCurrencyModal.style.display = 'flex';
};
// Override Edit‑Currency opener
window.editCurrency = function(currencyId) {
  const curr = window.allCurrencies.find(c => c.id === currencyId);
  if (!curr) return;
  currentEditingCurrency = curr;

  // Prefill form
  editCurrencyNameInput.value   = curr.name;
  editCurrencySymbolInput.value = curr.symbol;
  editCurrencyActiveInput.checked = (curr.status === 'active');

  editCurrencyModal.style.display = 'flex';
};

// Close & Cancel handlers
[addCurrencyCloseBtn, addCurrencyCancelBtn].forEach(btn =>
  btn.addEventListener('click', () => addCurrencyModal.style.display = 'none')
);
[editCurrencyCloseBtn, editCurrencyCancelBtn].forEach(btn =>
  btn.addEventListener('click', () => editCurrencyModal.style.display = 'none')
);

// Click‑outside to close
window.addEventListener('click', e => {
  if (e.target === addCurrencyModal)  addCurrencyModal.style.display = 'none';
  if (e.target === editCurrencyModal) editCurrencyModal.style.display = 'none';
});

// Save new currency
addCurrencySaveBtn.addEventListener('click', () => {
  // 1) Gather & validate your inputs
  const code   = currencyCodeInput.value.trim().toUpperCase();
  const name   = currencyNameInput.value.trim();
  const symbol = currencySymbolInput.value.trim();
  const status = currencyActiveInput.checked ? 'active' : 'suspended';
  if (!code || !name || !symbol) {
    return alert('All fields are required.');
  }

  // 2) Build your newCurrency object
  const newCurrency = {
    id:      code.toLowerCase(),
    code,
    name,
    symbol,
    status,
    updated: new Date().toLocaleString(),
    rates:   {}
  };

  // 3) **Generate dummy exchange‐rates** against each existing currency
  //    so that your card’s “Exchange Rates” block will show up.
  const existing = [...window.allCurrencies];  
  existing.forEach(c => {
    // pick a random rate between 0.5 and 1.5
    const rate = parseFloat((Math.random() * 1 + 0.5).toFixed(3));
    newCurrency.rates[c.id]     = rate;               // e.g. 1 USD = 0.783 EUR
    c.rates[newCurrency.id]     = parseFloat((1/rate).toFixed(3));
  });

  // 4) Add to your data arrays & re‑render
  window.allCurrencies.push(newCurrency);
  window.filteredCurrencies.push(newCurrency);
  renderCurrencies();
  updateCurrencyStats();

  // 5) Hide the modal
  addCurrencyModal.style.display = 'none';
});


// Save edited currency
editCurrencySaveBtn.addEventListener('click', () => {
  if (!currentEditingCurrency) return;

  currentEditingCurrency.name   = editCurrencyNameInput.value.trim();
  currentEditingCurrency.symbol = editCurrencySymbolInput.value.trim();
  currentEditingCurrency.status = editCurrencyActiveInput.checked ? 'active' : 'suspended';
  currentEditingCurrency.updated = new Date().toLocaleString();

  renderCurrencies();
  updateCurrencyStats();
  editCurrencyModal.style.display = 'none';
});


function deleteCurrency(currencyId) {
    const currency = window.allCurrencies.find(c => c.id === currencyId);
    if (currency && confirm(`Are you sure you want to delete currency: ${currency.name}?`)) {
        window.allCurrencies = window.allCurrencies.filter(c => c.id !== currencyId);
        window.filteredCurrencies = window.filteredCurrencies.filter(c => c.id !== currencyId);
        renderCurrencies();
        updateCurrencyStats();
    }
}



function updateExchangeRate() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const exchangeRate = document.getElementById('exchangeRate').value;
    
    if (fromCurrency && toCurrency && exchangeRate) {
        alert(`Update Exchange Rate\n\nFrom: ${fromCurrency.toUpperCase()}\nTo: ${toCurrency.toUpperCase()}\nRate: ${exchangeRate}\n\nThis would update the exchange rate in the system.`);
        
        // Update the rate in the data
        const fromCurrencyData = window.allCurrencies.find(c => c.id === fromCurrency);
        if (fromCurrencyData) {
            fromCurrencyData.rates[toCurrency] = parseFloat(exchangeRate);
            renderCurrencies();
        }
    } else {
        alert('Please fill in all fields.');
    }
}

function refreshAllRates() {
    alert('Refresh All Rates\n\nThis would refresh all exchange rates from external sources.');
}

function rateChangeAlerts() {
    alert('Rate Change Alerts\n\nThis would configure alerts for significant rate changes.');
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Initialize on page load
window.addEventListener('load', function() {
    // Initial render
    renderUsers();
    renderCurrencies();
});