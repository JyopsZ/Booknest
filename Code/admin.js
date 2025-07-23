// Admin Dashboard JavaScript - BookNest

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

/*
// Initialize dashboard functionality
function initializeDashboard() {
    // Show user management section by default
    showSection('user-management');
    
    // Load initial data
    loadUserData();
    loadCurrencyData();
    
    // Update cart count
    updateCartCount();
}*/

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
    //window.allUsers = userData;
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

/*
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
}*/

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
            <button class="edit-btn" onclick="editUser(${user.user_id})">✏️</button>  
            <button class="delete-btn" onclick="deleteUser(${user.user_id})">🗑️</button> 
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
const addFullNameInput = document.getElementById('addFullName');
const addEmailInput = document.getElementById('addEmail');
const addPhoneNumInput = document.getElementById('addPhoneNum');
const addPasswordInput = document.getElementById('addPassword');
const addRoleSelect = document.getElementById('addRole');

const editFullName = document.getElementById('editFullName');
const editEmail    = document.getElementById('editEmail');
const editRole     = document.getElementById('editRole');

// Keep track of which user we’re editing
let currentEditingUser = null;

// Show Add User modal
window.openAddUserModal = function() {
  addFullNameInput.value = '';
  addEmailInput.value = '';
  addPhoneNumInput.value = '';
  addPasswordInput.value = '';
  addRoleSelect.value = 'customer';

  // Show the modal
  addUserModal.style.display = 'flex';
};

/*
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
);*/

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
const currencySymbolInput   = document.getElementById('currencySymbol');

const editCurrencySymbolInput = document.getElementById('editCurrencySymbol');


let currentEditingCurrency = null;

// Override Add‑Currency opener
window.openAddCurrencyModal = function() {
  currencyCodeInput.value   = '';
  currencySymbolInput.value = '';
  addCurrencyModal.style.display = 'flex';
};
/*
// Override Edit‑Currency opener
window.editCurrency = function(currency_id) {
  const curr = window.allCurrencies.find(c => c.id === currency_id);
  if (!curr) return;
  currentEditingCurrency = curr;

  // Prefill form
  editCurrencyNameInput.value   = curr.name;
  editCurrencySymbolInput.value = curr.symbol;
  editCurrencyActiveInput.checked = (curr.status === 'active');

  editCurrencyModal.style.display = 'flex';
};*/

/*
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
});*/

// Save new currency
addCurrencySaveBtn.addEventListener('click', () => {
  // 1) Gather & validate your inputs
  const code   = currencyCodeInput.value.trim().toUpperCase();
  const symbol = currencySymbolInput.value.trim();
  if (!code || !symbol) {
    return alert('All fields are required.');
  }

  // 2) Build your newCurrency object
  const newCurrency = {
    id:      code.toLowerCase(),
    code,
    symbol,
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

  currentEditingCurrency.symbol = editCurrencySymbolInput.value.trim();

  currentEditingCurrency.updated = new Date().toLocaleString();

  renderCurrencies();
  updateCurrencyStats();
  editCurrencyModal.style.display = 'none';
});


function deleteCurrency(currency_id) {
    const currency = window.allCurrencies.find(c => c.id === currency_id);
    if (currency && confirm(`Are you sure you want to delete currency: ${currency.name}?`)) {
        window.allCurrencies = window.allCurrencies.filter(c => c.id !== currency_id);
        window.filteredCurrencies = window.filteredCurrencies.filter(c => c.id !== currency_id);
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

// for display current user on admin page
document.addEventListener('DOMContentLoaded', function() {
  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem('booknest-user'));

  if (user) {
    // Dynamically update the admin name and role
    document.querySelector('.admin-user-name').textContent = user.display_name;
    document.querySelector('.admin-user-role').textContent = user.role;
  } else {
    console.log('No user data found in localStorage.');
  }
});

// Delete logic for admin
async function deleteUser(userId) {
  try {
    // Send a DELETE request to the backend
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',  // Use DELETE method
    });

    const result = await response.json();
    console.log(result.message);  // Log the success message (optional)

    // Re-fetch the users to refresh the list
    fetchAndRenderUsers();  // Call the function to reload the user list

  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Add this logic to the Delete button in your HTML
function addDeleteButtonLogic() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const userId = event.target.dataset.userId;  // Get the userId from the button data attribute
      deleteUser(userId);  // Call the delete function
    });
  });
}

