let books = [];
let filteredBooks = [];
let cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];

// This is just for the displpay on the top right
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('booknest-user'));
  
  if (user) {
    // Update the profile name
    document.querySelector('.profile-name').textContent = user.display_name;
    
    // Update the balance if available
    if (user.balance !== undefined) {
      const formattedBalance = parseFloat(user.balance).toFixed(2);
      document.querySelector('.currency-amount').textContent = formattedBalance;
    }
    
    // Update currency symbol if available
    if (user.currency_symbol) {
      document.querySelector('.currency-symbol').textContent = user.currency_symbol;
    }
  } else {
    console.log('No user data found in localStorage');
  }
});

// Fetch book data from backend
async function loadBooksFromServer() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to load products');
    
    const data = await response.json();
    
    books = data.map(book => ({
      id: book.product_id,
      title: book.title,
      author: book.author,
      price: parseFloat(book.price),
      originalPrice: null, 
      genre: book.genre,
      stock: book.stock_quantity,
      rating: parseFloat(book.rating || 0),
      description: book.description || '',
      isBestseller: !!book.isBestseller,
      isNew: !!book.isNew
    }));

    filteredBooks = [...books];
    renderBooks(filteredBooks);
    updateResultsCount();
  } catch (error) {
    console.error('Error loading books:', error);
    document.getElementById('booksGrid').innerHTML = `<p>Error loading books.</p>`;
  }
}

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
  
  // Update header balance (works across all pages)
  const headerBalance = document.querySelector('.currency-amount');
  if (headerBalance) {
    headerBalance.textContent = parseFloat(primaryBalance.balance).toFixed(2);
  }

  const headerSymbol = document.querySelector('.currency-symbol');
  if (headerSymbol) {
    headerSymbol.textContent = primaryBalance.symbol || '₱';
  }

  // Update profile page specific elements if they exist
  const profileNameLarge = document.querySelector('.profile-name-large');
  if (profileNameLarge) {
    const user = JSON.parse(localStorage.getItem('booknest-user'));
    profileNameLarge.textContent = user.display_name;
  }
}

function getStockStatus(stock) {
  if (stock === 0) return 'out-of-stock';
  if (stock <= 3) return 'low-stock';
  return 'in-stock';
}

function getStockText(stock) {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 3) return `Only ${stock} left`;
  return 'In Stock';
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  if (hasHalfStar) {
    stars += '☆';
  }
  
  return stars;
}

function saveCart(cart) {
  localStorage.setItem('booknest-cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElement = document.getElementById('cartCount');
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  }
}

