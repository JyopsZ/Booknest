// Profile page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    initTabs();
    
    // Form functionality
    initForms();
    
    // Update cart count
    updateCartCount();
});

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
}

function handleLoadMoney() {
    const amountInput = document.getElementById('amount');
    const currencySelect = document.getElementById('currency');
    
    if (!amountInput || !currencySelect) return;
    
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Simulate loading money
    const confirmation = confirm(`Load ${amount} ${currency} to your wallet?`);
    if (confirmation) {
        // Update the wallet balance display
        updateWalletBalance(currency, amount);
        
        // Clear the form
        amountInput.value = '';
        
        // Show success message
        showSuccessMessage(`Successfully loaded ${amount} ${currency} to your wallet!`);
        
        // Add transaction to history
        addTransaction('Wallet Load', `+${amount} ${currency}`, new Date());
    }
}

function handleCurrencyExchange() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const amountInput = document.getElementById('exchange-amount');
    
    if (!fromSelect || !toSelect || !amountInput) return;
    
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (fromCurrency === toCurrency) {
        alert('Please select different currencies');
        return;
    }
    
    // Check if user has enough balance (simplified check)
    const availableBalance = getAvailableBalance(fromCurrency);
    if (amount > availableBalance) {
        alert('Insufficient balance');
        return;
    }
    
    // Simulate exchange rate (simplified)
    const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = (amount * exchangeRate).toFixed(2);
    
    const confirmation = confirm(
        `Exchange ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}?`
    );
    
    if (confirmation) {
        // Update balances
        updateWalletBalance(fromCurrency, -amount);
        updateWalletBalance(toCurrency, parseFloat(convertedAmount));
        
        // Clear the form
        amountInput.value = '';
        
        // Show success message
        showSuccessMessage(
            `Successfully exchanged ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}!`
        );
        
        // Add transaction to history
        addTransaction(
            'Currency Exchange', 
            `-${amount} ${fromCurrency} / +${convertedAmount} ${toCurrency}`, 
            new Date()
        );
        
        // Update available balance display
        updateAvailableBalance();
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
        // Update profile display
        const profileNameLarge = document.querySelector('.profile-name-large');
        const profileEmail = document.querySelector('.profile-email');
        const headerProfileName = document.querySelector('.profile-name');
        
        if (profileNameLarge) profileNameLarge.textContent = displayName.value;
        if (profileEmail) profileEmail.textContent = email.value;
        if (headerProfileName) headerProfileName.textContent = displayName.value.split(' ')[0];
        
        showSuccessMessage('Profile updated successfully!');
    }
}

function updateAvailableBalance() {
    const fromCurrency = document.getElementById('from-currency').value;
    const availableBalance = getAvailableBalance(fromCurrency);
    const balanceDisplay = document.querySelector('.available-balance');
    
    if (balanceDisplay) {
        balanceDisplay.textContent = `Available: ${availableBalance.toFixed(2)} ${fromCurrency}`;
    }
}

function getAvailableBalance(currency) {
    // Simplified balance lookup
    const balances = {
        'PHP': 250.75,
        'USD': 250.75,
        'EUR': 180.50,
    };
    return balances[currency] || 0;
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

function updateWalletBalance(currency, amount) {
    // Find the balance card for the currency and update it
    const balanceCards = document.querySelectorAll('.balance-card');
    balanceCards.forEach(card => {
        const currencyName = card.querySelector('.currency-name');
        if (currencyName && currencyName.textContent === currency) {
            const balanceAmount = card.querySelector('.balance-amount');
            if (balanceAmount) {
                const currentBalance = parseFloat(balanceAmount.textContent.split(' ')[0]);
                const newBalance = currentBalance + amount;
                balanceAmount.textContent = `${newBalance.toFixed(2)} ${currency}`;
            }
        }
    });
    
    // Update header currency if it's PHP
    if (currency === 'PHP') {
        const headerAmount = document.querySelector('.currency-amount');
        if (headerAmount) {
            const currentAmount = parseFloat(headerAmount.textContent);
            const newAmount = currentAmount + amount;
            headerAmount.textContent = newAmount.toFixed(2);
        }
    }
    
    // Update wallet balance stat card
    const walletStatCard = document.querySelector('.stat-card .stat-number');
    if (walletStatCard && currency === 'PHP') {
        const currentBalance = parseFloat(walletStatCard.textContent.replace('₱', ''));
        const newBalance = currentBalance + amount;
        walletStatCard.textContent = `₱${newBalance.toFixed(2)}`;
    }
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
    // This would typically come from localStorage or a server
    const cartCount = localStorage.getItem('cartCount') || '0';
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Logout function for any page to use
function logout() {
  
  sessionStorage.clear // although session data is not used
  window.location.href = "index.html";
}