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

  const query = `
    SELECT u.*, ub.balance, c.symbol, c.currency_code
    FROM Users u
    LEFT JOIN User_Balance ub ON u.user_id = ub.user_id
    LEFT JOIN Currencies c ON ub.currency_id = c.currency_id
    WHERE u.email = ? 
    LIMIT 1
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Database error during login.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Get all balances for the user
    const balancesQuery = `
      SELECT ub.balance, c.currency_code, c.symbol 
      FROM User_Balance ub
      JOIN Currencies c ON ub.currency_id = c.currency_id
      WHERE ub.user_id = ?
    `;

    db.query(balancesQuery, [user.user_id], (err, balanceResults) => {
      if (err) {
        console.error('Error fetching balances:', err);
        return res.status(500).json({ error: 'Database error during login.' });
      }

      // Find primary balance (PHP)
      const primaryBalance = balanceResults.find(b => b.currency_code === 'PHP') || balanceResults[0];

      // Format the response
      const response = {
        message: 'Login successful',
        user: {
          ...user,
          balance: primaryBalance ? primaryBalance.balance : 0.00,
          currency_symbol: primaryBalance ? primaryBalance.symbol : '₱',
          balances: balanceResults
        }
      };

      // Strip sensitive data before sending
      delete response.user.password;

      res.status(200).json(response);
    });
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

app.get('/api/user/balances', (req, res) => {
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required'
    });
  }

  const query = `
    SELECT ub.balance, c.currency_code, c.symbol 
    FROM User_Balance ub
    JOIN Currencies c ON ub.currency_id = c.currency_id
    WHERE ub.user_id = ?
    ORDER BY 
      CASE WHEN c.currency_code = 'PHP' THEN 0 ELSE 1 END
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching user balances:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Database error'
      });
    }
    
    res.json({
      success: true,
      balances: results
    });
  });
});

app.get('/api/user/orders', (req, res) => {
  const userId = req.query.user_id;

  const sql = `
    SELECT o.order_id, o.total_amount, cu.currency_code, o.order_date, oi.product_id, p.title AS product_title, oi.quantity
    FROM Orders o
    JOIN Order_Items oi ON o.order_id = oi.order_id
    JOIN Products p ON oi.product_id = p.product_id
    JOIN Currencies cu ON o.currency_id = cu.currency_id
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC, o.order_id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching order history:', err);
      return res.status(500).json({ error: 'Failed to fetch orders.' });
    }

    // Group items by order_id
    const ordersMap = {};
    results.forEach(row => {
      const orderId = row.order_id;
      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          order_id: orderId,
          order_date: row.order_date,
          total_amount: row.total_amount,
          currency: row.currency_code,
          items: []
        };
      }

      ordersMap[orderId].items.push({
        product_id: row.product_id,
        title: row.product_title,
        quantity: row.quantity
      });
    });

    const orders = Object.values(ordersMap);
    res.json(orders);
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

// Load Money API endpoint
app.post('/api/user/load-money', (req, res) => {
  const { user_id, amount, currency_code } = req.body;

  // Validate inputs...

  // First get currency_id
  const getCurrencyQuery = 'SELECT currency_id FROM Currencies WHERE currency_code = ?';
  
  db.query(getCurrencyQuery, [currency_code], (err, currencyResults) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (currencyResults.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid currency code' });
    }

    const currency_id = currencyResults[0].currency_id;

    // Check if user has a balance record
    const checkBalanceQuery = 'SELECT balance_id FROM User_Balance WHERE user_id = ? AND currency_id = ?';
    
    db.query(checkBalanceQuery, [user_id, currency_id], (err, balanceResults) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      let balance_id;
      
      if (balanceResults.length > 0) {
        balance_id = balanceResults[0].balance_id;
      } else {
        // Create new balance record if none exists
        const insertBalanceQuery = 'INSERT INTO User_Balance (user_id, currency_id, balance) VALUES (?, ?, 0)';
        db.query(insertBalanceQuery, [user_id, currency_id], (err, insertResults) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          balance_id = insertResults.insertId;
        });
      }

      // Insert the load record (trigger will handle balance update)
      const insertLoadQuery = 'INSERT INTO User_Balance_Load (balance_id, amount_loaded) VALUES (?, ?)';
      
      db.query(insertLoadQuery, [balance_id, amount], (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Get updated balances to return to client
        const getBalancesQuery = `
          SELECT ub.balance, c.currency_code, c.symbol 
          FROM User_Balance ub
          JOIN Currencies c ON ub.currency_id = c.currency_id
          WHERE ub.user_id = ?
        `;

        db.query(getBalancesQuery, [user_id], (err, updatedBalances) => {
          if (err) {
            return res.status(500).json({ 
              success: false,
              message: 'Balance updated but failed to fetch updated balances' 
            });
          }

          res.json({
            success: true,
            message: `Successfully loaded ${amount} ${currency_code} to your wallet`,
            balances: updatedBalances
          });
        });
      });
    });
  });
});

//Route for cart
app.get('/api/cart', (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
    SELECT p.title, p.author, oi.quantity, p.price, oi.product_id
    FROM Order_Items oi
    JOIN Products p ON oi.product_id = p.product_id
    JOIN Orders o ON oi.order_id = o.order_id
    WHERE o.user_id = ? AND o.status = 'In-progress'`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error while fetching cart' });
    }

    // Check if results are returned
    if (results.length === 0) {
      return res.json([]); // Return an empty array if no items in cart
    }

    // Map the results to match the frontend structure
    const cartItems = results.map(item => ({
      id: item.product_id,
      title: item.title,
      author: item.author,
      price: parseFloat(item.price),
      quantity: item.quantity
    }));

    res.json(cartItems); 
  });
});

