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
  user: 'root',      
  password: '',        
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

// Route to delete currency
app.delete('/api/admin/currencies/:currency_id', (req, res) => {
  const { currency_id } = req.params;  // Extract 'currency_id' from the URL parameter

  // First, delete the related records in the currency_change_log table
  const deleteLogQuery = 'DELETE FROM currency_change_log WHERE currency_id = ?';
  db.query(deleteLogQuery, [currency_id], (err) => {
    if (err) {
      console.error('Error deleting currency change log records:', err);
      return res.status(500).json({ error: 'Database error deleting related records' });
    }

    // Now delete the currency from the Currencies table
    const query = 'DELETE FROM Currencies WHERE currency_id = ?';  // SQL query using 'currency_id'
    db.query(query, [currency_id], (err, results) => {
      if (err) {
        console.error('Error deleting currency:', err);
        return res.status(500).json({ error: 'Database error while deleting currency' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Currency not found' });
      }

      // Successful deletion
      res.json({ message: 'Currency deleted successfully' });
    });
  });
});

// Updated balance endpoint in server.js
app.get('/api/user/balance', (req, res) => {
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required'
    });
  }

  const query = `
    SELECT ub.balance, c.symbol 
    FROM User_Balance ub
    JOIN Currencies c ON ub.currency_id = c.currency_id
    WHERE ub.user_id = ? 
    ORDER BY 
      CASE WHEN c.currency_code = 'PHP' THEN 0 ELSE 1 END
    LIMIT 1
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching user balance:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Database error'
      });
    }
    
    if (results.length === 0) {
      return res.json({ 
        success: true,
        balance: 0.00, 
        symbol: '₱' 
      });
    }
    
    res.json({
      success: true,
      ...results[0]
    });
  });
});

  app.put('/api/products/:productId', (req, res) => {
      const { productId } = req.params;
      const { title, author, genre, price } = req.body;

      const query = `
          UPDATE Products 
          SET title = ?, author = ?, genre = ?, price = ?
          WHERE product_id = ?
      `;

      db.query(query, [title, author, genre, price, productId], (err, result) => {
          if (err) {
              console.error('Error updating product:', err);
              return res.status(500).json({ error: 'Database error' });
          }
          
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Product not found' });
          }

          // Return the updated product
          db.query('SELECT * FROM Products WHERE product_id = ?', [productId], (err, results) => {
              if (err || results.length === 0) {
                  return res.status(500).json({ error: 'Failed to fetch updated product' });
              }
              res.json(results[0]);
          });
      });
  });

  // Update product stock
  app.put('/api/products/:productId/stock', (req, res) => {
      const { productId } = req.params;
      const { stock_quantity } = req.body;

      const query = `
          UPDATE Products 
          SET stock_quantity = ?
          WHERE product_id = ?
      `;

      db.query(query, [stock_quantity, productId], (err, result) => {
          if (err) {
              console.error('Error updating stock:', err);
              return res.status(500).json({ error: 'Database error' });
          }
          
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Product not found' });
          }

          // Return the updated product
          db.query('SELECT * FROM Products WHERE product_id = ?', [productId], (err, results) => {
              if (err || results.length === 0) {
                  return res.status(500).json({ error: 'Failed to fetch updated product' });
              }
              res.json(results[0]);
          });
      });
  });

  app.get('/api/staff/dashboard-stats', (req, res) => {
  // Use Promise.all to execute all queries in parallel
  Promise.all([
    // Total revenue (successful transactions)
    new Promise((resolve, reject) => {
      db.query(
        `SELECT SUM(total_amount) as total_revenue 
         FROM Transaction_Log 
         WHERE payment_status = 'Successful'`,
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]?.total_revenue || 0);
        }
      );
    }),
    // Total transactions count
    new Promise((resolve, reject) => {
      db.query(
        `SELECT COUNT(*) as transaction_count 
         FROM Transaction_Log`,
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]?.transaction_count || 0);
        }
      );
    }),
    // Total products count
    new Promise((resolve, reject) => {
      db.query(
        `SELECT COUNT(*) as product_count 
         FROM Products`,
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]?.product_count || 0);
        }
      );
    })
  ])
  .then(([revenue, transactions, products]) => {
    res.json({
      totalRevenue: revenue,
      totalTransactions: transactions,
      totalProducts: products
    });
  })
  .catch(err => {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  });
});

// Route to get all currencies
app.get('/api/admin/currencies', (req, res) => {
  const query = 'SELECT * FROM Currencies';  // Fetch all currencies from the Currencies table

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching currencies:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);  // Send the result as a response
  });
});

// Route to update the exchange rate of a specific currency to PHP
app.put('/api/admin/currencies/exchange-rate', (req, res) => {
  const { currency_id, exchange_rate_to_php } = req.body;
  console.log('Received currency_id:', currency_id);  // Debugging log

  // Validate the inputs
  if (!currency_id || isNaN(exchange_rate_to_php)) {
    return res.status(400).json({ error: 'Invalid currency ID or exchange rate' });
  }

  const query = 'UPDATE Currencies SET exchange_rate_to_php = ? WHERE currency_id = ?';

  db.query(query, [exchange_rate_to_php, currency_id], (err, results) => {
    if (err) {
      console.error('Error updating exchange rate:', err);
      return res.status(500).json({ error: 'Database error while updating exchange rate' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    res.json({ message: 'Exchange rate updated successfully' });
  });
});

// Route to update currency details (currency_code, symbol, and exchange rate)
app.put('/api/admin/currencies/details', (req, res) => {
  const { currency_id, currency_code, symbol, exchange_rate_to_php } = req.body;

  console.log('Received data for currency update:', req.body);  // Debugging log

  // Validate the inputs
  if (!currency_id || !currency_code || !symbol || isNaN(exchange_rate_to_php)) {
    return res.status(400).json({ error: 'Invalid currency details or exchange rate' });
  }

  const query = `
    UPDATE Currencies
    SET currency_code = ?, symbol = ?, exchange_rate_to_php = ?
    WHERE currency_id = ?
  `;

  // Update the currency details in the database
  db.query(query, [currency_code, symbol, exchange_rate_to_php, currency_id], (err, results) => {
    if (err) {
      console.error('Error updating currency:', err);
      return res.status(500).json({ error: 'Database error while updating currency' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    // Send success response
    res.json({ message: 'Currency updated successfully' });
  });
});

// Route to update user details
app.put('/api/admin/users/:user_id', (req, res) => {
    const { user_id } = req.params;  // Get the user_id from the URL parameter
    const { display_name, email, phone_num, role } = req.body;  // Get the updated data from the request body

    console.log('Received data for user update:', req.body);

    // Validate the required fields
    if (!display_name || !email || !phone_num || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        UPDATE Users
        SET display_name = ?, email = ?, phone_num = ?, role = ?
        WHERE user_id = ?
    `;

    db.query(query, [display_name, email, phone_num, role, user_id], (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            console.log('User not found in the database');
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User updated successfully');
        res.json({ message: 'User updated successfully' });
    });
});

// API route for fetching all users
app.get('/api/admin/users/all', (req, res) => {
    console.log('Fetching all users...');  // Debugging log

    const query = 'CALL GetAllUsers()';  // Stored procedure to fetch all users

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching all users:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log('Fetched users:', results[0]);  // Log the fetched users

        res.json(results[0]);
    });
});