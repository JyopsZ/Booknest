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
