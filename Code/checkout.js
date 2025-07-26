let currentStep = 'shipping';
let checkoutData = {
  shipping: {},
  payment: {},
  cart: []
};

const shippingRates = {
  standard: 99,
  express: 199,
  overnight: 399
};

// Initialize checkout
document.addEventListener('DOMContentLoaded', function() {
  // Load cart data
  checkoutData.cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];
  
  // If cart is empty, redirect to cart page
  if (checkoutData.cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }
  
  // Initialize checkout
  updateCartCount();
  renderOrderSummary();
  setupEventListeners();
  updateNavigationButtons();
  
  // Add checkout-layout class to main container
  const mainContainer = document.querySelector('.main-container');
  if (mainContainer) {
    mainContainer.classList.add('checkout-layout');
  }
});

function setupEventListeners() {
  const shippingInputs = document.querySelectorAll('input[name="shipping"]');
  if (shippingInputs.length > 0) {
    shippingInputs.forEach(radio => {
      radio.addEventListener('change', function () {
        updateShippingCost();
        renderOrderSummary();
      });
    });
  }

  const confirmBtn = document.querySelector('.confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmOrder);
  }
}

function updateShippingCost() {
  const selectedShipping = document.querySelector('input[name="shipping"]:checked');
  if (selectedShipping) {
    const shippingCost = shippingRates[selectedShipping.value];
    document.getElementById('shippingAmount').textContent = `₱${shippingCost}`;
    calculateTotal();
  }
}

function togglePaymentDetails() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const cardDetails = document.getElementById('cardDetails');
  const digitalWallet = document.getElementById('digitalWallet');
  
  if (selectedMethod === 'card') {
    cardDetails.classList.remove('hidden');
    digitalWallet.classList.add('hidden');
  } else {
    cardDetails.classList.add('hidden');
    digitalWallet.classList.remove('hidden');
  }
}

