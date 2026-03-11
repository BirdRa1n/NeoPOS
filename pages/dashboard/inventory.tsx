import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSupplies, useLowStockAlerts } from '@/hooks/useInventory';
import { formatCurrency } from '@/lib/utils/format';

export default function InventoryPage() {
  const { supplies, loading } = useSupplies();
  const { alerts } = useLowStockAlerts();

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Estoque</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Novo Insumo
          </button>
        </div>

        {alerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Alertas de Estoque Baixo</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {alerts.map((alert: any) => (
                <li key={alert.id}>
                  {alert.name}: {alert.current_quantity} {alert.unit} (mínimo: {alert.minimum_quantity})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo Unit.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Atual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Mínima</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {supplies.map((supply) => {
                const isLow = supply.current_quantity <= supply.minimum_quantity;
                return (
                  <tr key={supply.id} className={`hover:bg-gray-50 ${isLow ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 font-medium">{supply.name}</td>
                    <td className="px-6 py-4">{supply.unit}</td>
                    <td className="px-6 py-4">{formatCurrency(supply.unit_cost)}</td>
                    <td className="px-6 py-4">{supply.current_quantity}</td>
                    <td className="px-6 py-4">{supply.minimum_quantity}</td>
                    <td className="px-6 py-4">{formatCurrency(supply.current_quantity * supply.unit_cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
