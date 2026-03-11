# NeoPOS - Frontend Completo

## ✅ Estrutura Criada

### 📁 types/database.ts
Tipos TypeScript completos para todas as tabelas do banco:
- Store, Customer, DeliveryDriver, DeliveryZone
- Category, Product, ProductImage, AddonGroup, Addon
- Order, OrderItem, OrderItemAddon
- Supply, ProductSupply, StockMovement
- DailySummary

### 🎯 contexts/
**AuthContext.tsx** - Autenticação Supabase
- signIn, signUp, signOut
- user, session, loading

**StoreContext.tsx** - Dados da loja
- Carrega store do usuário logado
- refetch para atualizar

### 🪝 hooks/
**useProducts.ts**
- useProducts() - lista produtos
- useCategories() - lista categorias
- useProductImages(productId) - imagens do produto

**useOrders.ts**
- useOrders(status?) - pedidos com realtime
- useOrderItems(orderId) - itens do pedido
- updateOrderStatus(orderId, status) - atualizar status

**useCustomers.ts**
- useCustomers() - lista clientes

**useDelivery.ts**
- useDeliveryZones() - zonas de entrega
- useDeliveryDrivers() - entregadores

**useInventory.ts**
- useSupplies() - insumos
- useLowStockAlerts() - alertas de estoque baixo
- useStockMovements(supplyId?) - movimentações

**useFinance.ts**
- useDailySummaries(startDate?, endDate?) - resumos diários
- useTodaySummary() - resumo de hoje

### 🧩 components/
- **Layout.tsx** - Layout com sidebar e navegação
- **OrderCard.tsx** - Card de pedido
- **ProductCard.tsx** - Card de produto
- **OrderStatusBadge.tsx** - Badge de status visual
- **DashboardStats.tsx** - Estatísticas do dashboard
- **LoadingSpinner.tsx** - Loading spinner

### 📄 pages/
- **index.tsx** - Redirect para dashboard/login
- **login.tsx** - Página de login
- **dashboard.tsx** - Dashboard com stats e pedidos pendentes
- **products.tsx** - Listagem de produtos com filtro por categoria
- **orders.tsx** - Listagem de pedidos com filtro por status
- **customers.tsx** - Listagem de clientes
- **delivery.tsx** - Zonas de entrega e entregadores
- **finance.tsx** - Relatórios financeiros

### 🛠️ lib/utils/
**format.ts**
- formatCurrency(value) - formata em BRL
- formatDate(date) - formata data
- formatDateTime(date) - formata data e hora
- cn(...classes) - utilitário para classes CSS

## 🔑 Características

✅ **Schemas corretos** - Todas as queries usam `.schema('nome')`
✅ **RLS respeitado** - Dados isolados por loja
✅ **Realtime** - Pedidos atualizam automaticamente
✅ **TypeScript** - Tipagem completa
✅ **Responsivo** - Tailwind CSS
✅ **Minimalista** - Código enxuto e direto

## 🚀 Uso

```tsx
// Exemplo de uso dos hooks
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';

function MyComponent() {
  const { products, loading } = useProducts();
  const { orders } = useOrders('pending');
  
  // ...
}
```

## 📝 Schemas do Supabase

- **core**: stores, customers, delivery_zones, delivery_drivers
- **catalog**: products, categories, product_images, addon_groups, addons
- **orders**: orders, order_items, order_item_addons
- **inventory**: supplies, product_supplies, stock_movements
- **finance**: daily_summaries
