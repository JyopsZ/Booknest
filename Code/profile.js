// profile.js
// Profile page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Load user data from localStorage
    loadUserData();
    
    // Tab functionality
    initTabs();
    
    // Form functionality
    initForms();
    
    // Update cart count
    updateCartCount();

    // Fetch all user balances
    fetchUserBalances();

    fetchOrderHistory();

});

async function fetchUserBalances() {
    try {
        const user = JSON.parse(localStorage.getItem('booknest-user'));
        if (!user || !user.user_id) return;

        const response = await fetch(`/api/user/balances?user_id=${user.user_id}`);
        const data = await response.json();

        if (data.success) {
            // Store balances in localStorage
            const updatedUser = {
                ...user,
                balances: data.balances
            };
            localStorage.setItem('booknest-user', JSON.stringify(updatedUser));

            // Update UI with all balances
            updateBalanceDisplays(data.balances);
        }
    } catch (error) {
        console.error('Error fetching balances:', error);
    }
}

function updateBalanceDisplays(balances) {
    if (!balances || balances.length === 0) return;

    // Find primary balance (PHP)
    const primaryBalance = balances.find(b => b.currency_code === 'PHP') || balances[0];
    
    // Update header balance
    const headerBalance = document.querySelector('.currency-amount');
    if (headerBalance) {
        headerBalance.textContent = parseFloat(primaryBalance.balance).toFixed(2);
    }

    const headerSymbol = document.querySelector('.currency-symbol');
    if (headerSymbol) {
        headerSymbol.textContent = primaryBalance.symbol || '₱';
    }

    // Update wallet stat card
    const walletStatNumber = document.querySelector('.stat-card .stat-number');
    if (walletStatNumber) {
        walletStatNumber.textContent = `${primaryBalance.symbol || '₱'}${parseFloat(primaryBalance.balance).toFixed(2)}`;
    }

    // Update balance cards in wallet tab
    updateBalanceCards(balances);
}

function updateBalanceCards(balances) {
    const balanceCards = [
        { selector: '.balance-amount', currency: 'PHP' },
        { selector: '.balance-amount2', currency: 'USD' },
        { selector: '.balance-amount3', currency: 'EURO' }
    ];

    balanceCards.forEach(card => {
        const balanceElement = document.querySelector(card.selector);
        if (!balanceElement) return;

        const balanceData = balances.find(b => b.currency_code === card.currency);
        if (balanceData) {
            balanceElement.textContent = `${parseFloat(balanceData.balance).toFixed(2)} ${balanceData.currency_code}`;
            
            // Also update the currency symbol in the card
            const cardElement = balanceElement.closest('.balance-card');
            if (cardElement) {
                const symbolElement = cardElement.querySelector('.currency-symbol');
                if (symbolElement) {
                    symbolElement.textContent = balanceData.symbol;
                }
            }
        } else {
            balanceElement.textContent = `0.00 ${card.currency}`;
        }
    });

    // Update available balance in exchange section
    const availableBalance = document.querySelector('.available-balance');
    if (availableBalance) {
        const phpBalance = balances.find(b => b.currency_code === 'PHP');
        if (phpBalance) {
            availableBalance.textContent = `Available: ${parseFloat(phpBalance.balance).toFixed(2)} ${phpBalance.currency_code}`;
        }
    }
}

