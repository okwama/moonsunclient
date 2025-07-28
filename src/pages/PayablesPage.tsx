import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, ArrowRight } from 'lucide-react';

interface AgingPayable {
  supplier_id: number;
  company_name: string;
  total_payable: number;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

interface Payment {
  id: number;
  supplier_id: number;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  account_id: number;
  reference: string;
  notes: string;
  status: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PayablesPage: React.FC = () => {
  const [payables, setPayables] = useState<AgingPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayables();
  }, []);

  const fetchPayables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/financial/payables/aging`);
      if (res.data.success) {
        setPayables(res.data.data);
      } else {
        setError(res.data.error || 'Failed to fetch payables');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payables');
    } finally {
      setLoading(false);
    }
  };

  const totalPayable = payables.reduce((sum, row) => sum + Number(row.total_payable || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Aging Payables</h1>
      </div>
      <div className="mb-4">
        <span className="text-lg font-semibold">Total Payable: </span>
        <span className="text-2xl font-bold text-blue-700">{totalPayable.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</span>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Supplier</th>
                <th className="px-4 py-2 border-b">Total Payable</th>
                <th className="px-4 py-2 border-b">Current</th>
                <th className="px-4 py-2 border-b">1-30 Days</th>
                <th className="px-4 py-2 border-b">31-60 Days</th>
                <th className="px-4 py-2 border-b">61-90 Days</th>
                <th className="px-4 py-2 border-b">90+ Days</th>
              </tr>
            </thead>
            <tbody>
              {payables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">No outstanding payables.</td>
                </tr>
              ) : (
                payables.map((row) => (
                  <tr key={row.supplier_id}>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="text-blue-700 hover:underline focus:outline-none"
                        onClick={() => navigate(`/suppliers/${row.supplier_id}/invoices`)}
                        type="button"
                      >
                        {row.company_name}
                      </button>
                    </td>
                    <td className="px-4 py-2 border-b font-semibold">{row.total_payable.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 border-b bg-gray-50 text-gray-800">{row.current.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 border-b bg-yellow-100 text-yellow-800">{row.days_1_30.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 border-b bg-orange-100 text-orange-800">{row.days_31_60.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 border-b bg-red-100 text-red-800">{row.days_61_90.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                    <td className="px-4 py-2 border-b bg-red-200 text-red-900 font-bold">{row.days_90_plus.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PayablesPage; 