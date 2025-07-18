// Staff Portal JavaScript - BookNest

document.addEventListener('DOMContentLoaded', function() {
    // ——— Navigation functionality ———
    const transactionLogBtn = document.getElementById('transactionLogBtn');
    const bookManagementBtn = document.getElementById('bookManagementBtn');
    const analyticsBtn      = document.getElementById('analyticsBtn');

    const transactionSection = document.getElementById('transactionSection');
    const bookSection        = document.getElementById('bookSection');
    const analyticsSection   = document.getElementById('analyticsSection');

    const actionBtns = [transactionLogBtn, bookManagementBtn, analyticsBtn];
    const sections   = [transactionSection, bookSection, analyticsSection];

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
        currentEditingItem.querySelector('.item-title').textContent  = document.getElementById('modalTitle').value;
        currentEditingItem.querySelector('.item-author').textContent = document.getElementById('modalAuthor').value;
        currentEditingItem.querySelector('.item-genre').textContent  = document.getElementById('modalGenre').value;
        currentEditingItem.querySelector('.item-price').textContent  = `$${parseFloat(document.getElementById('modalPrice').value).toFixed(2)}`;
        closeEditModal();
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
        // handle adding new book
        addModal.style.display = 'none';
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

    // ——— Initialize tooltips & logs ———
    initializeTooltips();
    console.log('BookNest Staff Portal initialized.');
});
