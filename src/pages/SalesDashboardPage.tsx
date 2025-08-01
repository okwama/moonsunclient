import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { PieChart, Pie as RePie, Cell, Tooltip as PieTooltip, Legend as PieLegend } from 'recharts';
import axios from 'axios';
import { salesOrdersService } from '../services/financialService';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ArcElement, ChartTooltip, ChartLegend, ChartDataLabels);
import { BarChart as ReBarChart, Bar as ReBar, XAxis as ReXAxis, YAxis as ReYAxis, Tooltip as ReTooltip, ResponsiveContainer as ReResponsiveContainer, CartesianGrid as ReCartesianGrid, Legend as ReLegend } from 'recharts';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const COLORS = [
  '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a21caf', '#f59e42', '#0ea5e9', '#f43f5e', '#16a34a', '#facc15', '#6366f1', '#f87171',
];

const SalesDashboardPage: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rechartsPieData, setRechartsPieData] = useState<{ type: string; value: number }[]>([]);
  const navigate = useNavigate();

  // Managers state for pie chart
  const [managers, setManagers] = useState<any[]>([]);
  const [repData, setRepData] = useState<any[]>([]);
  const [mpLoading, setMpLoading] = useState(true);
  const [mpError, setMpError] = useState<string | null>(null);

  // Product performance state
  const [productPerf, setProductPerf] = useState<any[]>([]);
  const [productPerfLoading, setProductPerfLoading] = useState(true);
  const [productPerfError, setProductPerfError] = useState<string | null>(null);

  // Top 10 sales reps by overall performance
  const [topReps, setTopReps] = useState<{ name: string; overall: number }[]>([]);

  useEffect(() => {
    axios.get('/api/sales/performance')
      .then(res => {
        const reps = res.data.data || [];
        // Calculate overall % as in SharedPerformancePage
        const repPerf = reps.map((rep: any) => {
          const allTypes = ['distributors', 'key_accounts', 'retail'];
          let outletPctSum = 0, vapesPctSum = 0, pouchesPctSum = 0;
          allTypes.forEach(type => {
            const perf = rep[type];
            const outletPct = perf.total_outlets > 0 ? (perf.outlets_with_orders / perf.total_outlets) * 100 : 0;
            const vapesPct = perf.vapes_target > 0 ? (perf.vapes_sales / perf.vapes_target) * 100 : 0;
            const pouchesPct = perf.pouches_target > 0 ? (perf.pouches_sales / perf.pouches_target) * 100 : 0;
            outletPctSum += outletPct;
            vapesPctSum += vapesPct;
            pouchesPctSum += pouchesPct;
          });
          const n = allTypes.length;
          const overall = ((outletPctSum + vapesPctSum + pouchesPctSum) / (n * 3));
          return { name: rep.name, overall: Number(overall.toFixed(1)) };
        });
        repPerf.sort((a: { overall: number }, b: { overall: number }) => b.overall - a.overall);
        setTopReps(repPerf.slice(0, 10));
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await salesOrdersService.getAll();
        const orders = res.data || [];
        // Group by month
        const monthMap: { [key: string]: number } = {};
        orders.forEach((order: any) => {
          if (!order.order_date || !order.total_amount) return;
          const date = new Date(order.order_date);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          monthMap[key] = (monthMap[key] || 0) + Number(order.total_amount);
        });
        // Convert to array and sort by date
        const data = Object.entries(monthMap)
          .map(([key, amount]) => {
            const [year, monthIdx] = key.split('-');
            return {
              month: `${monthNames[Number(monthIdx)]} ${year}`,
              amount: amount as number,
            };
          })
          .sort((a, b) => {
            const [aMonth, aYear] = a.month.split(' ');
            const [bMonth, bYear] = b.month.split(' ');
            if (aYear !== bYear) return Number(aYear) - Number(bYear);
            return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
          });
        setMonthlyData(data);
      } catch (err: any) {
        setError('Failed to fetch sales data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Fetch pie chart data for current month
    const fetchPieData = async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      // Fetch vapes
      const vapesRes = await axios.get('/api/financial/reports/product-performance', {
        params: { startDate: start, endDate: end, productType: 'vape' }
      });
      // Fetch pouches
      const pouchesRes = await axios.get('/api/financial/reports/product-performance', {
        params: { startDate: start, endDate: end, productType: 'pouch' }
      });
      const vapesTotal = vapesRes.data.success ? vapesRes.data.data.reduce((sum: number, p: any) => sum + (Number(p.total_sales_value) || 0), 0) : 0;
      const pouchesTotal = pouchesRes.data.success ? pouchesRes.data.data.reduce((sum: number, p: any) => sum + (Number(p.total_sales_value) || 0), 0) : 0;
      setRechartsPieData([
        { type: 'Vapes', value: vapesTotal },
        { type: 'Pouches', value: pouchesTotal },
      ]);
    };
    fetchPieData();

    // Fetch product performance for dashboard (grouped by vapes and pouches)
    const fetchProductPerf = async () => {
      setProductPerfLoading(true);
      setProductPerfError(null);
      try {
        const [vapesRes, pouchesRes] = await Promise.all([
          axios.get('/api/financial/reports/product-performance', { params: { productType: 'vape' } }),
          axios.get('/api/financial/reports/product-performance', { params: { productType: 'pouch' } }),
        ]);
        if (vapesRes.data.success && pouchesRes.data.success) {
          // Filter vapes: category_id 1 or 3
          const vapes = vapesRes.data.data.filter((p: any) => p.category_id === 1 || p.category_id === 3);
          // Filter pouches: category_id 4 or 5
          const pouches = pouchesRes.data.data.filter((p: any) => p.category_id === 4 || p.category_id === 5);
          // Get all unique product names
          const allNames = Array.from(new Set([...vapes.map((p: any) => p.product_name), ...pouches.map((p: any) => p.product_name)]));
          const merged = allNames.map((name: string) => {
            const v = vapes.find((p: any) => p.product_name === name) || {};
            const p = pouches.find((p: any) => p.product_name === name) || {};
            return {
              product_name: name,
              vapes_sales_value: v.total_sales_value || 0,
              vapes_quantity: v.total_quantity_sold || 0,
              pouches_sales_value: p.total_sales_value || 0,
              pouches_quantity: p.total_quantity_sold || 0,
            };
          });
          setProductPerf(merged);
        } else {
          setProductPerfError('Failed to fetch product performance data');
        }
      } catch {
        setProductPerfError('An error occurred while fetching product performance');
      } finally {
        setProductPerfLoading(false);
      }
    };
    fetchProductPerf();

    // Fetch managers and performance data
    const fetchManagersPerf = async () => {
      setMpLoading(true);
      setMpError(null);
      try {
        const [mgrRes, repRes] = await Promise.all([
          axios.get('/api/managers'),
          axios.get('/api/sales/performance'),
        ]);
        setManagers(mgrRes.data || []);
        setRepData(repRes.data.data || []);
      } catch (err: any) {
        setMpError('Failed to fetch managers performance');
      } finally {
        setMpLoading(false);
      }
    };
    fetchManagersPerf();
  }, []);

  // Helper to get all reps for a manager (by region)
  function getRepsForManager(manager: any) {
    return repData.filter((rep: any) => rep.region === manager.region);
  }
  // Helper to sum up and get overall % for a manager
  function getManagerOverallPct(manager: any) {
    const reps = getRepsForManager(manager);
    let typeKey: 'retail' | 'key_accounts' | 'distributors';
    if (manager.managerTypeId === 1) typeKey = 'retail';
    else if (manager.managerTypeId === 2) typeKey = 'key_accounts';
    else typeKey = 'distributors';
    const total = reps.reduce(
      (acc: any, rep: any) => {
        const perf = rep[typeKey];
        acc.vapes_target += perf.vapes_target || 0;
        acc.pouches_target += perf.pouches_target || 0;
        acc.vapes_sales += perf.vapes_sales || 0;
        acc.pouches_sales += perf.pouches_sales || 0;
        acc.total_outlets += perf.total_outlets || 0;
        acc.outlets_with_orders += perf.outlets_with_orders || 0;
        return acc;
      },
      { vapes_target: 0, pouches_target: 0, vapes_sales: 0, pouches_sales: 0, total_outlets: 0, outlets_with_orders: 0 }
    );
    const outlet_pct = total.total_outlets > 0 ? (total.outlets_with_orders / total.total_outlets) * 100 : 0;
    const vapesPct = total.vapes_target > 0 ? (total.vapes_sales / total.vapes_target) * 100 : 0;
    const pouchesPct = total.pouches_target > 0 ? (total.pouches_sales / total.pouches_target) * 100 : 0;
    const overallPct = ((outlet_pct + vapesPct + pouchesPct) / 3);
    return overallPct;
  }

  return (
    <div className="max-w-8xl mx-auto py-4 px-4">
      {/* Topbar with menus - below the header */}
      <div className="bg-white shadow flex items-center px-6 py-3 mb-1 rounded-lg">
        <nav className="flex gap-6">
          <Link
            to="/sales-reps"
            className="inline-block bg-blue-100 text-blue-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-blue-200 transition"
          >
            Sales Reps
          </Link>
          <Link
            to="/sales-rep-leaves"
            className="inline-block bg-green-100 text-green-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-green-200 transition"
          >
            Sales Rep Leaves
          </Link>
          <Link
            to="/products"
            className="inline-block bg-indigo-100 text-indigo-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-indigo-200 transition"
          >
            Products
          </Link>
          <Link
            to="/managers"
            className="inline-block bg-green-100 text-green-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-green-200 transition"
          >
            Managers
          </Link>
          <Link
            to="/clients-list"
            className="inline-block bg-purple-100 text-purple-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-purple-200 transition"
          >
            Clients
          </Link>
          <Link
            to="/notices"
            className="inline-block bg-yellow-100 text-yellow-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-yellow-200 transition"
          >
            Notices
          </Link>
          <Link
            to="/tasks"
            className="inline-block bg-indigo-100 text-indigo-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-indigo-200 transition"
          >
            Tasks
          </Link>
          <Link
            to="/dashboard/reports/sales-report"
            className="inline-block bg-orange-100 text-orange-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-orange-200 transition"
          >
            Sales Report
          </Link>
          <Link
            to="/dashboard/reports/product-performance"
            className="inline-block bg-pink-100 text-pink-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-pink-200 transition"
          >
            Product Performance
          </Link>
                        <Link
                to="/master-sales"
                className="inline-block bg-red-100 text-red-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-red-200 transition"
              >
                Master Sales
              </Link>
              <Link
                to="/sales-rep-master-report"
                className="inline-block bg-blue-100 text-blue-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-blue-200 transition"
              >
                Sales Rep Report
              </Link>
          <Link
            to="/my-visibility"
            className="inline-block bg-cyan-100 text-cyan-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-cyan-200 transition"
          >
            Visibility Report
          </Link>
          <Link
            to="/settings"
            className="inline-block bg-gray-100 text-gray-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm mr-2 cursor-pointer hover:bg-gray-200 transition"
          >
            My Account
          </Link>
          {/* Add more menu items here as needed */}
        </nav>
      </div>
     
        {/* Add sales-specific stats, charts, and quick links here */}
        <div className="mt-0 lg:flex lg:space-x-6">
          {/* Bar Graph Card - Left Side */}
          <div className="bg-white rounded shadow p-6 w-full lg:w-1/2 mb-6 lg:mb-0">
            <h2
              className="text-lg font-semibold mb-4 cursor-pointer text-blue-700 hover:underline"
              onClick={() => navigate('/dashboard/reports/sales-report')}
              title="View full sales report"
            >
              Monthly Sales (Bar Graph)
            </h2>
            {loading ? (
              <div>Loading chart...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#7CB9E8" name="Total Sales" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Product Performance Card (Grouped Bar Chart) */}
          <div className="bg-white rounded shadow p-6 w-full lg:w-1/2 flex flex-col items-center justify-center">
            <h2
              className="text-lg font-semibold mb-4 cursor-pointer text-green-700 hover:underline"
              onClick={() => navigate('/dashboard/reports/product-performance')}
              title="View full sales report"
            >
              Product Performance
            </h2>
            {productPerfLoading ? (
              <div>Loading chart...</div>
            ) : productPerfError ? (
              <div className="text-red-500">{productPerfError}</div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={productPerf} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product_name" angle={-30} textAnchor="end" interval={0} height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="vapes_sales_value" fill="#7CB9E8" name="Vapes Sales Value" />
                  <Bar yAxisId="left" dataKey="pouches_sales_value" fill="#fbbf24" name="Pouches Sales Value" />
                  <Bar yAxisId="right" dataKey="vapes_quantity" fill="#34D399" name="Vapes Quantity" />
                  <Bar yAxisId="right" dataKey="pouches_quantity" fill="#f472b6" name="Pouches Quantity" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="mt-6 lg:flex lg:space-x-6">
          {/* Bar Graph Card - Left Side */}
          <div className="bg-white rounded shadow p-6 w-full lg:w-1/2 mb-6 lg:mb-0">
            <h2
              className="text-lg font-semibold mb-4 cursor-pointer text-blue-700 hover:underline"
              onClick={() => navigate('/managers-performance')}
              title="View full sales report"
            >
              Managers Performance
            </h2>
            {/* Managers Performance Pie Chart (react-chartjs-2) */}
            {mpLoading ? (
              <div>Loading managers performance...</div>
            ) : mpError ? (
              <div className="text-red-600 mb-4">{mpError}</div>
            ) : managers && managers.length > 0 ? (
              <div className="w-full max-w-xl mx-auto">
                <Pie
                  data={{
                    labels: managers.map((m: any) => m.name),
                    datasets: [
                      {
                        label: 'Overall %',
                        data: managers.map((m: any) => getManagerOverallPct(m) || 0),
                        backgroundColor: managers.map((_: any, i: number) => {
                          const palette = [
                            '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a21caf', '#f59e42', '#0ea5e9', '#f43f5e', '#16a34a', '#facc15', '#6366f1', '#f87171',
                          ];
                          return palette[i % palette.length];
                        }),
                        borderColor: '#fff',
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { position: 'bottom' },
                      tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.parsed.toFixed(1)}%` } },
                      datalabels: {
                        color: '#222',
                        font: { weight: 'bold' },
                        formatter: (value: number) => `${value.toFixed(1)}%`,
                      },
                    }
                  }}
                />
              </div>
            ) : null}
          </div>
          {/* Pie Chart - Right Side */}
          <div 
          className="bg-white rounded shadow p-6 w-full lg:w-1/2 flex flex-col items-center justify-center">
             
             <h2
              className="text-lg font-semibold mb-2 cursor-pointer text-green-700 hover:underline"
              onClick={() => navigate('/shared-performance')}
              title="View full sales report"
            >
              Sales Rep Performance
            </h2>
             
            {/* Top 10 Sales Reps Bar Chart */}
            <div className="w-full mt-2">
              <h3 className="text-md font-semibold mb-2 text-blue-700">Top 10 Sales Reps (Overall %)</h3>
              <ReResponsiveContainer width="100%" height={350}>
                <ReBarChart
                  data={topReps}
                  margin={{ top: 2, right: 24, left: 0, bottom: 0 }}
                >
                  <ReCartesianGrid strokeDasharray="3 3" />
                  <ReXAxis dataKey="name" type="category" interval={0} angle={-30} textAnchor="end" height={100} />
                  <ReYAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <ReTooltip formatter={v => `${v}%`} />
                  <ReLegend />
                  <ReBar dataKey="overall" fill="#7CB9E8" name="Overall %" />
                </ReBarChart>
              </ReResponsiveContainer>
            </div>
          </div>
        </div>
       
    </div>
  );
};

export default SalesDashboardPage; 