// This just inserts the book in the addModalSaveBtn form.
app.post('/api/products', (req, res) => {
    const { title, author, price, genre, stock_quantity, description, isBestseller, isNew, currency_id } = req.body;

    // Validate required fields
    if (!title || !author || !price) {
        return res.status(400).json({ error: 'Title, author and price are required' });
    }

    const query = `
        INSERT INTO Products 
        (title, author, price, genre, stock_quantity, description, isBestseller, isNew, currency_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, 
        [title, author, price, genre, stock_quantity, description, isBestseller, isNew, currency_id], 
        (err, results) => {
            if (err) {
                console.error('Error adding product:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Product added successfully', productId: results.insertId });
        }
    );
});

app.post('/api/user/exchange-currency', async (req, res) => {
    const { user_id, from_currency, to_currency, amount, exchange_rate } = req.body;

    try {
        // Start transaction
        await db.promise().beginTransaction();

        // 1. Deduct from source currency balance
        const deductQuery = `
            UPDATE User_Balance ub
            JOIN Currencies c ON ub.currency_id = c.currency_id
            SET ub.balance = ub.balance - ?
            WHERE ub.user_id = ? AND c.currency_code = ? AND ub.balance >= ?
        `;
        
        const [deductResult] = await db.promise().query(deductQuery, 
            [amount, user_id, from_currency, amount]);
        
        if (deductResult.affectedRows === 0) {
            await db.promise().rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient balance or currency not found' 
            });
        }

        // 2. Get PHP currency_id
        const [phpCurrency] = await db.promise().query(
            'SELECT currency_id FROM Currencies WHERE currency_code = ?', ['PHP']);
        
        if (phpCurrency.length === 0) {
            await db.promise().rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'PHP currency not found' 
            });
        }

        const phpCurrencyId = phpCurrency[0].currency_id;
        const convertedAmount = amount * exchange_rate;

        // 3. Check if PHP balance exists
        const [existingBalance] = await db.promise().query(
            'SELECT balance FROM User_Balance WHERE user_id = ? AND currency_id = ?',
            [user_id, phpCurrencyId]
        );

        if (existingBalance.length > 0) {
            // Update existing PHP balance by ADDING the converted amount
            await db.promise().query(
                'UPDATE User_Balance SET balance = balance + ? WHERE user_id = ? AND currency_id = ?',
                [convertedAmount, user_id, phpCurrencyId]
            );
        } else {
            // Create new PHP balance with the converted amount
            await db.promise().query(
                'INSERT INTO User_Balance (user_id, currency_id, balance) VALUES (?, ?, ?)',
                [user_id, phpCurrencyId, convertedAmount]
            );
        }

        // 4. Commit transaction
        await db.promise().commit();

        // 5. Return updated balances
        const [balances] = await db.promise().query(`
            SELECT ub.balance, c.currency_code, c.symbol 
            FROM User_Balance ub
            JOIN Currencies c ON ub.currency_id = c.currency_id
            WHERE ub.user_id = ?
        `, [user_id]);

        res.json({
            success: true,
            message: 'Currency exchanged successfully',
            balances: balances
        });

    } catch (error) {
        await db.promise().rollback();
        console.error('Exchange error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database error during exchange' 
        });
    }
});

// Checkout route
app.post('/api/checkout', (req, res) => {
  const { user_id, currency_id, total_amount, exchange_rate, cart } = req.body;

  if (!user_id || !currency_id || !total_amount || !cart || cart.length === 0) {
    return res.status(400).json({ error: 'Missing checkout details' });
  }

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Failed to start transaction' });

    db.query('CALL DeductUserBalance(?, ?, ?)', [user_id, currency_id, total_amount], (err) => {
      if (err) return db.rollback(() => res.status(500).json({ error: 'Failed to deduct balance' }));

      db.query('CALL CreateOrder(?, ?, ?, ?, @order_id)', [user_id, total_amount, currency_id, exchange_rate], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: 'Failed to create order' }));

        db.query('SELECT @order_id AS order_id', (err, results) => {
          if (err) return db.rollback(() => res.status(500).json({ error: 'Failed to retrieve order ID' }));

          const order_id = results[0].order_id;
          let remaining = cart.length;

          for (const item of cart) {
            db.query(
              'CALL AddOrderItem(?, ?, ?, ?)',
              [order_id, item.product_id, item.quantity, item.price_per_unit],
              err => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'Failed to add item to order' }));

                remaining--;
                if (remaining === 0) {
                  db.query(
                    'CALL LogTransaction(?, ?, ?)',
                    [order_id, 'Success', total_amount],
                    err => {
                      if (err) return db.rollback(() => res.status(500).json({ error: 'Failed to log transaction' }));

                      db.commit(err => {
                        if (err) return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
                        res.json({ success: true, order_id });
                      });
                    }
                  );
                }
              }
            );
          }
        });
      });
    });
  });
});