function renderBooks(booksToRender) {
  const grid = document.getElementById('booksGrid');
  const noResults = document.getElementById('noResults');
  
  if (!grid) return;
  
  if (booksToRender.length === 0) {
    grid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  if (noResults) noResults.style.display = 'none';
  
  grid.innerHTML = booksToRender.map(book => {
    const stockStatus = getStockStatus(book.stock);
    const stockText = getStockText(book.stock);
    const isOutOfStock = book.stock === 0;
    
    return `
      <div class="book-card">
        <div class="book-image">
          <div class="book-badges">
            ${book.isBestseller ? '<span class="badge bestseller">Bestseller</span>' : ''}
            ${book.isNew ? '<span class="badge new">New</span>' : ''}
          </div>
          <div class="stock-badges">
            <span class="badge ${stockStatus}">${stockText}</span>
          </div>
        </div>
        <div class="book-content">
          <div class="book-title">${book.title}</div>
          <div class="book-author">by ${book.author}</div>
          <div class="book-rating">
            <span class="stars">${generateStars(book.rating)}</span>
            <span class="rating-text">(${book.rating})</span>
          </div>
          <div class="book-description">${book.description}</div>
          <div class="book-footer">
            <div class="book-price">
              <span class="current-price">₱${book.price}</span>
              ${book.originalPrice ? `<span class="original-price">₱${book.originalPrice}</span>` : ''}
            </div>
            <button class="add-to-cart" ${isOutOfStock ? 'disabled' : ''} onclick="addToCart(${book.id})">
              ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCart() {
  const cartContent = document.getElementById('cartContent');
  const emptyCart = document.getElementById('emptyCart');
  
  if (!cartContent) return;
  
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Add some books to get started!</p>
        <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  const subtotal = getCartTotal();
  const total = subtotal;
  
  cartContent.innerHTML = `
    <div class="cart-items">
      ${cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-image">📚</div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-author">by ${item.author}</div>
            <div class="cart-item-genre">${item.genre}</div>
          </div>
          <div class="cart-item-controls">
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">₱${item.price * item.quantity}</div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal (${cart.reduce((total, item) => total + item.quantity, 0)} items)</span>
        <span>₱${subtotal}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>₱${total}</span>
      </div>
      
      <div class="checkout-actions">
        <button class="checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
        <a href="index.html" class="continue-shopping-link">Continue Shopping</a>
      </div>
    </div>
  `;
}

function filterBooks() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const selectedGenres = Array.from(document.querySelectorAll('#genreFilters input:checked')).map(cb => cb.value);
  const priceRange = document.getElementById('priceRange');
  const maxPrice = priceRange ? parseInt(priceRange.value) : 1000;
  const availabilityFilters = Array.from(document.querySelectorAll('input[value^="in-stock"], input[value^="low-stock"]:checked')).map(cb => cb.value);
  
  filteredBooks = books.filter(book => {
    const matchesSearch = searchTerm === '' || 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm);
    
    const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(book.genre);
    const matchesPrice = book.price <= maxPrice;
    
    const bookStockStatus = getStockStatus(book.stock);
    const matchesAvailability = availabilityFilters.length === 0 || 
      availabilityFilters.includes(bookStockStatus) ||
      (availabilityFilters.includes('in-stock') && bookStockStatus === 'in-stock');
    
    return matchesSearch && matchesGenre && matchesPrice && matchesAvailability;
  });
  
  sortBooks();
  updateResultsCount();
}

function sortBooks() {
  const sortSelect = document.getElementById('sortSelect');
  if (!sortSelect) return;
  
  const sortBy = sortSelect.value;
  
  switch (sortBy) {
    case 'price-low':
      filteredBooks.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredBooks.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredBooks.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filteredBooks.sort((a, b) => b.isNew - a.isNew);
      break;
    default: // featured
      filteredBooks.sort((a, b) => b.isBestseller - a.isBestseller);
  }
  
  renderBooks(filteredBooks);
}

function updateResultsCount() {
  const resultsCount = document.getElementById('resultsCount');
  const totalCount = document.getElementById('totalCount');
  
  if (resultsCount) resultsCount.textContent = filteredBooks.length;
  if (totalCount) totalCount.textContent = books.length;
}

function updatePriceDisplay() {
  const priceRange = document.getElementById('priceRange');
  const maxPriceDisplay = document.getElementById('maxPriceDisplay');
  
  if (priceRange && maxPriceDisplay) {
    maxPriceDisplay.textContent = priceRange.value;
  }
}

// Function to add a book to the cart
function addToCart(bookId) {
  // Find the book in the books array by bookId
  const book = books.find(b => b.id === bookId);  // Ensure book is being fetched properly by product_id
  if (!book || book.stock === 0) return;  // If book is out of stock, do nothing

  // Retrieve the current cart from localStorage or initialize an empty array
  let cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];

  // Check if the book already exists in the cart
  const existingItem = cart.find(item => item.id === bookId);

  if (existingItem) {
    // If the book is already in the cart, update the quantity
    existingItem.quantity += 1;
  } else {
    // Otherwise, add a new item to the cart with the product_id and other necessary fields
    cart.push({
      id: book.id,  // Ensure correct referencing of the product_id
      title: book.title,
      author: book.author,
      price: book.price,
      quantity: 1
    });
  }

  // Save the updated cart back to localStorage
  localStorage.setItem('booknest-cart', JSON.stringify(cart));

  // Update the cart count and re-render the cart
  updateCartCount();
  renderCart();
  
  // Optionally show a success message
  alert(`${book.title} has been added to your cart!`);
}

function updateQuantity(bookId, newQuantity) {
  let cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];

  if (newQuantity <= 0) {
    cart = cart.filter(item => item.id !== bookId);
  } else {
    const item = cart.find(item => item.id === bookId);
    if (item) item.quantity = newQuantity;
  }

  saveCart(cart);
  updateCartCount();
  renderCart();
}

function removeFromCart(bookId) {
  let cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];
  cart = cart.filter(item => item.id !== bookId);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  window.location.href = 'checkout.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function () {
    // Load user data
  const user = JSON.parse(localStorage.getItem('booknest-user'));
  
  if (user) {
    // Update profile name
    document.querySelector('.profile-name').textContent = user.display_name;
    
    // Fetch and update balances
    await fetchUserBalances();
  }
  // Update cart count on page load
  updateCartCount();

  if (document.getElementById('cartContent')) {
    renderCart();
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
      mainContainer.classList.add('cart-layout');
    }
  } else {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', filterBooks);
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', sortBooks);
    }

    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
      priceRange.addEventListener('input', () => {
        updatePriceDisplay();
        filterBooks();
      });
    }

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', filterBooks);
    });

    updatePriceDisplay();
    await loadBooksFromServer(); // fetch from backend
  }
});

//Register Logic
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password')
      };

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          alert('Registered successfully!');
          window.location.href = 'login.html';
        } else {
          alert(result.error || 'Registration failed.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
      }
    });
  }
});

// Login Logic
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          alert('Login successful!');

          // Store user info locally with balance data
          localStorage.setItem('booknest-user', JSON.stringify({
            ...result.user,
            balance: result.user.balance,
            currency_symbol: result.user.currency_symbol
          }));

          // Role-based redirect
          const userRole = result.user.role;
          if (userRole === 'Admin') {
            window.location.href = 'admin.html';
          } 
          else if (userRole == 'Staff'){
            window.location.href = 'staff.html';
          }
          else if (userRole === 'Customer') {
            window.location.href = 'customer.html';
          } else {
            alert('Unknown role. Contact support.');
          }

        } else {
          alert(result.error || 'Login failed.');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Something went wrong.');
      }
    });
  }
});

// Logout function for any page to use
function logout() {
  
  sessionStorage.clear // although session data is not used
  window.location.href = "index.html";
}

async function fetchCartItems(userId) {
  try {
    const response = await fetch(`/api/cart?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch cart items');
    
    const data = await response.json();
    console.log('Cart data:', data); // Log the cart data to confirm it's being fetched correctly
    
    // Return the cart items
    return data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];  // Return an empty array if there's an error
  }
}

// Rendering the cart items
// Function to render the cart
function renderCart() {
  // Retrieve the cart from localStorage
  const cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];
  
  const cartContainer = document.getElementById('cartContent');
  if (!cartContainer) return;
  
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Add some books to get started!</p>
        <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
      </div>
    `;
    return;
  }

  // Calculate the subtotal and total
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal;

  // Render cart items
cartContent.innerHTML = `
  <div class="cart-items">
    ${cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">📚</div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-author">by ${item.author}</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          <div class="cart-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="cart-summary">
    <h3>Order Summary</h3>
    <div class="summary-row">
      <span>Subtotal (${cart.reduce((total, item) => total + item.quantity, 0)} items)</span>
      <span>₱${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>₱${total.toFixed(2)}</span>
    </div>
    
    <div class="checkout-actions">
      <button class="checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
      <a href="index.html" class="continue-shopping-link">Continue Shopping</a>
    </div>
  </div>
`;
}

// Update cart count after adding/removing items
function updateCartCount() {
  // Get the cart from localStorage
  const cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];
  
  // Calculate the total number of items in the cart
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Update the cart count in the header
  const cartCountElement = document.getElementById('cartCount');
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  }
}

// Call this function on page load to update the cart count
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  if (document.getElementById('cartContent')) {
    renderCart();
  }
});


// Function to calculate the total cost of the cart
function getCartTotal() {
  const cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}