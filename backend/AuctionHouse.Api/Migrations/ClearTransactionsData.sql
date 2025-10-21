-- Clear all existing transaction data before schema migration
-- This is necessary because we're changing PaymentStatus from string to enum (int)
DELETE FROM Transactions;
