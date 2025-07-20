SELECT *FROM Products; -- check if id 6 is out of stock since quantity is 0
SELECT *FROM Orders; -- check if total amount is accurate based on Order_Items
SELECT *FROM User_Balance; -- check if balance is a sum of balance load on that id
SELECT *FROM User_Balance_Load;
SELECT *FROM Transaction_Log; -- check if there is a transaction log

DROP SCHEMA bookstore;