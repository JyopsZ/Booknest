-- -----------------------------------------------------
-- Product Trigger: Set status to Out-of-stock for books with 0 quantity
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER change_product_status_onInsert
    BEFORE INSERT ON Products -- Also for create to add books to the system even if there is no stock yet
    FOR EACH ROW
    BEGIN
		IF New.stock_quantity < 0 THEN -- Error if input is negative
			SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Stock quantity cannot be negative.';
		END IF;
        
        IF NEW.stock_quantity = 0 THEN
			SET NEW.status = 'Out-of-stock';
		ELSE
			SET NEW.status = 'In-stock';
		END IF;
	END;
$$ DELIMITER ;

DELIMITER $$
	CREATE TRIGGER change_product_status_onUpdate
    BEFORE UPDATE ON Products
    FOR EACH ROW
    BEGIN
		IF New.stock_quantity < 0 THEN -- Error if input is negative
			SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Stock quantity cannot be negative.';
		END IF;
        
        IF NEW.stock_quantity = 0 THEN
			SET NEW.status = 'Out-of-stock';
		ELSE
			SET NEW.status = 'In-stock';
		END IF;
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- Order Trigger: 	Update total price in Orders table upon INSERT of books to Order_Items table
					-- Updated to also insert values in Transaction_Log 
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER update_total_onItemOrder
    AFTER INSERT ON Order_Items
    FOR EACH ROW
    BEGIN
		DECLARE total DECIMAL(10,2);
        
        SELECT SUM(quantity * price_per_unit) INTO total
        FROM Order_Items
        WHERE order_id = NEW.order_id;
        
        UPDATE Orders
        SET total_amount = total
        WHERE order_id = NEW.order_id;
        
        INSERT INTO Transaction_Log (order_id, total_amount, payment_status)
        VALUES (NEW.order_id, total, 'Successful')
        ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount), -- Handles cases when order is updated, when there is more than 1 Order_Items
								timestamp = CURRENT_TIMESTAMP;
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- Order Trigger: Save exchange_rate_onOrder before insert to Order table
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER set_order_exchangeRate
    BEFORE INSERT ON Orders
    FOR EACH ROW
    BEGIN
		DECLARE rate DECIMAL(10,4);
        
        SELECT exchange_rate_to_php INTO rate
        FROM Currencies
        WHERE currency_id = NEW.currency_id;
        
        SET NEW.exchange_rate_onOrder = rate;
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- User Load Trigger: Update user balance per currency based on the load placed
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER update_user_balance_onLoad
    AFTER INSERT ON User_Balance_Load
    FOR EACH ROW
    BEGIN
		UPDATE User_Balance
        SET balance = balance + NEW.amount_loaded
        WHERE balance_id = NEW.balance_id;
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- User Change Log Trigger: Log changes made to the user table upon update
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER log_user_changes
    AFTER UPDATE ON Users
    FOR EACH ROW
    BEGIN
		IF OLD.display_name <> NEW.display_name THEN
			INSERT INTO User_Change_Log (user_id, field_changed, old_value, new_value)
            VALUES (OLD.user_id, 'display_name', OLD.display_name, NEW.display_name);
		END IF;
        
        IF OLD.email <> NEW.email THEN
			INSERT INTO User_Change_Log (user_id, field_changed, old_value, new_value)
            VALUES (Old.user_id, 'email', OLD.email, NEW.email);
		END IF;
        
        IF OLD.phone_num <> NEW.phone_num THEN
			INSERT INTO User_Change_Log (user_id, field_changed, old_value, new_value)
            VALUES (OLD.user_id, 'phone_num', OLD.phone_num, NEW.phone_num);
		END IF;
        
        IF OLD.password <> NEW.password THEN
			INSERT INTO User_Change_Log (user_id, field_changed, old_value, new_value)
            VALUES (OLD.user_id, 'password', OLD.password, NEW.password);
		END IF;
        
        IF OLD.role <> NEW.role THEN
			INSERT INTO User_Change_Log (user_id, field_changed, old_value, new_value)
            VALUES (Old.user_id, 'role', OLD.role, NEW.role);
		END IF;
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- Product Change Log Trigger: Log changes made to the products table upon update
	-- mirror of the user change log trigger
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER log_product_changes
    AFTER UPDATE ON Products
    FOR EACH ROW
    BEGIN
		IF NEW.title <> OLD.title THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'title', OLD.title, NEW.title);
		END IF;
        
        IF NEW.author <> OLD.author THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'author', OLD.author, NEW.author);
		END IF;
        
        IF NEW.price <> OLD.price THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'price', OLD.price, NEW.price);
		END IF;
        
        IF NEW.genre <> OLD.genre THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'genre', OLD.genre, NEW.genre);
		END IF;
    
		IF NEW.stock_quantity <> OLD.stock_quantity THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
			VALUES (NEW.product_id, 'stock_quantity', OLD.stock_quantity, NEW.stock_quantity);
		END IF;
        
        IF NEW.rating <> OLD.rating THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'rating', OLD.rating, NEW.rating);
		END IF;
        
        IF NEW.description <> OLD.description THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'description', OLD.description, NEW.description);
		END IF;
        
        IF NEW.isBestseller <> OLD.isBestseller THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (New.product_id, 'isBestseller', OLD.isBestseller, NEW.isBestseller);
		END IF;
        
        IF NEW.isNew <> OLD.isNew THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'isNew', OLD.isNew, NEW.isNew);
		END IF;
        
        IF NEW.status <> OLD.status THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'status', OLD.status, NEW.status);
		END IF;
        
        IF NEW.currency_id <> OLD.currency_id THEN
			INSERT INTO Product_Change_Log (product_id, field_changed, old_value, new_value)
            VALUES (NEW.product_id, 'currency_id', OLD.currency_id, NEW.currency_id);
		END IF;
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- Log Exchange Rate Change Trigger: upon change of rate
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER log_change_onExchangeRate
    AFTER UPDATE ON Currencies
    FOR EACH ROW
    BEGIN
		IF NEW.exchange_rate_to_php <> OLD.exchange_rate_to_php THEN
			INSERT INTO Currency_Change_Log (currency_id, old_exchange_rate, new_exchange_rate)
            VALUES (NEW.currency_id, OLD.exchange_rate_to_php, NEW.exchange_rate_to_php);
		END IF;
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- Archive Deleted Products: upon deletion of product
-- -----------------------------------------------------
DELIMITER $$
	CREATE TRIGGER arhive_deleted_product
    AFTER DELETE ON Products
    FOR EACH ROW
    BEGIN
		INSERT INTO Product_Archive (product_id, title, author, price, genre, stock_quantity, rating, description, isBestseller, isNew, status, created_at, currency_id)
        VALUES (OLD.product_id, OLD.title, OLD.author, OLD.price, OLD.genre, OLD.stock_quantity, OLD.rating, OLD.description, OLD.isBestseller, OLD.isNew, OLD.status, OLD.created_at, OLD.currency_id);
	END;
