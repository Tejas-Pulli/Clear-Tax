use TaxCalculationDb

select * from users;
select * from income;
select * from deduction;
select * from tax_calculation;
select * from tax_filling;
select * from tax_payment;
select * from tax_refund;

--drop table users
--drop table income
--drop table deduction
--drop table tax_filling
--drop table tax_payment
--drop table tax_refund
--drop table tax_calculation

--delete from users where user_id=3
--delete from deduction
--delete from income where income_id=314
--delete from deduction where deduction_id=20
--delete from deduction where user_id =4 and is_amended=1;
--delete from tax_filling where tax_filing_id=36
--delete from tax_payment where user_id=8
--delete from tax_refund where tax_refund_id=8
--delete from tax_calculation where tax_calculation_id=121
--delete from tax_payment where tax_payment_id=67

--update tax_payment set tax_calculation_id=6 where tax_payment_id=5
--update tax_payment set transaction_id=null where user_id=5
--update tax_payment set payment_status='Pending' where user_id=5
--ALTER TABLE tax_calculation ADD isAmended int DEFAULT 0 NOT NULL ;
--ALTER TABLE income ADD isAmended int DEFAULT 0 NOT NULL ;
--ALTER TABLE deduction ADD isAmended int DEFAULT 0 NOT NULL ;
--update tax_refund set refund_date='2025-02-05' where tax_refund_id=1

--delete from tax_refund;
--delete from tax_payment;
--delete from tax_filling;
--delete from tax_calculation;
--delete from income;
--delete from deduction;

--update tax_refund set refund_date='2025-02-11' where user_id=5



--===============================******************************adding incomes
--DECLARE @user_id INT, @year INT, @income_date DATE, @source NVARCHAR(50), @num_sources INT, @i INT;

---- Income sources list (allowing some sources to appear multiple times)
--DECLARE @income_sources TABLE (income_source NVARCHAR(50));
--INSERT INTO @income_sources VALUES 
--('Salary'), ('Business'), ('Business'), ('Rental'), ('Rental'), ('Capital Gains'), 
--('Interest'), ('Interest'), ('Other Incomes');

---- Loop through each user
--DECLARE user_cursor CURSOR FOR 
--SELECT user_id FROM (VALUES (2), (3), (4), (5), (6), (7), (8), (9), (10), (11)) AS Users(user_id);

--OPEN user_cursor;
--FETCH NEXT FROM user_cursor INTO @user_id;

--WHILE @@FETCH_STATUS = 0
--BEGIN
--    -- Loop through each year
--    DECLARE year_cursor CURSOR FOR 
--    SELECT year FROM (VALUES (2023), (2024), (2025)) AS Years(year);

--    OPEN year_cursor;
--    FETCH NEXT FROM year_cursor INTO @year;

--    WHILE @@FETCH_STATUS = 0
--    BEGIN
--        -- Generate a fixed income date for this user and year
--        SET @income_date = CAST(@year AS CHAR(4)) + '-04-15'; -- Example: April 15 of that year

--        -- Decide how many sources this user will have (at least 1, at most 6)
--        SET @num_sources = (ABS(CHECKSUM(NEWID())) % 6) + 1; -- Random 1 to 6 sources

--        -- Insert random sources from the income list
--        SET @i = 0;
--        WHILE @i < @num_sources
--        BEGIN
--            -- Pick a random income source from the list
--            SELECT TOP 1 @source = income_source FROM @income_sources ORDER BY NEWID();

--            -- Insert income record with amount between 500,000 and 1,000,000
--            INSERT INTO income (amount, income_date, user_id, income_source, is_amended) VALUES
--            (ROUND(RAND() * 900000 + 500000, 2), @income_date, @user_id, @source, 0);

--            SET @i = @i + 1;
--        END

--        -- Move to next year
--        FETCH NEXT FROM year_cursor INTO @year;
--    END

--    CLOSE year_cursor;
--    DEALLOCATE year_cursor;

--    -- Move to next user
--    FETCH NEXT FROM user_cursor INTO @user_id;
--END

--CLOSE user_cursor;
--DEALLOCATE user_cursor;

--+================================***********************************Adding deduction 
--DECLARE @user_id INT, @year INT, @deduction_date DATE, @deduction_type NVARCHAR(50), @num_deductions INT, @i INT;

