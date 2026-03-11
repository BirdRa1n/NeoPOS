import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDeliveryZones, useDeliveryDrivers } from '@/hooks/useDelivery';
import { formatCurrency } from '@/lib/utils/format';

export default function DeliveryPage() {
  const { zones, loading: zonesLoading } = useDeliveryZones();
  const { drivers, loading: driversLoading } = useDeliveryDrivers();

  if (zonesLoading || driversLoading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Entrega</h1>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Zonas de Entrega</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Nova Zona
            </button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bairro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tempo Estimado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{zone.neighborhood}</td>
                    <td className="px-6 py-4">{formatCurrency(zone.delivery_fee)}</td>
                    <td className="px-6 py-4">{zone.estimated_time_min} min</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${zone.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {zone.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Entregadores</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Novo Entregador
            </button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{driver.name}</td>
                    <td className="px-6 py-4">{driver.phone || '-'}</td>
                    <td className="px-6 py-4">{driver.vehicle_type || '-'}</td>
                    <td className="px-6 py-4">{driver.vehicle_plate || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${driver.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {driver.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
