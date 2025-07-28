import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface RepPerf {
  id: number;
  name: string;
  route_name?: string;
  total_outlets: number;
  outlets_with_orders: number;
  distributors: PerfData;
  key_accounts: PerfData;
  retail: PerfData;
}
interface PerfData {
  vapes_target: number;
  pouches_target: number;
  vapes_sales: number;
  pouches_sales: number;
}

const SalesRepPerformancePage: React.FC = () => {
  const [data, setData] = useState<RepPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/sales/performance')
      .then(res => setData(res.data.data || []))
      .catch(err => setError(err.message || 'Failed to fetch performance'))
      .finally(() => setLoading(false));
  }, []);

  const renderTable = (type: 'distributors' | 'key_accounts' | 'retail', label: string) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{label}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sales Rep</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Outlets</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Outlets with Orders</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Outlet %</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Vapes Target</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Vapes Sales</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Vapes %</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Pouches Target</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Pouches Sales</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Pouches %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map(rep => {
              const vapesTarget = rep[type].vapes_target;
              const vapesSales = rep[type].vapes_sales;
              const vapesPct = vapesTarget > 0 ? ((vapesSales / vapesTarget) * 100).toFixed(1) : '0.0';
              const pouchesTarget = rep[type].pouches_target;
              const pouchesSales = rep[type].pouches_sales;
              const pouchesPct = pouchesTarget > 0 ? ((pouchesSales / pouchesTarget) * 100).toFixed(1) : '0.0';
              const totalOutlets = rep.total_outlets;
              const outletsWithOrders = rep.outlets_with_orders;
              const outletPct = totalOutlets > 0 ? ((outletsWithOrders / totalOutlets) * 100).toFixed(1) : '0.0';
              return (
                <tr key={rep.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {rep.name}
                    {rep.route_name && (
                      <span className="ml-2 text-sm text-gray-500">({rep.route_name})</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">{totalOutlets}</td>
                  <td className="px-4 py-2 text-center">{outletsWithOrders}</td>
                  <td className="px-4 py-2 text-center">{outletPct}%</td>
                  <td className="px-4 py-2 text-center">{vapesTarget}</td>
                  <td className="px-4 py-2 text-center">{vapesSales}</td>
                  <td className="px-4 py-2 text-center">{vapesPct}%</td>
                  <td className="px-4 py-2 text-center">{pouchesTarget}</td>
                  <td className="px-4 py-2 text-center">{pouchesSales}</td>
                  <td className="px-4 py-2 text-center">{pouchesPct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Sales Rep Performance</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <>
          {renderTable('distributors', 'Distributors (Client Type 3)')}
          {renderTable('key_accounts', 'Key Accounts (Client Type 2)')}
          {renderTable('retail', 'Retail (Client Type 1)')}
        </>
      )}
    </div>
  );
};

export default SalesRepPerformancePage; 