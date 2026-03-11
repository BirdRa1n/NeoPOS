import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Banknote, Smartphone, Calendar } from 'lucide-react';

export function FinanceView() {
  const { summary, loading } = useFinance();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  if (loading) return <LoadingSpinner />;

  const revenue = summary?.total_revenue || 0;
  const expenses = summary?.total_discount || 0;
  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-600 mt-1">Acompanhe suas finanças e relatórios</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'today' | 'week' | 'month')}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="today">Hoje</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Receita Total</p>
          <p className="text-3xl font-bold">R$ {revenue.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-2">+12% vs período anterior</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Lucro Líquido</p>
          <p className="text-3xl font-bold">R$ {profit.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-2">Margem: {profitMargin}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Despesas</p>
          <p className="text-3xl font-bold">R$ {expenses.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-2">-5% vs período anterior</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Ticket Médio</p>
          <p className="text-3xl font-bold">R$ {summary?.total_orders ? (revenue / summary.total_orders).toFixed(2) : '0.00'}</p>
          <p className="text-xs opacity-75 mt-2">{summary?.total_orders || 0} pedidos</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Receita por Método de Pagamento</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Banknote className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dinheiro</p>
                  <p className="text-sm text-gray-600">R$ {(summary?.cash_revenue || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {revenue > 0 ? ((summary?.cash_revenue || 0) / revenue * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cartão</p>
                  <p className="text-sm text-gray-600">R$ {(summary?.card_revenue || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {revenue > 0 ? ((summary?.card_revenue || 0) / revenue * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">PIX</p>
                  <p className="text-sm text-gray-600">R$ {(summary?.pix_revenue || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {revenue > 0 ? ((summary?.pix_revenue || 0) / revenue * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Receita Bruta</p>
                <p className="text-xl font-bold text-gray-900">R$ {revenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Descontos</p>
                <p className="text-xl font-bold text-gray-900">R$ {(summary?.total_discount || 0).toFixed(2)}</p>
              </div>
              <TrendingDown className="text-red-500" size={24} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Taxa de Entrega</p>
                <p className="text-xl font-bold text-gray-900">R$ {(summary?.total_delivery_fees || 0).toFixed(2)}</p>
              </div>
              <DollarSign className="text-blue-500" size={24} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Receita Líquida</p>
                <p className="text-2xl font-bold text-blue-600">R$ {profit.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
