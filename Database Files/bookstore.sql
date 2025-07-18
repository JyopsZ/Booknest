-- -----------------------------------------------------
-- Schema bookstore
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS bookstore;
USE bookstore ;

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
  role VARCHAR(20) NOT NULL
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
  name VARCHAR(255) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  author VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,4) NOT NULL,
  stock_quantity INT NOT NULL,
  status ENUM('In-stock', 'Out-of-stock') NOT NULL,
  currency_id INT NOT NULL,
    FOREIGN KEY (currency_id)
    REFERENCES Currencies (currency_id)
);

-- -----------------------------------------------------
-- Table Orders
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Orders (
  order_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date DATE NOT NULL,
  total_amount DECIMAL(10,4) NOT NULL,
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
  price DECIMAL(10,4) NOT NULL,
FOREIGN KEY (order_id)
    REFERENCES Orders (order_id),
FOREIGN KEY (product_id)
    REFERENCES Products (product_id)
);


-- -----------------------------------------------------
-- Table Transaction_Log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Transaction_Log (
  transaction_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  amount DECIMAL(10,4) NOT NULL,
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
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id)
    REFERENCES Users (user_id)
);


-- -----------------------------------------------------
-- Table Stock_Change_Log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Stock_Change_Log (
  stock_log_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (currency_id)
    REFERENCES Currencies (currency_id)
);


-- -----------------------------------------------------
-- Table User_Balance
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS User_Balance (
  balance_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  currency_id INT NOT NULL,
  balance DECIMAL(10,4) NOT NULL,
FOREIGN KEY (user_id)
    REFERENCES Users (user_id),
FOREIGN KEY (currency_id)
    REFERENCES Currencies (currency_id)
);


-- -----------------------------------------------------
-- Table Product_Archive
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Product_Archive (
  product_archive_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  author VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  stock_quantity INT NOT NULL,
  currency_id INT NOT NULL,
FOREIGN KEY (product_id)
    REFERENCES Products (product_id)
);
