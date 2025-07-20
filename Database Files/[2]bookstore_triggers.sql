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
        
        INSERT INTO Transaction_Log (order_id, total_amount)
        VALUES (NEW.order_id, total)
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