function loadUserData() {
    const user = JSON.parse(localStorage.getItem('booknest-user'));
    if (!user) {
        console.log('No user data found');
        return;
    }

    // Update profile header
    document.querySelector('.profile-name').textContent = user.display_name;
    const profileNameLarge = document.querySelector('.profile-name-large');
    if (profileNameLarge) {
        profileNameLarge.textContent = user.display_name;
    }

    const profileEmail = document.querySelector('.profile-email');
    if (profileEmail && user.email) {
        profileEmail.textContent = user.email;
    }

    // Update wallet balance if available
    if (user.balances) {
        updateBalanceDisplays(user.balances);
    } else if (user.balance !== undefined) {
        // Fallback to single balance if multi-currency not available
        const headerBalance = document.querySelector('.currency-amount');
        if (headerBalance) {
            headerBalance.textContent = parseFloat(user.balance).toFixed(2);
        }

        const walletStatNumber = document.querySelector('.stat-card .stat-number');
        if (walletStatNumber) {
            walletStatNumber.textContent = `${user.currency_symbol || '₱'}${parseFloat(user.balance).toFixed(2)}`;
        }
    }
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab + '-tab');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function initForms() {
    // Load Money form
    const loadMoneyBtn = document.querySelector('.load-money-btn');
    if (loadMoneyBtn) {
        loadMoneyBtn.addEventListener('click', handleLoadMoney);
    }
    
    // Currency Exchange form
    const exchangeBtn = document.querySelector('.exchange-btn');
    if (exchangeBtn) {
        exchangeBtn.addEventListener('click', handleCurrencyExchange);
    }
    
    // Update available balance when from currency changes
    const fromCurrencySelect = document.getElementById('from-currency');
    if (fromCurrencySelect) {
        fromCurrencySelect.addEventListener('change', updateAvailableBalance);
    }
    
    // Profile settings form
    const saveProfileBtn = document.querySelector('.save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleSaveProfile);
    }

    // Pre-fill profile form with user data
    const user = JSON.parse(localStorage.getItem('booknest-user'));
    if (user) {
        const displayNameInput = document.getElementById('display-name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        
        if (displayNameInput) displayNameInput.value = user.display_name || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone_num || '';
    }
}

async function handleLoadMoney() {
    const amountInput = document.getElementById('amount');
    const currencySelect = document.getElementById('currency');
    const loadMoneyBtn = document.querySelector('.load-money-btn');
    
    if (!amountInput || !currencySelect) return;
    
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;
    
    // Validate amount
    if (!amount || amount <= 0) {
        showErrorMessage('Please enter a valid amount');
        return;
    }
    
    // Get user data
    const user = JSON.parse(localStorage.getItem('booknest-user'));
    if (!user || !user.user_id) {
        showErrorMessage('User not logged in');
        return;
    }
    
    // Show loading state
    const originalBtnText = loadMoneyBtn.textContent;
    loadMoneyBtn.textContent = '⏳ Loading...';
    loadMoneyBtn.disabled = true;
    
    try {
        // Send request to server
        const response = await fetch('/api/user/load-money', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.user_id,
                amount: amount,
                currency_code: currency
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update user balances in localStorage
            const updatedUser = {
                ...user,
                balances: data.balances
            };
            localStorage.setItem('booknest-user', JSON.stringify(updatedUser));
            
            // Update UI with new balances
            updateBalanceDisplays(data.balances);
            
            // Clear the form
            amountInput.value = '';
            currencySelect.selectedIndex = 0;
            
            // Show success message
            showSuccessMessage(data.message);
            
        } else {
            showErrorMessage(data.message || 'Failed to load money');
        }
        
    } catch (error) {
        console.error('Error loading money:', error);
        showErrorMessage('Network error. Please try again.');
    } finally {
        // Reset button state
        loadMoneyBtn.textContent = originalBtnText;
        loadMoneyBtn.disabled = false;
    }
}


function fetchOrderHistory() {
  const user = JSON.parse(localStorage.getItem('booknest-user'));
  if (!user || !user.user_id) {
    console.warn('No user logged in.');
    return;
  }

  fetch(`/api/user/orders?user_id=${user.user_id}`)
    .then(response => response.json())
    .then(orders => renderOrders(orders))
    .catch(error => {
      console.error('Error fetching orders:', error);
    });
}

function renderOrders(orders) {
  const ordersList = document.querySelector('.orders-list');
  ordersList.innerHTML = '';

  if (!orders.length) {
    ordersList.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  orders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.classList.add('order-card');

    const date = new Date(order.order_date).toLocaleDateString();

    const itemsHTML = order.items.map(item => `
      <li>${item.title} × ${item.quantity}</li>
    `).join('');

    orderCard.innerHTML = `
      <div class="order-header">
        <strong>Order #${order.order_id}</strong> — ${date}
      </div>
      <ul class="order-items">${itemsHTML}</ul>
      <div class="order-total">
        Total: ${order.total_amount} ${order.currency}
      </div>
    `;

    ordersList.appendChild(orderCard);
  });
}

function updateUserBalance(amount, currencyCode = 'PHP') {
    const user = JSON.parse(localStorage.getItem('booknest-user'));
    if (!user) return;

    // Initialize balances array if not exists
    if (!user.balances) {
        user.balances = [];
    }

    // Find existing balance for this currency
    let existingBalance = user.balances.find(b => b.currency_code === currencyCode);
    
    if (existingBalance) {
        // Update existing balance
        existingBalance.balance = (parseFloat(existingBalance.balance) + amount).toFixed(2);
    } else {
        // Add new balance
        const symbol = currencyCode === 'PHP' ? '₱' : 
                        currencyCode === 'USD' ? '$' :
                      currencyCode === 'EUR' ? '€' :
        user.balances.push({
            balance: amount.toFixed(2),
            currency_code: currencyCode,
            symbol: symbol
        });
    }

    // Update primary balance if PHP (for backward compatibility)
    const phpBalance = user.balances.find(b => b.currency_code === 'PHP');
    if (phpBalance) {
        user.balance = phpBalance.balance;
        user.currency_symbol = phpBalance.symbol;
    }

    localStorage.setItem('booknest-user', JSON.stringify(user));

    // Update all balance displays
    updateBalanceDisplays(user.balances);
}


