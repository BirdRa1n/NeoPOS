# NeoPOS Frontend

Frontend completo para o sistema NeoPOS com Next.js, TypeScript, Supabase e Tailwind CSS.

## 📁 Estrutura

```
├── contexts/           # Contextos React
│   ├── AuthContext.tsx    # Autenticação (login, logout, session)
│   └── StoreContext.tsx   # Dados da loja do usuário
│
├── hooks/             # Custom hooks
│   ├── useProducts.ts     # Produtos e categorias
│   ├── useOrders.ts       # Pedidos e itens
│   ├── useCustomers.ts    # Clientes
│   ├── useDelivery.ts     # Zonas e entregadores
│   ├── useInventory.ts    # Estoque e alertas
│   └── useFinance.ts      # Resumos financeiros
│
├── components/        # Componentes reutilizáveis
│   ├── Layout.tsx         # Layout com sidebar
│   ├── OrderCard.tsx      # Card de pedido
│   ├── ProductCard.tsx    # Card de produto
│   ├── OrderStatusBadge.tsx # Badge de status
│   ├── DashboardStats.tsx # Estatísticas do dashboard
│   └── LoadingSpinner.tsx # Loading
│
├── pages/            # Páginas Next.js
│   ├── index.tsx         # Redirect para dashboard/login
│   ├── login.tsx         # Página de login
│   ├── dashboard.tsx     # Dashboard principal
│   ├── products.tsx      # Listagem de produtos
│   ├── orders.tsx        # Listagem de pedidos
│   ├── customers.tsx     # Listagem de clientes
│   ├── delivery.tsx      # Zonas e entregadores
│   └── finance.tsx       # Relatórios financeiros
│
├── types/            # TypeScript types
│   └── database.ts       # Tipos do banco de dados
│
├── lib/utils/        # Utilitários
│   └── format.ts         # Formatação (moeda, data)
│
└── supabase/         # Configuração Supabase
    └── client.ts         # Cliente Supabase
```

## 🚀 Funcionalidades

### Autenticação
- Login/logout com Supabase Auth
- Proteção de rotas
- Sessão persistente

### Dashboard
- Estatísticas do dia (pedidos, receita)
- Pedidos pendentes em tempo real
- Visão geral do negócio

### Produtos
- Listagem com filtro por categoria
- Cards com preço promocional
- Status de disponibilidade

### Pedidos
- Filtro por status (pendente, confirmado, preparando, etc.)
- Atualização em tempo real via Supabase Realtime
- Badge visual de status

### Clientes
- Listagem completa
- Dados de contato e endereço

### Entrega
- Zonas de entrega com taxa e tempo estimado
- Cadastro de entregadores
- Status ativo/inativo

### Financeiro
- Resumos diários
- Filtro por período (7, 15, 30 dias)
- Totalizadores de receita

## 🎨 Componentes Principais

### Contextos
- **AuthContext**: Gerencia autenticação e sessão do usuário
- **StoreContext**: Carrega e mantém dados da loja do usuário logado

### Hooks Customizados
Todos os hooks seguem o padrão:
```typescript
const { data, loading } = useHook();
```

### Layout
- Sidebar com navegação
- Header com nome da loja
- Botão de logout

## 🔒 Segurança

- RLS (Row Level Security) ativo no Supabase
- Usuário só acessa dados da própria loja
- Rotas protegidas por autenticação

## 📦 Dependências

- **Next.js 16**: Framework React
- **Supabase**: Backend e autenticação
- **Tailwind CSS**: Estilização
- **Lucide React**: Ícones
- **React Hot Toast**: Notificações
- **Zustand**: State management (instalado, não usado ainda)

## 🎯 Próximos Passos

1. Criar formulários de cadastro/edição
2. Implementar detalhes de pedido
3. Adicionar gestão de estoque
4. Criar relatórios avançados
5. Implementar notificações push
6. Adicionar upload de imagens de produtos