$$ DELIMITER ;

-- -----------------------------------------------------
-- fetch all users
-- -----------------------------------------------------
DELIMITER $$

CREATE PROCEDURE GetAllUsers()
BEGIN
    SELECT 
        user_id,
        display_name,
        email,
        phone_num,
        role,
        created_at
    FROM Users 
    GROUP BY user_id;
END

$$ DELIMITER ;

-- -----------------------------------------------------
-- Get info to display users in admin page
-- -----------------------------------------------------
DELIMITER $$

CREATE PROCEDURE GetUserOrders()
BEGIN
    SELECT 
        u.user_id,
        u.display_name,
        u.email,
        u.role,
        u.created_at,
        IFNULL(COUNT(o.order_id), 0) AS total_orders, 
        IFNULL(SUM(o.total_amount), 0) AS total_spent 
    FROM Users u
    LEFT JOIN Orders o ON u.user_id = o.user_id
    GROUP BY u.user_id; 
END

$$ DELIMITER ;

-- -----------------------------------------------------
-- filtering based on role
-- -----------------------------------------------------

DELIMITER $$

CREATE PROCEDURE GetFilteredUsers(IN searchTerm VARCHAR(255), IN roleFilter VARCHAR(255))
BEGIN
    SELECT 
        u.user_id,
        u.display_name,
        u.email,
        u.role,
        u.created_at,
        IFNULL(COUNT(o.order_id), 0) AS total_orders,
        IFNULL(SUM(o.total_amount), 0) AS total_spent
    FROM Users u
    LEFT JOIN Orders o ON u.user_id = o.user_id
    WHERE (u.display_name LIKE CONCAT('%', searchTerm, '%') OR u.email LIKE CONCAT('%', searchTerm, '%'))
    AND (roleFilter = 'all' OR u.role = roleFilter)
    GROUP BY u.user_id;
END

$$ DELIMITER ;

-- -----------------------------------------------------
-- Add User - Admin
-- -----------------------------------------------------

