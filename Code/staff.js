// Staff Portal JavaScript - BookNest

document.addEventListener('DOMContentLoaded', function() {

    const user = JSON.parse(localStorage.getItem('booknest-user'));
      
      if (user) {
          // Update the staff name and role
          document.querySelector('.staff-name').textContent = user.display_name;
          document.querySelector('.staff-role').textContent = user.role;
      } else {
          console.log('No user data found in localStorage');
      }
       function loadDashboardStats() {
        fetch('/api/staff/dashboard-stats')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                // Update revenue card
                const revenueElement = document.querySelector('.stat-card.revenue .stat-value');
                revenueElement.textContent = `₱${parseFloat(data.totalRevenue).toFixed(2)}`;
                // Update transactions card
                document.querySelector('.stat-card.transactions .stat-value').textContent = data.totalTransactions;
                // Update catalog card
                document.querySelector('.stat-card.catalog .stat-value').textContent = data.totalProducts;
            })
            .catch(error => {
                console.error('Error loading dashboard stats:', error);

            });
    }
    // ——— Navigation functionality ———
    const transactionLogBtn = document.getElementById('transactionLogBtn');
    const bookManagementBtn = document.getElementById('bookManagementBtn');

    const transactionSection = document.getElementById('transactionSection');
    const bookSection        = document.getElementById('bookSection');


    const actionBtns = [transactionLogBtn, bookManagementBtn];
    const sections   = [transactionSection, bookSection];

    actionBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            sections.forEach(s => s.classList.add('hidden'));
            sections[idx].classList.remove('hidden');
            actionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ——— Keyboard shortcuts ———
    document.addEventListener('keydown', e => {
        if (e.key === '/') {
            e.preventDefault();
            const searchInput = document.querySelector('.inventory-search-input');
            if (searchInput) searchInput.focus();
        }
    });

const inventorySearchInput = document.querySelector('.inventory-search-input');
if (inventorySearchInput) {
    inventorySearchInput.addEventListener('input', e => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.inventory-item').forEach(item => {
            const title = item.querySelector('.item-title').textContent.toLowerCase();
            const author = item.querySelector('.item-author').textContent.toLowerCase();
            const genre = item.querySelector('.item-genre').textContent.toLowerCase();
            const price = item.querySelector('.item-price').textContent.toLowerCase();
            const stock = item.querySelector('.item-stock-value').textContent.toLowerCase();
            
            // Check if search term matches any of the book fields
            const matches = title.includes(searchTerm) || 
                          author.includes(searchTerm) || 
                          genre.includes(searchTerm) ||
                          price.includes(searchTerm) ||
                          stock.includes(searchTerm);
            
            item.style.display = matches ? '' : 'none';
        });
    });
}
const transactionSearchInput = document.querySelector('#transactionSearch');
if (transactionSearchInput) {
    transactionSearchInput.addEventListener('input', e => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.transaction-item').forEach(item => {
            const orderNumber = item.querySelector('.transaction-order').textContent.toLowerCase();
            const customerName = item.querySelector('.transaction-user').textContent.toLowerCase();
            const transactionDate = item.querySelector('.transaction-date').textContent.toLowerCase();
            const amount = item.querySelector('.transaction-amount').textContent.toLowerCase();
            
            // Check if search term matches any of the transaction fields
            const matches = orderNumber.includes(searchTerm) || 
                          customerName.includes(searchTerm) || 
                          transactionDate.includes(searchTerm) ||
                          amount.includes(searchTerm);
            
            item.style.display = matches ? '' : 'none';
        });
    });
}
function filterTransactions(statusFilter = 'all') {
    const transactionItems = document.querySelectorAll('.transaction-item');
    
    transactionItems.forEach(item => {
        const statusElement = item.querySelector('.transaction-status');
        if (!statusElement) return;
        
        const itemStatus = statusElement.textContent.trim();
        
        if (statusFilter === 'all' || itemStatus === statusFilter) {
            item.style.display = ''; // Show the item
        } else {
            item.style.display = 'none'; // Hide the item
        }
    });
}

    // ——— Filter functionality ———
    function loadTransaction() {
        fetch('/api/transactions')
            .then(res => res.json())
            .then(transactions => {
                const list = document.getElementById('transactionList');
                list.innerHTML = transactions.map(renderTransaction).join('');
                
                // Apply any existing filter after loading
                const currentFilter = document.getElementById('transactionFilter').value;
                filterTransactions(currentFilter);
            })
            .catch(err => console.error('Failed to load transactions:', err));
    }
  
    function renderTransaction(transaction) {
        const statusClass = transaction.payment_status.toLowerCase();
        return `
            <div class="transaction-item" data-id="${transaction.transaction_id}">
                <div class="transaction-details">
                    <h3 class="transaction-order">Order #${transaction.order_id}</h3>
                    <p class="transaction-status ${statusClass}">${transaction.payment_status}</p>
                    <p class="transaction-amount">₱${parseFloat(transaction.total_amount).toFixed(2)}</p>
                    <p class="transaction-user">Customer: ${transaction.display_name || 'Guest'}</p>
                    <p class="transaction-date">${new Date(transaction.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `;
    }

    // ——— EDIT BOOK MODAL ———
    const editModal          = document.getElementById('editModal');
    const modalCloseBtn      = document.getElementById('modalCloseBtn');
    const modalCancelBtn     = document.getElementById('modalCancelBtn');
    const modalSaveBtn       = document.getElementById('modalSaveBtn');
    let currentEditingItem = null;
    function openEditModal()  { editModal.style.display = 'flex'; }
    function closeEditModal() { editModal.style.display = 'none'; }
    modalCloseBtn.addEventListener('click', closeEditModal);
    modalCancelBtn.addEventListener('click', closeEditModal);
    window.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });
    document.querySelectorAll('.item-edit-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const inv = btn.closest('.inventory-item');
            currentEditingItem = inv;
            document.getElementById('modalTitle').value         = inv.querySelector('.item-title').textContent;
            document.getElementById('modalAuthor').value        = inv.querySelector('.item-author').textContent.replace(/^by\s*/i, '');
            document.getElementById('modalGenre').value         = inv.querySelector('.item-genre').textContent;
            const priceTxt = inv.querySelector('.item-price').textContent.replace(/[^0-9.]/g, '');
            document.getElementById('modalPrice').value         = priceTxt;
            // Get description from data attribute or leave empty if not available
            document.getElementById('modalDescription').value   = inv.getAttribute('data-description') || '';
            openEditModal();
        });
    });