// Update your render function to add the userId as data attribute to the Delete button
async function fetchAndRenderUsers() {
  try {
    const userSearch = document.getElementById('userSearch').value;
    const userFilter = document.getElementById('userFilter').value;

    const response = await fetch(`/api/admin/users?searchTerm=${userSearch}&roleFilter=${userFilter}`);
    const users = await response.json();

    const userList = document.querySelector('.users-list');
    userList.innerHTML = '';

    users.forEach(user => {
      const initials = user.display_name ? user.display_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A';
      const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
      const orders = user.total_orders ?? 0;
      const spentInPHP = user.total_spent ? `₱${parseFloat(user.total_spent).toFixed(2)}` : '₱0.00';

      const userHTML = `
        <div class="user-item">
          <div class="user-avatar">${initials}</div>
          <div class="user-info">
            <div class="user-name">
              ${user.display_name || 'Unknown'}
              <span class="user-badge ${user.role}">${user.role}</span>
            </div>
            <div class="user-email">${user.email}</div>
            <div class="user-details">
              <span>Joined: ${joinedDate}</span>
            </div>
          </div>
          <div class="user-stats">
            <div class="user-stat">
              <span class="stat-label">Orders:</span>
              <span class="stat-value">${orders}</span>
            </div>
            <div class="user-stat">
              <span class="stat-label">Spent:</span>
              <span class="stat-value">${spentInPHP}</span>
            </div>
          </div>
          <div class="user-actions">
            <button class="edit-btn" onclick="editUser('${user.user_id}')">✏️</button>
            <button class="delete-btn" data-user-id="${user.user_id}">🗑️</button> 
          </div>
        </div>
      `;

      userList.insertAdjacentHTML('beforeend', userHTML);
    });

    addDeleteButtonLogic();  

  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Close the Add User Modal when Cancel button is clicked
addUserCancelBtn.addEventListener('click', () => {
  addUserModal.style.display = 'none';  // Hide the modal
});

// Close the Add User Modal when Close button is clicked
addUserCloseBtn.addEventListener('click', () => {
  addUserModal.style.display = 'none';  // Hide the modal
});

// Save the new user when Save button is clicked
addUserSaveBtn.addEventListener('click', async () => {
  const display_name = addFullNameInput.value;
  const email = addEmailInput.value;
  const phone_num = addPhoneNumInput.value;
  const password = addPasswordInput.value;
  const role = addRoleSelect.value;

  // Validate required fields
  if (!display_name || !email || !phone_num || !password) {
    alert('All fields are required.');
    return;
  }

  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_name,
        email,
        phone_num,
        password,
        role
      }),
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorResult = await response.json();
      alert(errorResult.error || 'Failed to add user');
      return;
    }

    const result = await response.json();
    alert(result.message);  // Log the success message

    // Close the modal and refresh the user list
    addUserModal.style.display = 'none';  
    fetchAndRenderUsers();  // Re-fetch and render the updated users list
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Error adding user');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Fetch users initially
  fetchAndRenderUsers();

  // Get references to search and filter elements
  const userSearch = document.getElementById('userSearch');
  const userFilter = document.getElementById('userFilter');

  // Add event listeners for search and filter
  userSearch.addEventListener('input', () => {
    fetchAndRenderUsers();  // Re-fetch users with updated search term
  });

  userFilter.addEventListener('change', () => {
    fetchAndRenderUsers();  // Re-fetch users with updated role filter
  });
});

