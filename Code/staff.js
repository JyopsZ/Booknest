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

    // ——— Search functionality ———
    const searchInput = document.querySelector('.inventory-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.inventory-item').forEach(item => {
                const title = item.querySelector('.item-title').textContent.toLowerCase();
                item.style.display = title.includes(term) ? '' : 'none';
            });
        });
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
            document.getElementById('modalOriginalPrice').value = priceTxt;
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
        
        // The stock quantity will be updated via the separate stock controls
        // The trigger will automatically handle the status change
        
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
        ['Title','Author','Price','OriginalPrice','Stock'].forEach(field => {
            const el = document.getElementById('add' + field);
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        });
        addModal.style.display = 'flex';
    });
document.getElementById('addModalSaveBtn').addEventListener('click', () => {
  const data = {
    title: document.getElementById('addTitle').value,
    author: document.getElementById('addAuthor').value,
    genre: document.getElementById('addGenre').value,
    price: parseFloat(document.getElementById('addPrice').value),
    stock_quantity: parseInt(document.getElementById('addStock').value) || 0,
    currency_id: 1 // PHP
  };

  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(() => {
      addModal.style.display = 'none';
      loadInventory(); // Refresh book list
    })
    .catch(err => console.error('Add book failed:', err));
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

    //This renders the books
        function renderBookItem(book) {
    return `
        <div class="inventory-item" data-id="${book.product_id}">
        <div class="item-details">
            <h3 class="item-title">${book.title}</h3>
            <p class="item-author">by ${book.author}</p>
            <p class="item-genre">${book.genre}</p>
            </div>
            <div class="item-price-section">
            <p class="item-price">₱${parseFloat(book.price).toFixed(2)}</p>
            <p class="item-stock ${book.stock_quantity <= 5 ? 'low-stock' : ''}">Stock: <span class="item-stock-value">${book.stock_quantity}</span></p>
            </div>
        <div class="item-actions">
            <div class="stock-controls">
            <input type="number" class="stock-qty-input" value="${book.stock_quantity}" /></input>
            <button class="save-stock-btn">💾 Save</button>
            </div>
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

            function renderTransaction(transaction) {
    return `
        <div class="transaction-item" data-id="${transaction.transaction_id}">
        <div class="transaction-details">
            <h3 class="transaction-order">${transaction.order_id}</h3>
            <p class="transaction-status">${transaction.payment_status}</p>
            <p class="transaction-amount positive">${transaction.total_amount}</p>
            <p class="transaction>${transaction.user_id}</p>
            <p class="transaction-name>${transaction.display_name}</p>
            </div>
        </div>
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
        document.getElementById('modalOriginalPrice').value = priceTxt;

        openEditModal();
        });
    });
    }
    loadDashboardStats();
    loadInventory();
    loadTransaction();
    attachEditButtons(); 
    // ——— Initialize tooltips & logs ———
    initializeTooltips();
    console.log('BookNest Staff Portal initialized.');
});

// Logout function for any page to use
function logout() {
  
  sessionStorage.clear // although session data is not used
  window.location.href = "index.html";
}
