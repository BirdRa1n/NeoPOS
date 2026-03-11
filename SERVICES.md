# NeoPOS - Services (CRUD)

## 📦 services/stores.ts
```typescript
createStore(data)      // Criar loja
updateStore(id, data)  // Atualizar loja
deleteStore(id)        // Deletar loja
```

## 🛍️ services/products.ts
```typescript
// Produtos
createProduct(data)
updateProduct(id, data)
deleteProduct(id)

// Categorias
createCategory(data)
updateCategory(id, data)
deleteCategory(id)

// Imagens
uploadProductImage(productId, file)  // Upload para Storage
createProductImage(data)
deleteProductImage(id, storagePath)
```

## 📋 services/orders.ts
```typescript
// Pedidos
createOrder(data)
updateOrder(id, data)
deleteOrder(id)
updateOrderStatus(id, status)

// Itens do Pedido
createOrderItem(data)
deleteOrderItem(id)

// Adicionais do Item
createOrderItemAddon(data)
```

## 👥 services/customers.ts
```typescript
createCustomer(data)
updateCustomer(id, data)
deleteCustomer(id)
```

## 🚚 services/delivery.ts
```typescript
// Zonas de Entrega
createDeliveryZone(data)
updateDeliveryZone(id, data)
deleteDeliveryZone(id)

// Entregadores
createDeliveryDriver(data)
updateDeliveryDriver(id, data)
deleteDeliveryDriver(id)
```

## 📦 services/inventory.ts
```typescript
// Insumos
createSupply(data)
updateSupply(id, data)
deleteSupply(id)

// Movimentações de Estoque
createStockMovement(data)  // Atualiza quantidade automaticamente

// Ficha Técnica (Produto → Insumos)
createProductSupply(data)
updateProductSupply(id, data)
deleteProductSupply(id)
```

## 💡 Exemplo de Uso

```typescript
import { createProduct, updateProduct } from '@/services';
import toast from 'react-hot-toast';

async function handleCreateProduct() {
  try {
    const product = await createProduct({
      store_id: store.id,
      category_id: categoryId,
      name: 'Pizza Margherita',
      price: 35.00,
      available: true,
      featured: false,
      sort_order: 0
    });
    
    toast.success('Produto criado!');
    return product;
  } catch (error) {
    toast.error('Erro ao criar produto');
    throw error;
  }
}

async function handleUpdateProduct(id: string) {
  try {
    await updateProduct(id, {
      price: 39.90,
      promotional_price: 34.90
    });
    
    toast.success('Produto atualizado!');
  } catch (error) {
    toast.error('Erro ao atualizar produto');
  }
}
```

## 🔄 Movimentação de Estoque

```typescript
import { createStockMovement } from '@/services';

// Entrada de estoque (compra)
await createStockMovement({
  store_id: store.id,
  supply_id: supplyId,
  type: 'purchase',
  quantity: 100,  // positivo = entrada
  unit_cost: 5.50,
  notes: 'Compra fornecedor X'
});

// Saída manual
await createStockMovement({
  store_id: store.id,
  supply_id: supplyId,
  type: 'manual_out',
  quantity: -10,  // negativo = saída
  notes: 'Perda/quebra'
});

// Ajuste de inventário
await createStockMovement({
  store_id: store.id,
  supply_id: supplyId,
  type: 'adjustment',
  quantity: 5,  // diferença encontrada
  notes: 'Ajuste de inventário'
});
```

## 📸 Upload de Imagens

```typescript
import { uploadProductImage, createProductImage } from '@/services';

async function handleImageUpload(productId: string, file: File) {
  try {
    // 1. Upload para Storage
    const { storage_path, url } = await uploadProductImage(productId, file);
    
    // 2. Criar registro no banco
    await createProductImage({
      product_id: productId,
      storage_path,
      url,
      is_primary: true,
      sort_order: 0
    });
    
    toast.success('Imagem enviada!');
  } catch (error) {
    toast.error('Erro ao enviar imagem');
  }
}
```

## 🎯 Schemas Corretos

Todos os services usam os schemas corretos:
- **core**: stores, customers, delivery_zones, delivery_drivers
- **catalog**: products, categories, product_images
- **orders**: orders, order_items, order_item_addons
- **inventory**: supplies, stock_movements, product_supplies