// Display Currencies with Search and Filter
async function fetchAndRenderCurrencies() {
  try {
    const userSearch = document.getElementById('userSearch').value;  // Get the search term
    const userFilter = document.getElementById('userFilter').value;  // Get the selected currency filter

    // Fetch currencies from the backend with search term and filter
    const response = await fetch(`/api/admin/currencies?searchTerm=${userSearch}&roleFilter=${userFilter}`);
    
    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`Error fetching currencies: ${response.statusText}`);
    }

    const currencies = await response.json();

    // Check if the response is an array
    if (!Array.isArray(currencies)) {
      throw new Error('Expected currencies to be an array');
    }

    console.log('Fetched currencies:', currencies);  // Log the currencies for debugging

    const currencyList = document.querySelector('.currencies-list');
    currencyList.innerHTML = '';  // Clear existing currencies

    // Ensure that currencies array is not empty
    if (currencies.length === 0) {
      currencyList.innerHTML = '<p>No currencies available</p>';
      return;
    }

    currencies.forEach(currency => {
      const currencyHTML = `
        <div class="currency-item">
          <div class="currency-symbol">${currency.symbol}</div>
          <div class="currency-info">
            <div class="currency-name">${currency.currency_code}</div>
            <div class="currency-updated">Updated: ${new Date().toLocaleString()}</div>
            <div class="currency-rates">
              <div class="rate-item">1 ${currency.currency_code} = ${currency.exchange_rate_to_php} PHP</div>
            </div>
          </div>
          <div class="currency-actions">
            <button class="edit-btn" onclick="editCurrency(${currency.currency_id})">✏️</button>
            <button class="delete-btn" onclick="deleteCurrency(${currency.currency_id})">🗑️</button>
          </div>
        </div>
      `;

      currencyList.insertAdjacentHTML('beforeend', currencyHTML);  // Append new currency HTML to the list
    });
  } catch (error) {
    console.error('Error loading currencies:', error);  // Log any errors
    alert('Error loading currencies: ' + error.message);  // Show the error to the user
  }
}

// Delete currency logic
async function deleteCurrency(currency_id) {
  const confirmed = confirm('Are you sure you want to delete this currency?');
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/admin/currencies/${currency_id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (response.ok) {
      alert('Currency deleted successfully!');
      fetchAndRenderCurrencies();  // Re-fetch and render the updated currencies list
      location.reload();
    } else {
      alert(result.error || 'Failed to delete currency');
    }
  } catch (error) {
    console.error('Error deleting currency:', error);
    alert('Error deleting currency');
  }
}

// Call the function to fetch and display currencies when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderCurrencies();  // Fetch and render currencies when page is loaded
});

// Function to open the Add Currency modal
document.addEventListener('DOMContentLoaded', () => {
  // Get the modal and button elements
  const addCurrencyModal = document.getElementById('addCurrencyModal');
  const addCurrencyBtn = document.getElementById('addCurrencyBtn');
  const addCurrencyCloseBtn = document.getElementById('addCurrencyCloseBtn');
  const addCurrencyCancelBtn = document.getElementById('addCurrencyCancelBtn');
  const addCurrencySaveBtn = document.getElementById('addCurrencySaveBtn');
  
  const currencyCodeInput = document.getElementById('currencyCode');
  const currencySymbolInput = document.getElementById('currencySymbol');
  const exchangeRateInput = document.getElementById('exchange_rate');

  // Show the Add Currency modal when the "Add Currency" button is clicked
  addCurrencyBtn.addEventListener('click', () => {
    currencyCodeInput.value = '';  // Clear the input fields
    currencySymbolInput.value = '';
    exchangeRateInput.value = '';

    addCurrencyModal.style.display = 'flex';  // Show the modal
  });

  // Close the modal when the Close button is clicked
  addCurrencyCloseBtn.addEventListener('click', () => {
    addCurrencyModal.style.display = 'none';  // Hide the modal
  });

  // Close the modal when the Cancel button is clicked
  addCurrencyCancelBtn.addEventListener('click', () => {
    addCurrencyModal.style.display = 'none';  // Hide the modal
  });

  // Add the new currency when Save button is clicked
  addCurrencySaveBtn.addEventListener('click', async () => {
    const currencyCode = currencyCodeInput.value;
    const symbol = currencySymbolInput.value;
    const exchangeRate = exchangeRateInput.value;

    // Validate the fields
    if (!currencyCode || !symbol || !exchangeRate) {
      alert('All fields are required.');
      return;
    }

    try {
      const response = await fetch('/api/admin/currencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currencyCode,
          symbol,
          exchangeRate,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Currency added successfully!');
        addCurrencyModal.style.display = 'none';  // Close the modal
        fetchAndRenderCurrencies();  // Re-fetch and render the updated currencies list
      } else {
        alert(result.error || 'Failed to add currency');
      }
    } catch (error) {
      console.error('Error adding currency:', error);
      alert('Error adding currency');
    }
  });
});

