// server.js
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files like index.html

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Change if your MySQL username differs
  password: '',        // Add your MySQL password if any
  database: 'bookstore'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('MySQL connection failed:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

// Example API: Get all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM Products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/transactions', (req, res) => {
  const query = `
    SELECT tl.*, o.user_id, u.display_name 
    FROM Transaction_Log tl
    JOIN Orders o ON tl.order_id = o.order_id
    JOIN Users u ON o.user_id = u.user_id
    ORDER BY tl.timestamp DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// Register logic for server
app.post('/api/register', (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !password || !phone) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const created_at = new Date();
  const role = 'Customer';

  const query = `
    INSERT INTO Users (display_name, email, phone_num, password, created_at, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [fullName, email, phone, password, created_at, role], (err, result) => {
    if (err) {
      console.error('Registration failed:', err);
      return res.status(500).json({ error: 'Database error during registration.' });
    }
    res.status(201).json({ message: 'Registration successful' });
  });
});

// Login logic for server
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const query = 'SELECT * FROM Users WHERE email = ? LIMIT 1';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Database error during login.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = results[0];

    // (Optional) Use bcrypt to compare hashed passwords instead of plain text
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Strip sensitive data before sending
    delete user.password;

    res.status(200).json({ message: 'Login successful', user });
  });
});

// Use this single API route for fetching and filtering users
app.get('/api/admin/users', (req, res) => {
  const { searchTerm = '', roleFilter = 'All Users' } = req.query;  // Default to 'all' if no role filter is provided

  // Call the stored procedure with search term and role filter
  const query = 'CALL GetFilteredUsers(?, ?)';

  db.query(query, [searchTerm, roleFilter], (err, results) => {
    if (err) {
      console.error('Error fetching filtered users:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results[0]);  // Send back the result from the stored procedure
  });
});

// Route to add a new user
app.post('/api/admin/users', (req, res) => {
  const { display_name, email, phone_num, password, role } = req.body;

  // Validate required fields
  if (!display_name || !email || !phone_num || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Call the stored procedure to add the user
  const query = 'CALL AddUser(?, ?, ?, ?, ?)';

  db.query(query, [display_name, email, phone_num, password, role], (err, results) => {
    if (err) {
      console.error('Error adding user:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: 'User added successfully' });
  });
});

// Admin Delete User
app.delete('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;  // Get the userId from the URL parameter

  // Call the DeleteUser stored procedure
  const query = 'CALL DeleteUser(?)';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// Route to get all currencies with optional search and filter
app.get('/api/admin/currencies', (req, res) => {
  const { searchTerm = '', roleFilter = 'all' } = req.query;  // Default to 'all' if no filter is provided
  
  const query = 'CALL GetFilteredCurrencies(?, ?)';  // Call the stored procedure to filter currencies

  db.query(query, [searchTerm, roleFilter], (err, results) => {
    if (err) {
      console.error('Error fetching filtered currencies:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results[0]);  // Send the result to the frontend
  });
});

// Route to add a new currency
app.post('/api/admin/currencies', (req, res) => {
  const { currencyCode, symbol, exchangeRate } = req.body;

  // Validate required fields
  if (!currencyCode || !symbol || !exchangeRate) {
    return res.status(400).json({ error: 'Currency code, symbol, and exchange rate are required' });
  }

  const query = 'CALL AddCurrency(?, ?, ?)';  // Call the stored procedure to add the currency

  db.query(query, [currencyCode, symbol, exchangeRate], (err, results) => {
    if (err) {
      console.error('Error adding currency:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: 'Currency added successfully' });
  });
});

// Route to add a new currency
app.post('/api/admin/currencies', (req, res) => {
  const { currencyCode, symbol, exchangeRate, currencyActive } = req.body;

  // Validate the required fields
  if (!currencyCode || !symbol || !exchangeRate) {
    return res.status(400).json({ error: 'Currency code, symbol, and exchange rate are required' });
  }

  const query = 'CALL AddCurrency(?, ?, ?)';  // Call the stored procedure to add the currency

  db.query(query, [currencyCode, symbol, exchangeRate], (err, results) => {
    if (err) {
      console.error('Error adding currency:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: 'Currency added successfully' });
  });
});