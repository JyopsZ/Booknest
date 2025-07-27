-- -----------------------------------------------------
-- Schema bookstore
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS bookstore;
USE bookstore ;

-- -----------------------------------------------------
-- CORE TABLES
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table Users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(50) NOT NULL,
  phone_num VARCHAR(11) NOT NULL,
  password VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role ENUM('Admin', 'Staff', 'Customer') NOT NULL
);


-- -----------------------------------------------------
-- Table Currencies
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Currencies (
  currency_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  currency_code VARCHAR(5) NOT NULL,
  symbol VARCHAR(5) NOT NULL,
  exchange_rate_to_php DECIMAL(10,4) NOT NULL
);


-- -----------------------------------------------------
-- Table Products
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Products (
  product_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  stock_quantity INT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  description TEXT NULL,
  isBestseller TINYINT(1) DEFAULT 0,
  isNew TINYINT(1) DEFAULT 1,
  status ENUM('In-stock', 'Out-of-stock') NOT NULL DEFAULT 'In-stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  currency_id INT NOT NULL DEFAULT 1,
    FOREIGN KEY (currency_id)
    REFERENCES Currencies (currency_id)
);

-- -----------------------------------------------------
-- Table Orders
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Orders (
  order_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exchange_rate_onOrder DECIMAL(10,4) NOT NULL,
  currency_id INT NOT NULL,
FOREIGN KEY (user_id)
	REFERENCES Users (user_id),
FOREIGN KEY (currency_id)
    REFERENCES Currencies (currency_id)
);

-- -----------------------------------------------------
-- Table Order_Items
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Order_Items (
  order_item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
FOREIGN KEY (order_id)
    REFERENCES Orders (order_id),
FOREIGN KEY (product_id)
    REFERENCES Products (product_id)
);

-- -----------------------------------------------------
-- Table User_Balance
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS User_Balance (
  balance_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  currency_id INT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
FOREIGN KEY (user_id)
    REFERENCES Users (user_id),
FOREIGN KEY (currency_id)
    REFERENCES Currencies (currency_id)
);

-- -----------------------------------------------------
-- Table User_Balance_Load
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS User_Balance_Load (
	balance_load_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    balance_id INT NOT NULL,
    amount_loaded DECIMAL(10,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (balance_id)
	REFERENCES User_Balance (balance_id)
);


-- -----------------------------------------------------
-- LOG/ARCHIVE TABLES
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table Transaction_Log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Transaction_Log (
  transaction_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  payment_status ENUM('Successful', 'Pending', 'Failed') DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (order_id)
    REFERENCES Orders (order_id)
);


-- -----------------------------------------------------
-- Table User_Change_Log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS User_Change_Log (
  user_log_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  field_changed VARCHAR(50) NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- -----------------------------------------------------
-- Table Product_Change_Log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Product_Change_Log (
  product_log_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  field_changed VARCHAR(50) NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (product_id)
    REFERENCES Products (product_id)
);


-- -----------------------------------------------------
-- Table Currency_Change_Log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Currency_Change_Log (
  currency_change_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  currency_id INT NOT NULL,
  old_exchange_rate DECIMAL(10,4) NOT NULL,
  new_exchange_rate DECIMAL(10,4) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table Product_Archive
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Product_Archive (
  product_archive_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  stock_quantity INT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  description TEXT NOT NULL,
  isBestseller TINYINT(1) NOT NULL,
  isNew TINYINT(1) NOT NULL,
  status ENUM('In-stock', 'Out-of-stock') NOT NULL,
  created_at TIMESTAMP NOT NULL,
  currency_id INT NOT NULL
);

-- -----------------------------------------------------
-- USERS
-- -----------------------------------------------------
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'staff'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'customer'@'localhost' IDENTIFIED BY 'password';

-- ADMIN
GRANT ALL PRIVILEGES ON bookstore.* TO 'admin'@'localhost';
SELECT user, host FROM mysql.user;
-- STAFF
GRANT ALL PRIVILEGES ON bookstore.Products TO 'staff'@'localhost';
GRANT SELECT ON bookstore.Orders TO 'staff'@'localhost';
GRANT SELECT ON bookstore.Order_Items TO 'staff'@'localhost';
GRANT SELECT ON bookstore.Transaction_Log TO 'staff'@'localhost';

-- CUSTOMER
GRANT SELECT, INSERT ON bookstore.User_Balance TO 'customer'@'localhost';
GRANT SELECT, INSERT ON bookstore.User_Balance_Load TO 'customer'@'localhost';
GRANT SELECT, INSERT ON bookstore.Orders TO 'customer'@'localhost';
GRANT SELECT, INSERT ON bookstore.Order_Items TO 'customer'@'localhost';
FLUSH PRIVILEGES;