---- Deduction sources list (allowing some sources to appear multiple times)
--DECLARE @deduction_sources TABLE (deduction_type NVARCHAR(50));
--INSERT INTO @deduction_sources VALUES 
--('Home Loan Interest'), ('Medical Expenses'), ('Medical Expenses'), ('Charitable Donations'), 
--('Education Expenses'), ('Education Expenses'), ('Retirement Contributions'), ('Other Deductions');

---- Loop through each user
--DECLARE user_cursor CURSOR FOR 
--SELECT user_id FROM (VALUES (2), (3), (4), (5), (6), (7), (8), (9), (10), (11)) AS Users(user_id);

--OPEN user_cursor;
--FETCH NEXT FROM user_cursor INTO @user_id;

--WHILE @@FETCH_STATUS = 0
--BEGIN
--    -- Loop through each year
--    DECLARE year_cursor CURSOR FOR 
--    SELECT year FROM (VALUES (2023), (2024), (2025)) AS Years(year);

--    OPEN year_cursor;
--    FETCH NEXT FROM year_cursor INTO @year;

--    WHILE @@FETCH_STATUS = 0
--    BEGIN
--        -- Generate a fixed deduction date for this user and year
--        SET @deduction_date = CAST(@year AS CHAR(4)) + '-06-10'; -- Example: June 10 of that year

--        -- Decide how many deductions this user will have (at least 1, at most 6)
--        SET @num_deductions = (ABS(CHECKSUM(NEWID())) % 6) + 1; -- Random 1 to 6 deductions

--        -- Insert random deductions from the deduction list
--        SET @i = 0;
--        WHILE @i < @num_deductions
--        BEGIN
--            -- Pick a random deduction type from the list
--            SELECT TOP 1 @deduction_type = deduction_type FROM @deduction_sources ORDER BY NEWID();

--            -- Insert deduction record with amount between 50,000 and 500,000
--            INSERT INTO deduction (amount, deduction_date, user_id, deduction_type, is_Amended) VALUES
--            (ROUND(RAND() * 450000 + 50000, 2), @deduction_date, @user_id, @deduction_type, 0);

--            SET @i = @i + 1;
--        END

--        -- Move to next year
--        FETCH NEXT FROM year_cursor INTO @year;
--    END

--    CLOSE year_cursor;
--    DEALLOCATE year_cursor;

--    -- Move to next user
--    FETCH NEXT FROM user_cursor INTO @user_id;
--END

--CLOSE user_cursor;
--DEALLOCATE user_cursor;

--==============================***************************inserting into tax_calculation

--DECLARE @userId INT;
--DECLARE @year INT;
--DECLARE @grossIncome DECIMAL(18, 2);
--DECLARE @totalDeductions DECIMAL(18, 2);
--DECLARE @taxableIncome DECIMAL(18, 2);
--DECLARE @tax DECIMAL(18, 2);

---- Loop through user_id from 2 to 11 and years 2023, 2024, and 2025
--DECLARE user_cursor CURSOR FOR
--    SELECT user_id
--    FROM (VALUES (2), (3), (4), (5), (6), (7), (8), (9), (10), (11)) AS user_ids(user_id);

--OPEN user_cursor;

--FETCH NEXT FROM user_cursor INTO @userId;

--WHILE @@FETCH_STATUS = 0
--BEGIN
--    -- Loop through years 2023, 2024, and 2025
--    DECLARE year_cursor CURSOR FOR
--        SELECT 2023 AS year UNION ALL
--        SELECT 2024 UNION ALL
--        SELECT 2025;

--    OPEN year_cursor;
--    FETCH NEXT FROM year_cursor INTO @year;

--    WHILE @@FETCH_STATUS = 0
--    BEGIN
--        -- Check if income and deductions exist for the user and year
--        IF EXISTS (SELECT 1 FROM income WHERE user_id = @userId AND YEAR(income_date) = @year)
--           AND EXISTS (SELECT 1 FROM deduction WHERE user_id = @userId AND YEAR(deduction_date) = @year)
--        BEGIN
--            -- Calculate Gross Income
--            SELECT @grossIncome = SUM(amount)
--            FROM income
--            WHERE user_id = @userId AND YEAR(income_date) = @year;