function renderOrderSummary() {
  const summaryItems = document.getElementById('summaryItems');
  const itemCount = document.getElementById('itemCount');
  const subtotalAmount = document.getElementById('subtotalAmount');
  
  // Calculate totals
  const totalItems = checkoutData.cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = checkoutData.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Update counts and subtotal
  itemCount.textContent = totalItems;
  subtotalAmount.textContent = `₱${subtotal}`;
  
  // Render items
  summaryItems.innerHTML = checkoutData.cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-details">
        <div class="summary-item-title">${item.title}</div>
        <div class="summary-item-author">by ${item.author}</div>
        <span class="summary-item-qty">Qty: ${item.quantity}</span>
      </div>
      <div class="summary-item-price">₱${item.price * item.quantity}</div>
    </div>
  `).join('');
  
  calculateTotal();
}

function calculateTotal() {
  const subtotal = checkoutData.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal;
  
  document.getElementById('subtotalAmount').textContent = `₱${subtotal}`;
  document.getElementById('totalAmount').textContent = `₱${total}`;
}

function goToStep(step) {
  // Hide current step
  document.getElementById(currentStep + 'Step').classList.add('hidden');
  document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
  
  // Show new step
  currentStep = step;
  document.getElementById(currentStep + 'Step').classList.remove('hidden');
  document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
  
  updateNavigationButtons();
}

function nextStep() {
  if (!validateCurrentStep()) {
    return;
  }
  
  // Save current step data
  saveCurrentStepData();
  
  // Determine next step
  const steps = ['shipping', 'payment', 'review', 'confirmation'];
  const currentIndex = steps.indexOf(currentStep);
  
  if (currentIndex < steps.length - 1) {
    const nextStep = steps[currentIndex + 1];
    
    // Mark current step as completed
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('completed');
    
    // Special handling for review step
    if (nextStep === 'review') {
      populateReviewStep();
    }
    
    // Special handling for confirmation step
    if (nextStep === 'confirmation') {
      processOrder();
    }
    
    goToStep(nextStep);
  }
}

function previousStep() {
  const steps = ['shipping', 'payment', 'review', 'confirmation'];
  const currentIndex = steps.indexOf(currentStep);
  
  if (currentIndex > 0) {
    const prevStep = steps[currentIndex - 1];
    
    // Remove completed status from current step
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('completed');
    
    goToStep(prevStep);
  }
}

function clearFieldErrors(event) {
  // Clear error styling when user starts typing
  if (event.target.style.borderColor === 'rgb(211, 47, 47)') {
    event.target.style.borderColor = '#a1887f';
  }
}

function validateCurrentStep() {
  const currentForm = document.getElementById(currentStep + 'Form');
  if (!currentForm) return true;
  
  const requiredFields = currentForm.querySelectorAll('input[required], select[required]');
  let isValid = true;
  let errorFields = [];
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#d32f2f';
      errorFields.push(field);
      isValid = false;
    } else {
      field.style.borderColor = '#a1887f';
    }
  });
  
  // Special validation for card details if card payment is selected
  if (currentStep === 'payment') {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (paymentMethod === 'card') {
      const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
      const expiryDate = document.getElementById('expiryDate').value;
      const cvv = document.getElementById('cvv').value;
      const cardName = document.getElementById('cardName').value;
      
      if (!cardNumber || cardNumber.length < 13) {
        document.getElementById('cardNumber').style.borderColor = '#d32f2f';
        errorFields.push(document.getElementById('cardNumber'));
        isValid = false;
      } else {
        document.getElementById('cardNumber').style.borderColor = '#a1887f';
      }
      
      if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
        document.getElementById('expiryDate').style.borderColor = '#d32f2f';
        errorFields.push(document.getElementById('expiryDate'));
        isValid = false;
      } else {
        document.getElementById('expiryDate').style.borderColor = '#a1887f';
      }
      
      if (!cvv || cvv.length < 3) {
        document.getElementById('cvv').style.borderColor = '#d32f2f';
        errorFields.push(document.getElementById('cvv'));
        isValid = false;
      } else {
        document.getElementById('cvv').style.borderColor = '#a1887f';
      }
      
      if (!cardName.trim()) {
        document.getElementById('cardName').style.borderColor = '#d32f2f';
        errorFields.push(document.getElementById('cardName'));
        isValid = false;
      } else {
        document.getElementById('cardName').style.borderColor = '#a1887f';
      }
    }
  }
  
  if (!isValid && errorFields.length > 0) {
    // Focus on first error field
    errorFields[0].focus();
    
    // Show a more specific error message
    const stepName = currentStep.charAt(0).toUpperCase() + currentStep.slice(1);
    alert(`Please complete all required fields in the ${stepName} section.`);
  }
  
  return isValid;
}

function saveCurrentStepData() {
  if (currentStep === 'shipping') {
    const form = document.getElementById('shippingForm');
    const formData = new FormData(form);
    checkoutData.shipping = Object.fromEntries(formData);
  } else if (currentStep === 'payment') {
    const form = document.getElementById('paymentForm');
    const formData = new FormData(form);
    checkoutData.payment = Object.fromEntries(formData);
    
    // Don't store sensitive card data in full
    if (checkoutData.payment.paymentMethod === 'card') {
      checkoutData.payment.cardNumberMasked = '**** **** **** ' + checkoutData.payment.cardNumber.slice(-4);
      delete checkoutData.payment.cardNumber;
      delete checkoutData.payment.cvv;
    }
  }
}

function populateReviewStep() {
  // Populate shipping info
  const shippingInfo = document.getElementById('reviewShipping');
  const shipping = checkoutData.shipping;
  const selectedShippingMethod = document.querySelector('input[name="shipping"]:checked');
  const shippingMethodText = selectedShippingMethod.parentElement.querySelector('.option-text').textContent;
  
  shippingInfo.innerHTML = `
    <p><strong>${shipping.firstName} ${shipping.lastName}</strong></p>
    <p>${shipping.address}</p>
    ${shipping.apartment ? `<p>${shipping.apartment}</p>` : ''}
    <p>${shipping.city}, ${shipping.state} ${shipping.zipCode}</p>
    <p>${shipping.email}</p>
    ${shipping.phone ? `<p>${shipping.phone}</p>` : ''}
    <p><strong>Shipping:</strong> ${shippingMethodText}</p>
  `;
  
  // Populate payment info
  const paymentInfo = document.getElementById('reviewPayment');
  const payment = checkoutData.payment;
  
  if (payment.paymentMethod === 'card') {
    paymentInfo.innerHTML = `
      <p><strong>Credit/Debit Card</strong></p>
      <p>${payment.cardNumberMasked || 'Card ending in ****'}</p>
      <p>${payment.cardName}</p>
    `;
  } else {
    paymentInfo.innerHTML = `
      <p><strong>${payment.paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'}</strong></p>
      <p>Digital wallet payment</p>
    `;
  }
  
  // Populate order items
  const reviewItems = document.getElementById('reviewItems');
  reviewItems.innerHTML = checkoutData.cart.map(item => `
    <div class="review-item">
      <div class="review-item-image">📚</div>
      <div class="review-item-details">
        <div class="review-item-title">${item.title}</div>
        <div class="review-item-author">by ${item.author}</div>
        <div>Qty: ${item.quantity}</div>
      </div>
      <div class="review-item-price">₱${item.price * item.quantity}</div>
    </div>
  `).join('');
}

function processOrder() {
  // Generate order number
  const orderNumber = 'BN' + Date.now().toString().slice(-8);
  document.getElementById('orderNumber').textContent = orderNumber;
  
  // Calculate estimated delivery
  const selectedShipping = document.querySelector('input[name="shipping"]:checked').value;
  const today = new Date();
  let deliveryDays;
  
  switch (selectedShipping) {
    case 'standard':
      deliveryDays = 7;
      break;
    case 'express':
      deliveryDays = 3;
      break;
    case 'overnight':
      deliveryDays = 1;
      break;
    default:
      deliveryDays = 7;
  }
  
  const deliveryDate = new Date(today.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  document.getElementById('estimatedDelivery').textContent = deliveryDate.toLocaleDateString('en-US', options);
  
  // Clear cart
  localStorage.removeItem('booknest-cart');
  
  // Store order for potential future reference
  const orderData = {
    orderNumber,
    date: new Date().toISOString(),
    shipping: checkoutData.shipping,
    payment: { paymentMethod: checkoutData.payment.paymentMethod },
    items: checkoutData.cart,
    total: document.getElementById('totalAmount').textContent
  };
  
  // In a real app, you would send this to your backend
  console.log('Order processed:', orderData);
}

function updateNavigationButtons() {
  const currentStepElement = document.querySelector(`.progress-step[data-step="${currentStep}"]`);
  if (currentStepElement) {
    // Make sure no other steps are marked active
    document.querySelectorAll('.progress-step').forEach(step => step.classList.remove('active'));
    currentStepElement.classList.add('active');
  }
}


// Format card number input
document.addEventListener('DOMContentLoaded', function() {
  const cardNumberInput = document.getElementById('cardNumber');
  const expiryInput = document.getElementById('expiryDate');
  
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = value;
    });
  }
  
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
});

function calculateTotal() {
  const subtotal = checkoutData.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate the total (same as subtotal, no tax or shipping)
  const total = subtotal;

  // Update DOM elements for the subtotal and total
  document.getElementById('subtotalAmount').textContent = `₱${subtotal.toFixed(2)}`;
  document.getElementById('totalAmount').textContent = `₱${total.toFixed(2)}`;

  // Log values for debugging
  console.log("Subtotal:", subtotal);
  console.log("Total:", total);
}

// Confirm Order 
async function confirmOrder() {
  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn.disabled = true; // Disable button to prevent multiple clicks

  const user = JSON.parse(localStorage.getItem('booknest-user'));
  const cart = JSON.parse(localStorage.getItem('booknest-cart')) || [];

  // Log user data and cart data for debugging
  console.log("User data:", user);  // Check if user is loaded correctly
  console.log("Cart data:", cart);  // Check if cart data is loaded correctly

  if (!user || cart.length === 0) {
    alert('User not logged in or cart is empty.');
    checkoutBtn.disabled = false; // Re-enable the button
    return;
  }

  // Calculate the total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  console.log("Total Amount:", total);  // Log the total to ensure it's correct

  const payload = {
    user_id: user.user_id,
    currency_id: 1, // PHP
    exchange_rate: 1.0,
    total_amount: total,
    cart: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price_per_unit: item.price
    }))
  };

  console.log('Sending payload to /api/checkout:', payload);  // Log the payload

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data;

    try {
      data = await res.json(); // Try parsing response as JSON
    } catch (e) {
      const text = await res.text(); // Fallback to raw response
      console.error('Server returned non-JSON:', text);
      throw new Error('Invalid JSON response: ' + text);
    }

    if (res.ok && data.success) {
      alert('Checkout Successful!');
      localStorage.removeItem('booknest-cart');
      window.location.href = 'customer.html';
    } else {
      // Only alert if there is an error
      alert(data.error || 'Checkout failed.');
    }

  } catch (err) {
    console.error('Error confirming order:', err);
    alert('Checkout error. Please try again.');
  } finally {
    checkoutBtn.disabled = false; // Re-enable the button
  }
}


