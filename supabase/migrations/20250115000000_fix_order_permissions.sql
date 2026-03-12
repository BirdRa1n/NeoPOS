-- Remover policies anônimas (segurança)
DROP POLICY IF EXISTS "allow_anon_insert_orders" ON orders.orders;
DROP POLICY IF EXISTS "allow_anon_insert_order_items" ON orders.order_items;
DROP POLICY IF EXISTS "allow_anon_manage_customers" ON core.customers;

-- Revogar permissões anônimas
REVOKE INSERT ON orders.orders FROM anon;
REVOKE INSERT ON orders.order_items FROM anon;
REVOKE INSERT, UPDATE ON core.customers FROM anon;

-- Garantir que service_role tem todas as permissões necessárias
GRANT USAGE, SELECT ON SEQUENCE orders.orders_order_number_seq TO service_role;
GRANT ALL ON orders.orders TO service_role;
GRANT ALL ON orders.order_items TO service_role;
GRANT ALL ON core.customers TO service_role;
GRANT SELECT ON core.delivery_zones TO service_role;
GRANT SELECT ON catalog.products TO service_role;
GRANT SELECT ON core.stores TO service_role;

-- Permitir leitura pública apenas de zonas de entrega ativas (para o frontend)
DROP POLICY IF EXISTS "public_read_active_zones" ON core.delivery_zones;
CREATE POLICY "public_read_active_zones" ON core.delivery_zones
  FOR SELECT
  TO anon, authenticated
  USING (active = true);