--            IF @grossIncome IS NULL
--                SET @grossIncome = 0;

--            -- Calculate Total Deductions
--            SELECT @totalDeductions = SUM(amount)
--            FROM deduction
--            WHERE user_id = @userId AND YEAR(deduction_date) = @year;

--            IF @totalDeductions IS NULL
--                SET @totalDeductions = 0;

--            -- Calculate Taxable Income
--            SET @taxableIncome = @grossIncome - @totalDeductions;

--            -- Tax Slabs
--            SET @tax = 0;

--            IF @taxableIncome <= 400000
--                SET @tax = 0;
--            ELSE IF @taxableIncome <= 800000
--                SET @tax = (@taxableIncome - 400000) * 0.05;
--            ELSE IF @taxableIncome <= 1200000
--                SET @tax = (800000 - 400000) * 0.05 + (@taxableIncome - 800000) * 0.10;
--            ELSE IF @taxableIncome <= 1600000
--                SET @tax = (800000 - 400000) * 0.05 + (1200000 - 800000) * 0.10 + (@taxableIncome - 1200000) * 0.15;
--            ELSE IF @taxableIncome <= 2000000
--                SET @tax = (800000 - 400000) * 0.05 + (1200000 - 800000) * 0.10 + (1600000 - 1200000) * 0.15 + (@taxableIncome - 1600000) * 0.20;
--            ELSE IF @taxableIncome <= 2400000
--                SET @tax = (800000 - 400000) * 0.05 + (1200000 - 800000) * 0.10 + (1600000 - 1200000) * 0.15 + (2000000 - 1600000) * 0.20 + (@taxableIncome - 2000000) * 0.25;
--            ELSE
--                SET @tax = (800000 - 400000) * 0.05 + (1200000 - 800000) * 0.10 + (1600000 - 1200000) * 0.15 + (2000000 - 1600000) * 0.20 + (2400000 - 2000000) * 0.25 + (@taxableIncome - 2400000) * 0.30;

--            -- Insert data into tax_calculation table with original_tax_calculation_id as NULL
--            INSERT INTO tax_calculation (user_id, gross_income, deductions, taxable_income, tax_liability, tax_year, is_amended, original_tax_calculation_id)
--            VALUES (@userId, @grossIncome, @totalDeductions, @taxableIncome, @tax, @year, 0, NULL);  -- 0 for new calculation, NULL for original_tax_calculation_id
--        END
--        ELSE
--        BEGIN
--            PRINT 'Income or Deduction Data Missing for user ' + CAST(@userId AS VARCHAR) + ' in year ' + CAST(@year AS VARCHAR);
--        END

--        FETCH NEXT FROM year_cursor INTO @year;
--    END

--    CLOSE year_cursor;
--    DEALLOCATE year_cursor;

--    FETCH NEXT FROM user_cursor INTO @userId;
--END

--CLOSE user_cursor;
--DEALLOCATE user_cursor;

--===================================*************************************inserting into tax_filling table
--DECLARE @userId INT;
--DECLARE @taxYear INT;
--DECLARE @filingStatus VARCHAR(50) = 'Filled';  -- Filing status set to 'Filled'
--DECLARE @pdfGenerated BIT = 1;  -- PDF is generated (set to 1)
--DECLARE @refundStatus VARCHAR(50) = 'Not Processed';  -- Refund status is 'Not Processed'
--DECLARE @filingDate DATE;

---- Loop through user_id from 2 to 11 and years 2023, 2024, and 2025
--DECLARE user_cursor CURSOR FOR
--    SELECT user_id
--    FROM (VALUES (2), (3), (4), (5), (6), (7), (8), (9), (10), (11)) AS user_ids(user_id);

--OPEN user_cursor;

--FETCH NEXT FROM user_cursor INTO @userId;

--WHILE @@FETCH_STATUS = 0
--BEGIN
--    -- Loop through years 2023, 2024, and 2025
--    DECLARE year_cursor CURSOR FOR
--        SELECT 2023 AS year UNION ALL
--        SELECT 2024 UNION ALL
--        SELECT 2025;

--    OPEN year_cursor;
--    FETCH NEXT FROM year_cursor INTO @taxYear;

