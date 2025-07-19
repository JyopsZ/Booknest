-- Product Trigger: Set status to Out-of-stock for books with 0 quantity
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