modalSaveBtn.addEventListener('click', () => {
    if (!currentEditingItem) return;
    
    const productId = currentEditingItem.getAttribute('data-id');
    const updatedData = {
        title: document.getElementById('modalTitle').value,
        author: document.getElementById('modalAuthor').value,
        genre: document.getElementById('modalGenre').value,
        price: parseFloat(document.getElementById('modalPrice').value),
        description: document.getElementById('modalDescription').value,
        stock_quantity: parseInt(currentEditingItem.querySelector('.item-stock-value').textContent, 10)
    };

    // Send the update to the server
    fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(updatedProduct => {
        // Update the UI with the new values
        currentEditingItem.querySelector('.item-title').textContent = updatedData.title;
        currentEditingItem.querySelector('.item-author').textContent = `by ${updatedData.author}`;
        currentEditingItem.querySelector('.item-genre').textContent = updatedData.genre;
        currentEditingItem.querySelector('.item-price').textContent = `₱${updatedData.price.toFixed(2)}`;
        // Store description in data attribute for future edits
        currentEditingItem.setAttribute('data-description', updatedData.description);
        
        closeEditModal();
        loadInventory(); // Refresh the list to ensure consistency
    })
    .catch(error => {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
    });
});

    // ——— ADD NEW BOOK MODAL ———
    const addModal  = document.getElementById('addModal');
    ['CloseBtn','CancelBtn','SaveBtn'].forEach(id => {
        document.getElementById('addModal' + id).addEventListener('click', () => { addModal.style.display = 'none'; });
    });
    window.addEventListener('click', e => { if (e.target === addModal) addModal.style.display = 'none'; });
    document.querySelector('.add-new-book-btn').addEventListener('click', () => {
        ['Title','Author','Price','Stock','Description'].forEach(field => {
            const el = document.getElementById('add' + field);
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        });
        addModal.style.display = 'flex';
    });
