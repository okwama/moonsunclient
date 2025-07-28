import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface ProductPerformance {
  product_id: number;
  product_name: string;
  total_quantity_sold: number;
  total_sales_value: number;
}

const ProductPerformancePage: React.FC = () => {
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [region, setRegion] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  // Temp filter state for modal
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');
  const [tempProductType, setTempProductType] = useState<string>('');
  const [tempCountry, setTempCountry] = useState<string>('');
  const [tempRegion, setTempRegion] = useState<string>('');

  const fetchData = async (start?: string, end?: string, type?: string, countryName?: string, regionName?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/financial/reports/product-performance';
      const params: Record<string, string> = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;
      if (type) params.productType = type;
      if (countryName) params.country = countryName;
      if (regionName) params.region = regionName;
      const query = new URLSearchParams(params).toString();
      if (query) url += `?${query}`;
      const response = await axios.get(url);
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        setError('Failed to fetch product performance data');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate, productType, country, region);
    // eslint-disable-next-line
  }, [startDate, endDate, productType, country, region]);

  useEffect(() => {
    // Fetch country and region options on mount
    const fetchCountries = async () => {
      try {
        const res = await axios.get('/api/countries');
        if (res.data.success) {
          setCountries(res.data.data.map((row: { name: string }) => row.name));
        }
      } catch {}
    };
    const fetchRegions = async () => {
      try {
        const res = await axios.get('/api/regions');
        if (res.data.success) {
          setRegions(res.data.data.map((row: { name: string }) => row.name));
        }
      } catch {}
    };
    fetchCountries();
    fetchRegions();
  }, []);

  // Sync temp state with real state when modal opens
  useEffect(() => {
    if (modalOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setTempProductType(productType);
      setTempCountry(country);
      setTempRegion(region);
    }
    // eslint-disable-next-line
  }, [modalOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const totalQuantity = products.reduce((sum, p) => sum + (Number(p.total_quantity_sold) || 0), 0);
  const totalSalesValue = products.reduce((sum, p) => sum + (Number(p.total_sales_value) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Product Performance Report</h1>
        </div>
        <div className="flex items-center">
          <button
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setModalOpen(true)}
          >
            Filter
          </button>
          <Link
            to="/dashboard/reports/product-performance-graph"
            className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            View Graph
          </Link>
        </div>
      </div>
      {/* Filter Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Filter Product Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={e => setTempStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={e => setTempEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <select
                  value={tempProductType}
                  onChange={e => setTempProductType(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All</option>
                  <option value="vape">Vapes</option>
                  <option value="pouch">Pouches</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={tempCountry}
                  onChange={e => setTempCountry(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All</option>
                  {countries.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={tempRegion}
                  onChange={e => setTempRegion(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All</option>
                  {regions.map((r: string) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => {
                  setStartDate(''); setEndDate(''); setProductType(''); setCountry(''); setRegion(''); setModalOpen(false);
                }}
              >
                Clear
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  setStartDate(tempStartDate);
                  setEndDate(tempEndDate);
                  setProductType(tempProductType);
                  setCountry(tempCountry);
                  setRegion(tempRegion);
                  setModalOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Product Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      Quantity Sold
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      Total Sales Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {product.product_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                        {product.total_quantity_sold.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                        {product.total_sales_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-semibold">
                    <td className="py-3 pl-4 pr-3 text-left text-blue-900 sm:pl-6">Total</td>
                    <td className="px-3 py-3 text-right text-blue-900">{totalQuantity.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-blue-900">{totalSalesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPerformancePage; 