SELECT *FROM Products; -- check if id 6 is out of stock since quantity is 0
SELECT *FROM Orders; -- check if total amount is accurate based on Order_Items
SELECT *FROM User_Balance; -- check if balance is a sum of balance load on that id
SELECT *FROM User_Balance_Load;
SELECT *FROM Transaction_Log; -- check if there is a transaction log

DROP SCHEMA bookstore;

-- Test user change log trigger
UPDATE Users
SET email = 'dian@gmail.com',
	phone_num = '09876543212'
WHERE user_id = 3;

SELECT *FROM Users;
SELECT *FROM User_Change_Log;

-- Test product change log trigger
UPDATE Products
SET rating = 5.0,
	price = 199.00,
    genre = 'Non-Fiction'
WHERE product_id = 8;

SELECT *FROM Products;
SELECT *FROM Product_Change_Log;

-- Test archiving of deleted products
DELETE FROM Products
WHERE product_id = 8;

SELECT *FROM Products;
SELECT *FROM Product_Archive;