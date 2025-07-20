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
INSERT INTO Orders (user_id, currency_id) -- TODO: save exchange rate from currencies table to exchange_rate_onOrder
VALUES (3, 1), -- 1 midnight library & 1 atomic habits
		(3, 2); -- 1 midnight library in dollar (0.018)			-- total_amount is set to 0, but updated upon each order item selected via trigger
																-- exchange rate is taken from trigger before insert based on currency_id

-- ORDER ITEM DATA
INSERT INTO Order_Items (order_id, product_id, quantity, price_per_unit)
VALUES (1, 1, 1, 699.00),
		(1, 2, 1, 549.00),
        (2, 1, 1, 12.58);
        
-- USER BALANCE DATA
INSERT INTO User_Balance (user_id, currency_id)
VALUES 	(3, 1),
		(3, 2);
        
-- USER BALANCE LOAD DATA
INSERT INTO User_Balance_Load (balance_id, amount_loaded)
VALUES 	(1, 599.00),
		(2, 12.54),
        (1, 1200.00);

SELECT *FROM Orders;
SELECT *FROM Products;
SELECT *FROM User_Balance;
SELECT *FROM User_Balance_Load;