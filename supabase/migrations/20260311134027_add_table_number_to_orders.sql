-- Add table_number column to orders table for dine-in orders
ALTER TABLE orders.orders 
ADD COLUMN table_number VARCHAR(20);

COMMENT ON COLUMN orders.orders.table_number IS 'Número da mesa para pedidos no local (dine-in)';