async function handleCurrencyExchange() {
    const fromSelect = document.getElementById('from-currency');
    const amountInput = document.getElementById('exchange-amount');
    const exchangeBtn = document.querySelector('.exchange-btn');
    
    if (!fromSelect || !amountInput || !exchangeBtn) return;
    
    const fromCurrency = fromSelect.value;
    const amount = parseFloat(amountInput.value);
    
    // Validate amount
    if (!amount || amount <= 0) {
        showErrorMessage('Please enter a valid amount');
        return;
    }
    
    // Get user data
    const user = JSON.parse(localStorage.getItem('booknest-user'));
    if (!user || !user.user_id) {
        showErrorMessage('User not logged in');
        return;
    }
    
    // Check if user has enough balance in the selected currency
    const userBalance = user.balances?.find(b => b.currency_code === fromCurrency);
    if (!userBalance || parseFloat(userBalance.balance) < amount) {
        showErrorMessage(`Insufficient ${fromCurrency} balance`);
        return;
    }
    
    // Show loading state
    const originalBtnText = exchangeBtn.textContent;
    exchangeBtn.textContent = '⏳ Processing...';
    exchangeBtn.disabled = true;
    
    try {
        // 1. Get current exchange rate from database
        const exchangeRateResponse = await fetch('/api/admin/currencies');
        const currencies = await exchangeRateResponse.json();
        
        const currencyData = currencies.find(c => c.currency_code === fromCurrency);
        if (!currencyData) {
            throw new Error('Currency not found');
        }
        
        const exchangeRate = currencyData.exchange_rate_to_php;
        const convertedAmount = amount * exchangeRate;
        
        // 2. Send exchange request to server
        const response = await fetch('/api/user/exchange-currency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.user_id,
                from_currency: fromCurrency,
                to_currency: 'PHP',
                amount: amount,
                exchange_rate: exchangeRate
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update user balances in localStorage
            const updatedUser = {
                ...user,
                balances: data.balances
            };
            localStorage.setItem('booknest-user', JSON.stringify(updatedUser));
            
            // Update UI with new balances
            updateBalanceDisplays(data.balances);
            
            // Clear the form
            amountInput.value = '';
            
            // Show success message
            showSuccessMessage(
                `Successfully exchanged ${amount.toFixed(2)} ${fromCurrency} to ₱${convertedAmount.toFixed(2)}`
            );
        } else {
            showErrorMessage(data.message || 'Currency exchange failed');
        }
    } catch (error) {
        console.error('Currency exchange error:', error);
        showErrorMessage('Exchange failed. Please try again.');
    } finally {
        // Reset button state
        exchangeBtn.textContent = originalBtnText;
        exchangeBtn.disabled = false;
    }
}

function handleSaveProfile() {
    const displayName = document.getElementById('display-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    
    // Basic validation
    if (!displayName.value.trim()) {
        alert('Please enter a display name');
        return;
    }
    
    if (!email.value.trim() || !isValidEmail(email.value)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate saving profile
    const confirmation = confirm('Save profile changes?');
    if (confirmation) {
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('booknest-user')) || {};
        user.display_name = displayName.value.trim();
        user.email = email.value.trim();
        user.phone_num = phone.value.trim();
        localStorage.setItem('booknest-user', JSON.stringify(user));
        
        // Update profile display
        loadUserData();
        
        showSuccessMessage('Profile updated successfully!');
    }
}

function updateAvailableBalance() {
    const user = JSON.parse(localStorage.getItem('booknest-user'));
    if (!user) return;

    const fromCurrency = document.getElementById('from-currency').value;
    const balanceDisplay = document.querySelector('.available-balance');
    
    if (balanceDisplay) {
        balanceDisplay.textContent = `Available: ${parseFloat(user.balance || 0).toFixed(2)} ${fromCurrency}`;
    }
}

function getExchangeRate(from, to) {
    // Simplified exchange rates (in real app, this would come from an API)
    const rates = {
        'PHP_USD': 0.018,
        'PHP_EUR': 0.016,
        'USD_PHP': 56.0,
        'USD_EUR': 0.92,
        'EUR_PHP': 62.5,
        'EUR_USD': 1.09
    };
    return rates[`${from}_${to}`] || 1;
}

function addTransaction(type, amount, date) {
    const transactionsList = document.querySelector('.transactions-list');
    if (!transactionsList) return;
    
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    
    const icon = type.includes('Load') ? '💳' : type.includes('Exchange') ? '🔄' : '🛍️';
    const amountClass = amount.startsWith('+') ? 'positive' : 'negative';
    
    transactionItem.innerHTML = `
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-details">
            <span class="transaction-type">${type}</span>
            <span class="transaction-date">${date.toLocaleDateString()}</span>
        </div>
        <div class="transaction-amount ${amountClass}">${amount}</div>
    `;
    
    // Insert at the beginning of the list
    transactionsList.insertBefore(transactionItem, transactionsList.firstChild);
}

function showSuccessMessage(message) {
    // Create a simple success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4e7c59;
        color: #fff8e1;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1000;
        font-family: Georgia, serif;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Logout function for any page to use
function logout() {
    localStorage.removeItem('booknest-user');
    localStorage.removeItem('booknest-cart');
    window.location.href = "index.html";
}