--    WHILE @@FETCH_STATUS = 0
--    BEGIN
--        -- Check if Tax Calculation exists for the user and tax year
--        IF EXISTS (SELECT 1 FROM tax_calculation WHERE user_id = @userId AND tax_year = @taxYear)
--        BEGIN
--            -- Set the filing date to the start of the tax year (January 1st of the tax year)
--            SET @filingDate = CAST(@taxYear AS VARCHAR) + '-01-01';

--            -- Use MERGE to update or insert based on the existence of the record
--            MERGE INTO tax_filling AS target
--            USING (SELECT @userId AS user_id, @taxYear AS tax_year) AS source
--            ON target.user_id = source.user_id AND target.tax_year = source.tax_year
--            WHEN MATCHED THEN
--                -- Update existing record
--                UPDATE SET filing_date = @filingDate,
--                           filling_status = @filingStatus,
--                           pdf_generated = @pdfGenerated,
--                           refund_status = @refundStatus
--            WHEN NOT MATCHED BY TARGET THEN
--                -- Insert new record if no match is 
--                INSERT (filing_date, filling_status, pdf_generated, refund_status, tax_year, user_id)
--                VALUES (@filingDate, @filingStatus, @pdfGenerated, @refundStatus, @taxYear, @userId);

--        END
--        ELSE
--        BEGIN
--            PRINT 'Tax Calculation does not exist for user ' + CAST(@userId AS VARCHAR) + ' in year ' + CAST(@taxYear AS VARCHAR);
--        END

--        FETCH NEXT FROM year_cursor INTO @taxYear;
--    END

--    CLOSE year_cursor;
--    DEALLOCATE year_cursor;

--    FETCH NEXT FROM user_cursor INTO @userId;
--END

--CLOSE user_cursor;
--DEALLOCATE user_cursor;


---=================*****************insert into tax_payments
--INSERT INTO tax_payment (
--    amount_paid,
--    payment_date,
--    payment_status,
--    transaction_id,       -- Generate transaction_id in the required format
--    user_id,
--    tax_calculation_id
--)
--SELECT 
--    tc.tax_liability,                               -- Amount to be paid is equal to the tax liability
--    DATEFROMPARTS(tc.tax_year, 02, 01),                  -- Use the end of the corresponding year as payment date
--    'Completed',                                     -- Payment status will be 'Completed'
--    'order_' + LEFT(CAST(NEWID() AS VARCHAR(50)), 16), -- Generate a random string and prefix with "order_"
--    tc.user_id,                                      -- The user_id from tax_calculation
--    tc.tax_calculation_id                            -- Corresponding tax_calculation_id
--FROM 
--    tax_calculation tc
--WHERE 
--    tc.tax_liability > 0                            -- Only include users with a non-zero tax liability
--    AND tc.user_id BETWEEN 2 AND 11;                -- Ensure user_id is between 2 and 11


--========**************-update the transaction_id

--DECLARE @CurrentTime BIGINT = CAST(GETDATE() AS BIGINT); -- Current timestamp in milliseconds
--DECLARE @RandomNum INT;

---- Cursor or loop through each record in the tax_calculation table
--DECLARE @TransactionId VARCHAR(50);
--DECLARE @TaxCalculationId INT;

--DECLARE cursor_tax_calculation CURSOR FOR
--SELECT tax_payment_id FROM tax_payment;

--OPEN cursor_tax_calculation;

--FETCH NEXT FROM cursor_tax_calculation INTO @TaxCalculationId;

--WHILE @@FETCH_STATUS = 0
--BEGIN
--    -- Generate random number (between 0 and 999999)
--    SET @RandomNum = FLOOR(RAND() * 1000000);

--    -- Format the transaction ID
--    SET @TransactionId = 'TXN-' + CAST(@CurrentTime AS VARCHAR) + '-' + RIGHT('000000' + CAST(@RandomNum AS VARCHAR), 6);

--    -- Update the transaction_id field for each entry
--    UPDATE tax_payment
--    SET transaction_id = @TransactionId
--    WHERE tax_payment_id = @TaxCalculationId;

--    FETCH NEXT FROM cursor_tax_calculation INTO @TaxCalculationId;
--END

--CLOSE cursor_tax_calculation;
--DEALLOCATE cursor_tax_calculation;