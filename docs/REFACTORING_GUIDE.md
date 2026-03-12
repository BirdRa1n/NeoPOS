# Guia de Refatoração - NeoPOS

## Componentes Criados

### 📦 components/ui/
- **Button.tsx** - Botão com variantes (primary, secondary, danger, ghost)
- **Input.tsx** - Input com suporte a ícones
- **Card.tsx** - Card reutilizável
- **Badge.tsx** - Badge com variantes de cor
- **Avatar.tsx** - Avatar com iniciais automáticas
- **Modal.tsx** - Sistema completo de modais

### 📝 components/forms/
- **FormField.tsx** - Campo de formulário com label
- **SearchBar.tsx** - Barra de busca
- **Select.tsx** - Select customizado
- **Textarea.tsx** - Textarea estilizado

### 📊 components/data/
- **Table.tsx** - Tabela com Row e Cell
- **StatCard.tsx** - Card de estatísticas
- **EmptyState.tsx** - Estado vazio

### 🎨 components/layout/
- **PageHeader.tsx** - Cabeçalho de página
- **Section.tsx** - Seção com título e ícone

## Padrão de Uso

### Antes (código duplicado):
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Título</h1>
    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Subtítulo</p>
  </div>
  <button className="flex items-center gap-2 px-4 py-2 rounded-xl...">
    <Plus size={15} />Novo
  </button>
</div>
```

### Depois (componente reutilizável):
```tsx
<PageHeader
  title="Título"
  subtitle="Subtítulo"
  action={<Button icon={<Plus size={15} />}>Novo</Button>}
/>
```

## Benefícios da Refatoração

✅ **Redução de código**: ~40% menos linhas
✅ **Consistência**: Design system unificado
✅ **Manutenibilidade**: Mudanças em um lugar
✅ **Produtividade**: Desenvolvimento mais rápido
✅ **TypeScript**: Tipagem completa
✅ **Acessibilidade**: forwardRef e props corretas

## Status da Refatoração

- [x] Componentes base criados
- [x] ProductsView - Parcialmente refatorado
- [ ] OrdersView - Pendente
- [ ] CustomersView - Pendente
- [ ] InventoryView - Pendente
- [ ] FinanceView - Pendente
- [ ] DeliveryView - Pendente
- [ ] StoreSettingsView - Pendente
- [ ] Dashboard - Pendente

## Próximos Passos

1. Refatorar todas as views para usar os novos componentes
2. Criar componentes específicos adicionais conforme necessário
3. Documentar props e exemplos de uso
4. Adicionar testes unitários
5. Criar Storybook para visualização dos componentes