DELIMITER $$

CREATE PROCEDURE AddUser(
    IN display_name VARCHAR(255),
    IN email VARCHAR(255),
    IN phone_num VARCHAR(20),
    IN password VARCHAR(255),
    IN role VARCHAR(50)
)
BEGIN
    INSERT INTO users (display_name, email, phone_num, password, role, created_at)
    VALUES (display_name, email, phone_num, password, role, NOW());
END

$$ DELIMITER ;

-- -----------------------------------------------------
-- Delete User - Admin
-- -----------------------------------------------------
DELIMITER $$

CREATE PROCEDURE DeleteUser(IN userId INT)
BEGIN
    -- Now, delete the user
    DELETE FROM Users WHERE user_id = userId;
END

$$ DELIMITER ;

-- -----------------------------------------------------
-- search and display for currencies
-- -----------------------------------------------------

DELIMITER $$

CREATE PROCEDURE GetFilteredCurrencies(IN searchTerm VARCHAR(255), IN roleFilter VARCHAR(255))
BEGIN
    SELECT 
        c.currency_id,
        c.currency_code,
        c.symbol,
        c.exchange_rate_to_php
    FROM Currencies c
    WHERE (c.currency_code LIKE CONCAT('%', searchTerm, '%') OR c.symbol LIKE CONCAT('%', searchTerm, '%'))
    AND (roleFilter = 'all' OR c.currency_code = roleFilter);
END

$$ DELIMITER ;

-- -----------------------------------------------------
-- Add currencies
-- -----------------------------------------------------

DELIMITER $$

CREATE PROCEDURE AddCurrency(
    IN currencyCode VARCHAR(5),
    IN symbol VARCHAR(5),
    IN exchangeRate DECIMAL(10,4)
)
BEGIN
    INSERT INTO Currencies (currency_code, symbol, exchange_rate_to_php)
    VALUES (currencyCode, symbol, exchangeRate);
END

$$ DELIMITER ;

-- -----------------------------------------------------
-- Deduct User Balance for Checkout
-- -----------------------------------------------------
DELIMITER $$

CREATE PROCEDURE DeductUserBalance(
  IN p_user_id INT,
  IN p_currency_id INT,
  IN p_total_amount DECIMAL(10,2)
)
BEGIN
  UPDATE User_Balance
  SET balance = balance - p_total_amount
  WHERE user_id = p_user_id AND currency_id = p_currency_id
    AND balance >= p_total_amount;

  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Insufficient balance';
  END IF;
END 

$$ DELIMITER ;

-- -----------------------------------------------------
-- Creat Order for Checkout
-- -----------------------------------------------------
DELIMITER $$

CREATE PROCEDURE CreateOrder(
  IN p_user_id INT,
  IN p_total_amount DECIMAL(10,2),
  IN p_currency_id INT,
  IN p_exchange_rate DECIMAL(10,4),
  OUT p_order_id INT
)
BEGIN
  INSERT INTO Orders (user_id, total_amount, order_date, currency_id, exchange_rate_onOrder)
  VALUES (p_user_id, 0, NOW(), p_currency_id, p_exchange_rate);  

  SET p_order_id = LAST_INSERT_ID();

  SELECT p_order_id AS order_id;
END 

$$ DELIMITER ;

-- -----------------------------------------------------
-- Create Order for Checkout
-- -----------------------------------------------------
DELIMITER $$

CREATE PROCEDURE AddOrderItem(
  IN p_order_id INT,
  IN p_product_id INT,
  IN p_quantity INT,
  IN p_price_per_unit DECIMAL(10,2)
)
BEGIN
  INSERT INTO Order_Items (order_id, product_id, quantity, price_per_unit)
  VALUES (p_order_id, p_product_id, p_quantity, p_price_per_unit);

  UPDATE Products
  SET stock_quantity = stock_quantity - p_quantity
  WHERE product_id = p_product_id AND stock_quantity >= p_quantity;

  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Not enough stock';
  END IF;
END 

$$ DELIMITER ;

-- -----------------------------------------------------
-- Log transactions after checkout
-- -----------------------------------------------------

DELIMITER $$

CREATE PROCEDURE LogTransaction (
  IN p_order_id INT,
  IN p_payment_status VARCHAR(50),
  IN p_total_amount DECIMAL(10,2)
)
BEGIN
  INSERT INTO transaction_log (order_id, payment_status, total_amount, timestamp)
  VALUES (p_order_id, p_payment_status, p_total_amount, NOW());
END

$$ DELIMITER ;