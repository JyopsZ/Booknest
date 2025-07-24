-- -----------------------------------------------------
-- USERS
-- -----------------------------------------------------
-- CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'staff'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'customer'@'localhost' IDENTIFIED BY 'password';

-- ADMIN
-- GRANT ALL PRIVILEGES ON bookstore.* TO 'admin'@'localhost';
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