document.getElementById('addModalSaveBtn').addEventListener('click', async () => {
    // Get form values
    const title = document.getElementById('addTitle').value.trim();
    const author = document.getElementById('addAuthor').value.trim();
    const genre = document.getElementById('addGenre').value;
    const price = parseFloat(document.getElementById('addPrice').value);
    const description = document.getElementById('addDescription').value.trim();
    const stock = parseInt(document.getElementById('addStock').value) || 0;

    // Validate required fields
    if (!title || !author || isNaN(price)) {
        alert('Please fill in all required fields (Title, Author, Price)');
        return;
    }

    // Prepare the book data according to your Products table structure
    const bookData = {
        title: title,
        author: author,
        price: price,
        genre: genre || 'General', // Default genre if not selected
        description: description || '', // Include description
        stock_quantity: stock,
        isBestseller: 0, // Default to false
        isNew: 1, // Default to true for new books
        currency_id: 1 // Default to PHP as per your schema
    };

    try {
        // Show loading state
        const saveBtn = document.getElementById('addModalSaveBtn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Adding...';

        // Send POST request to your API endpoint
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add book');
        }

        const result = await response.json();
        
        // Close modal and refresh the book list
        addModal.style.display = 'none';
        loadInventory();
        
        // Show success message (you could add a more elegant notification system)
        alert('Book added successfully!');
        
    } catch (error) {
        console.error('Error adding book:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        const saveBtn = document.getElementById('addModalSaveBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Add Book';
        }
    }
});

    // Adjust stock directly based on user input quantity
document.querySelectorAll('.stock-btn.plus').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.inventory-item');
    const input = item.querySelector('.stock-qty-input');
    const stockSpan = item.querySelector('.item-stock');
    const current = parseInt(stockSpan.textContent, 10) || 0;
    const qty = parseInt(input.value, 10);

    if (!isNaN(qty) && qty > 0) {
      const updated = current + qty;
      stockSpan.textContent = updated;
      stockSpan.classList.toggle('low-stock', updated <= 5);
      input.value = '';
    }
  });
});

document.querySelectorAll('.stock-btn.minus').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.inventory-item');
    const input = item.querySelector('.stock-qty-input');
    const stockSpan = item.querySelector('.item-stock');
    const current = parseInt(stockSpan.textContent, 10) || 0;
    const qty = parseInt(input.value, 10);

    if (!isNaN(qty) && qty > 0) {
      const updated = Math.max(0, current - qty);
      stockSpan.textContent = updated;
      stockSpan.classList.toggle('low-stock', updated <= 5);
      input.value = '';
    }
  });
});


    // ——— Update stock handler ———
    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.inventory-item');
            const input = item.querySelector('.stock-qty-input');
            const delta = parseInt(input.value, 10) || 0;
            const stockSpan = item.querySelector('.item-stock');
            const current = parseInt(stockSpan.textContent, 10) || 0;
            const updated = current + delta;
            stockSpan.textContent = updated;
            input.value = '';
            // optional: toggle low-stock styling
            if (updated <= 5) stockSpan.classList.add('low-stock');
            else stockSpan.classList.remove('low-stock');
        });
    });

    // Enhanced renderBookItem function
