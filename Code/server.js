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