// Update exchange rate logic
async function updateExchangeRate() {
  const fromCurrency = document.getElementById('fromCurrency').value.toUpperCase();
  const exchangeRate = document.getElementById('exchangeRate').value;

  if (!fromCurrency || !exchangeRate || isNaN(exchangeRate)) {
    alert('Please select a currency and enter a valid exchange rate.');
    return;
  }

  try {
    const response = await fetch('/api/admin/currencies/exchange-rate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency_code: fromCurrency,
        exchange_rate_to_php: parseFloat(exchangeRate),
      }),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      fetchAndRenderCurrencies(); // Optional: refresh currencies display
    } else {
      alert(result.error || 'Failed to update exchange rate');
    }
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    alert('An error occurred while updating the exchange rate');
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  await populateFromCurrencyOptions();
});

async function populateFromCurrencyOptions() {
  try {
    const response = await fetch('/api/admin/currencies');
    const currencies = await response.json();

    const fromCurrencySelect = document.getElementById('fromCurrency');
    fromCurrencySelect.innerHTML = '<option value="">Select currency</option>';  // Clear previous options

    currencies.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency.currency_id;  // Use currency_id as value
      option.textContent = `${currency.currency_code} - ${currency.symbol}`;
      fromCurrencySelect.appendChild(option);
    });

    // Store currency data globally for later use
    window.allCurrencies = currencies;
  } catch (error) {
    console.error('Error loading currencies:', error);
  }
};

async function updateExchangeRate() {
  const fromCurrency = document.getElementById('fromCurrency').value;  // This should be currency_id
  const exchangeRate = document.getElementById('exchangeRate').value;

  if (!fromCurrency || !exchangeRate || isNaN(exchangeRate)) {
    alert('Please select a currency and enter a valid exchange rate.');
    return;
  }

  try {
    const response = await fetch('/api/admin/currencies/exchange-rate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency_id: fromCurrency,  // Use currency_id
        exchange_rate_to_php: parseFloat(exchangeRate),
      }),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      fetchAndRenderCurrencies(); // Refresh the currency list
    } else {
      alert(result.error || 'Failed to update exchange rate');
    }
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    alert('An error occurred while updating the exchange rate');
  }
}

// Open the Edit Currency Modal with pre-filled data
window.editCurrency = function(currency_id) {
    // Find the currency by its ID
    const currency = window.allCurrencies.find(c => c.currency_id === currency_id);  // Correctly find currency by currency_id

    if (!currency) {
        alert('Currency not found!');
        return;  // If the currency doesn't exist, exit the function
    }

    // Set currentEditingCurrency to the selected currency
    window.currentEditingCurrency = currency;

    // Pre-fill the form fields with the current data
    document.getElementById('editCurrencyCode').value = currency.currency_code;  // Set the code
    document.getElementById('editCurrencySymbol').value = currency.symbol;  // Set the symbol
    document.getElementById('editCurrencyRate').value = currency.exchange_rate_to_php;  // Set the exchange rate
    
    // Show the modal
    document.getElementById('editCurrencyModal').style.display = 'flex';
};
// Close the modal when Close or Cancel button is clicked
document.getElementById('editCurrencyCloseBtn').addEventListener('click', () => {
    document.getElementById('editCurrencyModal').style.display = 'none';  // Hide the modal
});

document.getElementById('editCurrencyCancelBtn').addEventListener('click', () => {
    document.getElementById('editCurrencyModal').style.display = 'none';  // Hide the modal
});

// Close the modal if clicked outside the modal
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('editCurrencyModal')) {
        document.getElementById('editCurrencyModal').style.display = 'none';  // Hide the modal
    }
});

// Save the changes when Save button is clicked
document.getElementById('editCurrencySaveBtn').addEventListener('click', async () => {
    const currencyCode = document.getElementById('editCurrencyCode').value.trim();
    const currencySymbol = document.getElementById('editCurrencySymbol').value.trim();
    const exchangeRate = document.getElementById('editCurrencyRate').value.trim();

    // Validate the inputs
    if (!currencyCode || !currencySymbol || !exchangeRate) {
        alert('All fields are required.');
        return;
    }

    // Check if currentEditingCurrency is defined
    if (!window.currentEditingCurrency) {
        alert('No currency selected for editing!');
        return;
    }

    const currency_id = window.currentEditingCurrency.currency_id;  // Get the current editing currency's ID

    const updatedCurrency = {
        currency_id,
        currency_code: currencyCode,
        symbol: currencySymbol,
        exchange_rate_to_php: parseFloat(exchangeRate),
    };

    try {
        const response = await fetch('/api/admin/currencies/details', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCurrency),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Currency updated successfully!');
            document.getElementById('editCurrencyModal').style.display = 'none';
            fetchAndRenderCurrencies();  // Re-fetch and render the updated currencies list
        } else {
            alert(result.error || 'Failed to update currency');
        }
    } catch (error) {
        console.error('Error updating currency:', error);
        alert('An error occurred while updating the currency');
    }
});

