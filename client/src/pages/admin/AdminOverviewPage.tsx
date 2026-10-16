import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Truck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { OperationalKPIs, Order, SalesAnalytics } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, formatTime, getOrderStatusLabel } from '../../lib/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OrderDetailDrawer } from '../../components/admin/OrderDetailDrawer';

export const AdminOverviewPage: React.FC = () => {
  const [kpis, setKpis] = useState<OperationalKPIs | null>(null);
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [kpiRes, salesRes] = await Promise.all([
        api.reports.getKPIs(),
        api.reports.getSales(7),
      ]);

      if (kpiRes.success) setKpis(kpiRes.data);
      if (salesRes.success) setSalesData(salesRes.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Title & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            Executive Command & Dispatch
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
            Restaurant Operations Overview
          </h1>
        </div>

        <button
          onClick={fetchDashboardData}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Today's Orders */}
        <div className="p-4 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Orders Today</span>
            <ShoppingBag className="w-4 h-4 text-forest-700" />
          </div>
          <span className="font-serif text-2xl font-bold text-charcoal-800">
            {kpis?.ordersTodayCount || 0}
          </span>
        </div>

        {/* Card 2: Awaiting Confirmation */}
        <div className="p-4 bg-white border border-amberGold-100 rounded-lg shadow-subtle">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-amberGold-700">
              Needs Review
            </span>
            <Clock className="w-4 h-4 text-amberGold-700" />
          </div>
          <span className="font-serif text-2xl font-bold text-amberGold-700">
            {kpis?.awaitingConfirmationCount || 0}
          </span>
        </div>

        {/* Card 3: In Kitchen / Slow Cooking */}
        <div className="p-4 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">In Kitchen</span>
            <ChefHat className="w-4 h-4 text-charcoal-600" />
          </div>
          <span className="font-serif text-2xl font-bold text-charcoal-800">
            {kpis?.inPreparationCount || 0}
          </span>
        </div>

        {/* Card 4: Dispatched / Out */}
        <div className="p-4 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Out / Ready</span>
            <Truck className="w-4 h-4 text-forest-700" />
          </div>
          <span className="font-serif text-2xl font-bold text-charcoal-800">
            {kpis?.outForDeliveryCount || 0}
          </span>
        </div>

        {/* Card 5: Today's Revenue */}
        <div className="p-4 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-forest-700" />
          </div>
          <span className="font-serif text-xl font-bold text-forest-800">
            {formatCurrency(kpis?.todayRevenue || 0)}
          </span>
        </div>

        {/* Card 6: Average Order Value */}
        <div className="p-4 bg-white border border-cream-300 rounded-lg shadow-subtle">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Avg Ticket (AOV)</span>
            <DollarSign className="w-4 h-4 text-charcoal-600" />
          </div>
          <span className="font-serif text-xl font-bold text-charcoal-800">
            {formatCurrency(kpis?.averageOrderValue || 0)}
          </span>
        </div>
      </div>

      {/* 7-Day Revenue Trend Chart */}
      <div className="p-6 bg-white border border-cream-300 rounded-lg shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-base font-bold text-charcoal-800">
              7-Day Net Revenue Trend
            </h3>
            <p className="text-xs text-charcoal-500">
              Daily confirmed and completed revenue in INR (₹)
            </p>
          </div>
          <span className="font-serif text-lg font-bold text-forest-800">
            Total: {formatCurrency(salesData?.totalPeriodRevenue || 0)}
          </span>
        </div>

        <div className="h-64 w-full">
          {salesData?.trend && salesData.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#285943" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#285943" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E3DA" vertical={false} />
                <XAxis dataKey="label" stroke="#77776F" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#77776F"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), 'Net Sales']}
                  labelStyle={{ fontWeight: 600, color: '#242521' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E3DA',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#285943"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
              No historical records for selected range.
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Queue */}
      <div className="bg-white border border-cream-300 rounded-lg shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-charcoal-800">
              Live Incoming Orders Queue
            </h3>
            <p className="text-xs text-charcoal-500">
              Orders requiring immediate operational or culinary review
            </p>
          </div>

          <Link to="/admin/orders" className="btn-secondary text-xs flex items-center gap-1.5">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-100 text-charcoal-600 border-b border-cream-300">
                <th className="p-3.5 font-semibold">Order Ref</th>
                <th className="p-3.5 font-semibold">Time</th>
                <th className="p-3.5 font-semibold">Patron Details</th>
                <th className="p-3.5 font-semibold">Type</th>
                <th className="p-3.5 font-semibold">Items Snapshot</th>
                <th className="p-3.5 font-semibold">Total</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {kpis?.recentOrders && kpis.recentOrders.length > 0 ? (
                kpis.recentOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-cream-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold text-charcoal-800">
                      {ord.orderNumber}
                    </td>
                    <td className="p-3.5 text-charcoal-500">{formatTime(ord.createdAt)}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-charcoal-800 block">
                        {ord.customerName}
                      </span>
                      <span className="text-[11px] text-charcoal-500">{ord.customerPhone}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cream-200 text-charcoal-700">
                        {ord.orderType}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-[200px] truncate text-charcoal-600">
                      {ord.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                    </td>
                    <td className="p-3.5 font-bold text-charcoal-800">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={ord.currentStatus} size="sm" />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="btn-secondary py-1 px-2.5 text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-400 text-xs">
                    No orders recorded today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={() => {
          fetchDashboardData();
          if (selectedOrder) {
            api.orders.getById(selectedOrder.id).then((res) => {
              if (res.success) setSelectedOrder(res.data);
            });
          }
        }}
      />
    </div>
  );
};
