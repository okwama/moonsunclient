import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface ProductPerformance {
  product_id: number;
  product_name: string;
  total_quantity_sold: number;
  total_sales_value: number;
}

const ProductPerformanceGraphPage: React.FC = () => {
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

  return (
    <div className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Product Performance Graph</h1>
        <button
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setModalOpen(true)}
        >
          Filter
        </button>
      </div>
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
      <div className="mt-8 bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Sales Value by Product</h2>
        {loading ? (
          <div>Loading chart...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={products} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product_name" angle={-30} textAnchor="end" interval={0} height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="total_sales_value" fill="#7CB9E8" name="Total Sales Value" />
              <Bar yAxisId="right" dataKey="total_quantity_sold" fill="#34D399" name="Quantity Sold" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProductPerformanceGraphPage; 