import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDailySummaries } from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useState } from 'react';

export default function FinancePage() {
  const [days, setDays] = useState(7);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { summaries, loading } = useDailySummaries(startDate);

  const totals = summaries.reduce((acc, s) => ({
    orders: acc.orders + s.total_orders,
    gross: acc.gross + s.gross_revenue,
    discounts: acc.discounts + s.total_discounts,
    fees: acc.fees + s.total_delivery_fees,
    net: acc.net + s.net_revenue
  }), { orders: 0, gross: 0, discounts: 0, fees: 0, net: 0 });

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <select 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded-lg px-4 py-2"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={15}>Últimos 15 dias</option>
            <option value={30}>Últimos 30 dias</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Total de Pedidos</p>
            <p className="text-3xl font-bold">{totals.orders}</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Receita Bruta</p>
            <p className="text-3xl font-bold">{formatCurrency(totals.gross)}</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Receita Líquida</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totals.net)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita Bruta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descontos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxas Entrega</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita Líquida</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {summaries.map((summary) => (
                <tr key={summary.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{formatDate(summary.date)}</td>
                  <td className="px-6 py-4">{summary.total_orders}</td>
                  <td className="px-6 py-4">{formatCurrency(summary.gross_revenue)}</td>
                  <td className="px-6 py-4">{formatCurrency(summary.total_discounts)}</td>
                  <td className="px-6 py-4">{formatCurrency(summary.total_delivery_fees)}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(summary.net_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