// Fetch all users data
async function fetchUsers() {
    try {
        const response = await fetch('/api/admin/users/all');  // API route to fetch all users
        if (!response.ok) {
            throw new Error('Error fetching users: ' + response.statusText);
        }
        const users = await response.json();
        
        // Store the fetched users globally
        window.allUsers = users;

        console.log('Fetched users:', window.allUsers);  // Debugging log: Check the users fetched
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Error fetching users: ' + error.message);
    }
}

// Open the Edit User Modal with pre-filled data
window.editUser = async function(user_id) {
    // Fetch the users first to ensure we have the latest data
    await fetchUsers();  // Ensure we have all users data before proceeding

    console.log('Looking for user with ID:', user_id);

    // Check if the allUsers array is populated
    console.log('All users data:', window.allUsers);

    // Ensure user_id comparison handles type correctly (convert to integer if needed)
    const user = window.allUsers.find(u => u.user_id === parseInt(user_id));  // Ensure user_id comparison is done correctly

    console.log('User found:', user);  // Log the user to verify

    if (!user) {
        console.log('User not found!');
        alert('User not found!');
        return;  // If the user doesn't exist, exit the function
    }

    // Set currentEditingUser to the selected user
    window.currentEditingUser = user;

    // Pre-fill the form fields with the current data
    document.getElementById('editFullName').value = user.display_name;  // Set the full name
    document.getElementById('editEmail').value = user.email;  // Set the email
    document.getElementById('editPhone').value = user.phone_num;  // Set the phone number
    document.getElementById('editRole').value = user.role;  // Set the role

    // Show the modal
    document.getElementById('editUserModal').style.display = 'flex';
};

// Close the modal when Close or Cancel button is clicked
document.getElementById('editUserCloseBtn').addEventListener('click', () => {
    console.log('Closing the Edit User Modal');
    document.getElementById('editUserModal').style.display = 'none';  // Hide the modal
});

document.getElementById('editUserCancelBtn').addEventListener('click', () => {
    console.log('Cancelling the Edit User action');
    document.getElementById('editUserModal').style.display = 'none';  // Hide the modal
});

// Close the modal if clicked outside the modal
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('editUserModal')) {
        console.log('Closing the Edit User Modal by clicking outside');
        document.getElementById('editUserModal').style.display = 'none';  // Hide the modal
    }
});

// Save the changes when Save button is clicked
document.getElementById('editUserSaveBtn').addEventListener('click', async () => {
    const display_name = document.getElementById('editFullName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone_num = document.getElementById('editPhone').value.trim();
    const role = document.getElementById('editRole').value.trim();

    // Validate the inputs
    if (!display_name || !email || !phone_num || !role) {
        console.log('Validation failed: All fields are required.');
        alert('All fields are required.');
        return;
    }

    // Check if currentEditingUser is defined
    if (!window.currentEditingUser) {
        console.log('No user selected for editing!');
        alert('No user selected for editing!');
        return;
    }

    const user_id = window.currentEditingUser.user_id;  // Get the current editing user's ID
    console.log('Saving changes for User ID:', user_id);

    const updatedUser = {
        user_id,
        display_name,
        email,
        phone_num,
        role,
    };

    try {
        const response = await fetch(`/api/admin/users/${user_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
        });

        const result = await response.json();
        console.log('Response from server:', result);

        if (response.ok) {
            alert('User updated successfully!');
            console.log('User updated successfully!');
            // Close the modal
            document.getElementById('editUserModal').style.display = 'none';
            // Optionally, refresh the user list
            fetchAndRenderUsers();  // Re-fetch and render the updated users list
        } else {
            console.log(result.error || 'Failed to update user');
            alert(result.error || 'Failed to update user');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('An error occurred while updating the user');
    }
});

// Logout function for any page to use
function logout() {
  
  sessionStorage.clear // although session data is not used
  window.location.href = "index.html";
}