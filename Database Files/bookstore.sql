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
-- Table Transaction_Log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Transaction_Log (
  transaction_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
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
  balance DECIMAL(10,2) NOT NULL,
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
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  currency_id INT NOT NULL,
FOREIGN KEY (product_id)
    REFERENCES Products (product_id)
);

-- -----------------------------------------------------
-- Initial Data 
-- -----------------------------------------------------


-- -----------------------------------------------------
-- CORE TABLES
-- -----------------------------------------------------
-- USER DATA
INSERT INTO Users (display_name, email, phone_num, password, role)
VALUES ('LanceT', 'lance@gmail.com', '09998887777', 'password', 'Admin'),
		('EmmanT', 'emman@gmail.com', '09884443333', 'password', 'Staff'),
        ('AdrianV', 'adrian@gmail.com', '09112223333', 'password', 'Customer');
        
-- CURRENCY DATA
INSERT INTO Currencies (currency_code, symbol, exchange_rate_to_php)
VALUES ('PHP', '₱', 1.00),
		('USD', '$', '0.018'),
        ('EURO', '€', '0.015');

-- PRODUCT DATA
INSERT INTO Products (title, author, price, genre, stock_quantity, rating, description, isBestseller, isNew)
VALUES ('The Midnight Library', 'Matt Haig', 699.00, 'Fiction', 15, 4.5, 'A dazzling novel about all the choices that go into a life well lived, from the bestselling author.', 1, 0),
		('Atomic Habits', 'James Clear', 549.00, 'Self-Help', 8, 4.8, 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Transform your life with tiny changes.', 1, 0),
        ('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkin Reid', 599.00, 'Romance', 12, 4.6, 'A reclusive Hollywood icon finally tells her story in this captivating novel.', 0, 0),
        ('Dune', 'Frank Herbert', 750.00, 'Science Fiction', 3, 4.4, 'Set on the desert planet Arrakis, this epic sci-fi masterpiece defined a genre.', 0, 0),
        ('The Psychology of Money', 'Morgan Housel', 649.00, 'Business', 6, 4.7, 'Timeless lessons on wealth, greed, and happiness from one of the great financial minds.', 0, 1),
        ('Where the Crawdads Sing', 'Delia Owens', 599.00, 'Mystery', 0, 4.3, 'A coming-of-age story and murder mystery set in the marshlands of North Carolina.', 0, 0),
        ('1984', 'George Orwell', 399.00, 'Dystopian', 10, 4.7, 'A chilling dystopian novel about totalitarian control and the power of truth.', 0, 0),
        ('The Lord of the Rings', 'J.R.R. Tolkien', 899.00, 'Fantasy', 5, 4.9, 'The epic fantasy trilogy that defined a genre and captured millions of hearts.', 1, 0);

-- ORDER DATA
INSERT INTO Orders (user_id, total_amount, exchange_rate_onOrder, currency_id) -- TODO: save exchange rate from currencies table to exchange_rate_onOrder
VALUES (3, 1248.00, 1, 1), -- 1 midnight library & 1 atomic habits
		(3, 12.58, 0.018, 2); -- 1 midnight library in dollar (0.018)

-- ORDER ITEM DATA
INSERT INTO Order_Items (order_id, product_id, quantity, price_per_unit)
VALUES (1, 1, 1, 699.00),
		(1, 2, 1, 549.00),
        (2, 1, 1, 12.58);
        
-- USER BALANCE DATA
INSERT INTO User_Balance (user_id, currency_id, balance)
VALUES (3, 1, 1245.00),
		(3, 2, 13.15);
