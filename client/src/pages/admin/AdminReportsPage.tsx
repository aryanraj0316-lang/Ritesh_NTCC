import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  PieChart as PieIcon,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { SalesAnalytics } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, getOrderStatusLabel } from '../../lib/formatters';

export const AdminReportsPage: React.FC = () => {
  const [days, setDays] = useState<number>(7);
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async (daysCount: number) => {
    setIsLoading(true);
    try {
      const res = await api.reports.getSales(daysCount);
      if (res.success) setSalesData(res.data);
    } catch (err) {
      console.error('Failed to load sales report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(days);
  }, [days]);

  const handleExportCSV = () => {
    window.open(api.reports.getExportUrl(), '_blank');
  };

  const statusColors: Record<string, string> = {
    PLACED: '#D5CFC3',
    CONFIRMED: '#285943',
    PREPARING: '#B4691B',
    OUT_FOR_DELIVERY: '#52544E',
    READY_FOR_PICKUP: '#77776F',
    COMPLETED: '#2A7A4C',
    CANCELLED: '#9E2A2B',
  };

  const statusPieData = salesData?.statusCounts
    ? Object.entries(salesData.statusCounts).map(([status, count]) => ({
        name: getOrderStatusLabel(status as any),
        value: count,
        color: statusColors[status] || '#77776F',
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            Financial & Volume Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
            Sales & Operational Reports
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real calculations excluding cancelled orders for rigorous GAAP/GST accounting
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Days Range Selector */}
          <div className="flex items-center gap-1 bg-white border border-cream-300 rounded-md p-1 text-xs">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 rounded transition-colors ${
                days === 7 ? 'bg-forest-700 text-white font-semibold' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 rounded transition-colors ${
                days === 30 ? 'bg-forest-700 text-white font-semibold' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDays(90)}
              className={`px-3 py-1 rounded transition-colors ${
                days === 90 ? 'bg-forest-700 text-white font-semibold' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Last Quarter (90d)
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="btn-primary text-xs flex items-center gap-2 py-2 px-3.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wide block mb-1">
            Period Gross Revenue
          </span>
          <span className="font-serif text-2xl font-bold text-forest-800">
            {formatCurrency(salesData?.totalPeriodRevenue || 0)}
          </span>
          <p className="text-[11px] text-charcoal-400 mt-1">Excludes cancelled transactions</p>
        </div>

        <div className="p-5 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wide block mb-1">
            Total Orders Logged
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal-800">
            {salesData?.totalPeriodOrders || 0}
          </span>
          <p className="text-[11px] text-charcoal-400 mt-1">Across all fulfillment modes</p>
        </div>

        <div className="p-5 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wide block mb-1">
            Average Ticket Size (AOV)
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal-800">
            {formatCurrency(
              salesData && salesData.totalPeriodOrders > 0
                ? salesData.totalPeriodRevenue / salesData.totalPeriodOrders
                : 0
            )}
          </span>
          <p className="text-[11px] text-charcoal-400 mt-1">Net revenue divided by order count</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Revenue Bar Chart */}
        <div className="lg:col-span-8 p-6 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
            Daily Revenue Breakdown
          </h3>
          <p className="text-xs text-charcoal-500 mb-6">
            Daily net sales performance for the selected time horizon
          </p>

          <div className="h-64 w-full">
            {salesData?.trend && salesData.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E3DA" vertical={false} />
                  <XAxis dataKey="label" stroke="#77776F" fontSize={11} tickLine={false} />
                  <YAxis stroke="#77776F" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(val), 'Sales']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E3DA',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#285943" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                No revenue records in this timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution Pie Chart */}
        <div className="lg:col-span-4 p-6 bg-white border border-cream-300 rounded-lg shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
              Order Status Distribution
            </h3>
            <p className="text-xs text-charcoal-500 mb-4">
              Lifecycle status ratio for period orders
            </p>
          </div>

          <div className="h-56 w-full">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E3DA',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                No status data available.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-cream-200">
            {statusPieData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[10px] text-charcoal-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best-Selling Culinary Items Table */}
      <div className="bg-white border border-cream-300 rounded-lg shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-charcoal-800">
              Best-Selling Signature Dishes
            </h3>
            <p className="text-xs text-charcoal-500">
              Ranked by quantity ordered and cumulative revenue generated
            </p>
          </div>
          <Award className="w-5 h-5 text-forest-700" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-100 text-charcoal-600 border-b border-cream-300">
                <th className="p-3.5 font-semibold">Rank</th>
                <th className="p-3.5 font-semibold">Dish Name</th>
                <th className="p-3.5 font-semibold">Portions Prepared</th>
                <th className="p-3.5 font-semibold text-right">Cumulative Revenue (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {salesData?.topSellingDishes && salesData.topSellingDishes.length > 0 ? (
                salesData.topSellingDishes.map((dish, idx) => (
                  <tr key={dish.name} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3.5 font-bold text-charcoal-400 w-12">
                      #{idx + 1}
                    </td>
                    <td className="p-3.5 font-semibold text-charcoal-800">
                      {dish.name}
                    </td>
                    <td className="p-3.5 font-medium text-charcoal-700">
                      {dish.quantity} portions
                    </td>
                    <td className="p-3.5 font-bold text-forest-800 text-right">
                      {formatCurrency(dish.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-charcoal-400 text-xs">
                    No dish sales recorded yet for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