function renderBookItem(book) {
    const stockStatus = book.stock_quantity <= 0 ? 'out-of-stock' : 
                       book.stock_quantity <= 5 ? 'low-stock' : 'in-stock';
    
    const stockStatusText = book.stock_quantity <= 0 ? 'Out of Stock' : 
                           book.stock_quantity <= 5 ? 'Low Stock' : 'In Stock';
    
    return `
        <div class="inventory-item" data-id="${book.product_id}" data-description="${book.description || ''}">
            <div class="item-image">
                <div class="book-cover">📚</div>
            </div>
            
            <div class="item-details">
                <h3 class="item-title">${book.title}</h3>
                <p class="item-author">by ${book.author}</p>
                <span class="item-genre">${book.genre}</span>
            </div>
            
            <div class="item-price-section">
                <span class="price-label">Price</span>
                <p class="item-price">₱${parseFloat(book.price).toFixed(2)}</p>
            </div>
            
            <div class="item-stock-section">
                <span class="stock-label">Stock</span>
                <p class="item-stock ${book.stock_quantity <= 5 ? 'low-stock' : ''}">
                    <span class="item-stock-value">${book.stock_quantity}</span>
                </p>
                <span class="status-indicator ${stockStatus}">${stockStatusText}</span>
            </div>
            
            <div class="stock-controls">
                <input type="number" class="stock-qty-input" value="${book.stock_quantity}" min="0" />
                <button class="save-stock-btn">💾 Save</button>
            </div>
            
            <div class="item-actions">
                <button class="item-edit-btn">✏️ Edit</button>
            </div>
        </div>
    `;
}
    
    function loadInventory() {
    fetch('/api/products')
        .then(res => res.json())
        .then(books => {
        const list = document.getElementById('inventoryList');
        list.innerHTML = books.map(renderBookItem).join('');
        attachStockHandlers();
        attachEditButtons();
        })
        .catch(err => console.error('Failed to load inventory:', err));
    }

    // NEW VERSION of Render
           function renderTransaction(transaction) {
    const statusClass = transaction.payment_status.toLowerCase();
    const amountClass = parseFloat(transaction.total_amount) >= 0 ? 'positive' : 'negative';
    const formattedDate = new Date(transaction.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="transaction-item" data-id="${transaction.transaction_id}">
            <div class="transaction-details">
                <h3 class="transaction-order">Order #${transaction.order_id}</h3>
                <p class="transaction-user">Customer: ${transaction.display_name || 'Guest'}</p>
                <p class="transaction-date">${formattedDate}</p>
            </div>
            <div class="transaction-status ${statusClass}">${transaction.payment_status}</div>
            <div class="transaction-amount ${amountClass}">₱${parseFloat(transaction.total_amount).toFixed(2)}</div>
        </div>
    `;
}

        function loadTransaction() {
    fetch('/api/transactions')
        .then(res => res.json())
        .then(transactions => {
        const list = document.getElementById('transactionList');
        list.innerHTML = transactions.map(renderTransaction).join('');
        })
        .catch(err => console.error('Failed to load transactions:', err))
    }

function attachStockHandlers() {
  document.querySelectorAll('.save-stock-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const item = btn.closest('.inventory-item');
      const input = item.querySelector('.stock-qty-input');
      const stockSpan = item.querySelector('.item-stock-value');
      const productId = item.getAttribute('data-id');
      const newStock = parseInt(input.value, 10);

      // Validate input
      if (isNaN(newStock) || newStock < 0) {
        alert('Please enter a valid non-negative number');
        input.value = '';
        return;
      }

      // Disable button during request
      btn.disabled = true;
      btn.textContent = 'Saving...';

      fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newStock })
      })
      .then(res => {
        if (!res.ok) throw new Error('Stock update failed');
        return res.json();
      })
      .then(updatedProduct => {
        // Update UI
        stockSpan.textContent = updatedProduct.stock_quantity;
        stockSpan.parentElement.classList.toggle('low-stock', updatedProduct.stock_quantity <= 5);
        input.value = '';
        
        // Update status if displayed
        const statusElement = item.querySelector('.item-status');
        if (statusElement) {
          statusElement.textContent = updatedProduct.stock_quantity > 0 ? 'In-stock' : 'Out-of-stock';
          statusElement.className = 'item-status ' + 
            (updatedProduct.stock_quantity > 0 ? 'in-stock' : 'out-of-stock');
        }
      })
      .catch(err => {
        console.error('Stock update failed:', err);
        alert('Failed to update stock. Please try again.');
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = '💾 Save';
      });
    });
  });

  // Add input validation to prevent negative numbers
  document.querySelectorAll('.stock-qty-input').forEach(input => {
    input.addEventListener('change', () => {
      if (parseInt(input.value) < 0) {
        input.value = '';
        alert('Stock cannot be negative');
      }
    });
  });
}

    function attachEditButtons() {
    document.querySelectorAll('.item-edit-btn').forEach(btn => {
        btn.addEventListener('click', e => {
        e.preventDefault();
        const inv = btn.closest('.inventory-item');
        currentEditingItem = inv;

        document.getElementById('modalTitle').value         = inv.querySelector('.item-title').textContent;
        document.getElementById('modalAuthor').value        = inv.querySelector('.item-author').textContent.replace(/^by\s*/i, '');
        document.getElementById('modalGenre').value         = inv.querySelector('.item-genre').textContent;
        const priceTxt = inv.querySelector('.item-price').textContent.replace(/[^0-9.]/g, '');
        document.getElementById('modalPrice').value         = priceTxt;
        // Get description from data attribute
        document.getElementById('modalDescription').value   = inv.getAttribute('data-description') || '';

        openEditModal();
        });
    });
    }
    loadDashboardStats();
    loadInventory();
    loadTransaction();
    attachEditButtons(); 
    // ——— Initialize tooltips & logs ———
    console.log('BookNest Staff Portal initialized.');
});

// Logout function for any page to use
function logout() {
  localStorage.removeItem('booknest-user');
  sessionStorage.clear(); // although session data is not used
  window.location.href = "index.html";
}