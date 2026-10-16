import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Order, OrderStatus, OrderType } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OrderDetailDrawer } from '../../components/admin/OrderDetailDrawer';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.orders.getAllAdmin({
        status: statusFilter,
        orderType: orderTypeFilter,
        search: searchQuery.trim() || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setOrders(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.totalCount);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, orderTypeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const statusTabs = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Awaiting Review', value: 'PLACED' },
    { label: 'Kitchen Confirmed', value: 'CONFIRMED' },
    { label: 'Cooking Handi', value: 'PREPARING' },
    { label: 'Out / Ready', value: 'OUT_FOR_DELIVERY' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            Dispatch Queue Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
            Order Operations
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Managing {totalCount} total operational records
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-cream-300">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-charcoal-800 text-white'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Secondary Filters Bar */}
      <div className="bg-white border border-cream-300 rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by order number, patron name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-charcoal-600">
            <Filter className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Fulfillment:</span>
            <select
              value={orderTypeFilter}
              onChange={(e) => {
                setOrderTypeFilter(e.target.value);
                setPage(1);
              }}
              className="form-input py-1 text-xs w-auto"
            >
              <option value="ALL">All Types</option>
              <option value="DELIVERY">Delivery Only</option>
              <option value="PICKUP">Pickup Only</option>
              <option value="DINE_IN">Dine-In Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-cream-300 rounded-lg shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-100 text-charcoal-600 border-b border-cream-300">
                <th className="p-3.5 font-semibold">Order Reference</th>
                <th className="p-3.5 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">Patron Details</th>
                <th className="p-3.5 font-semibold">Type</th>
                <th className="p-3.5 font-semibold">Items Snapshot</th>
                <th className="p-3.5 font-semibold">Total</th>
                <th className="p-3.5 font-semibold">Payment</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-charcoal-400 text-xs">
                    Loading order queue...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-charcoal-400 text-xs">
                    No orders matching the specified filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-cream-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold text-charcoal-800">
                      {ord.orderNumber}
                    </td>
                    <td className="p-3.5 text-charcoal-500 whitespace-nowrap">
                      {formatDateTime(ord.createdAt)}
                    </td>
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
                    <td className="p-3.5 max-w-[220px] truncate text-charcoal-600">
                      {ord.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                    </td>
                    <td className="p-3.5 font-bold text-charcoal-800 whitespace-nowrap">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] uppercase tracking-wider text-charcoal-600 block">
                        {ord.paymentMethod.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          ord.paymentStatus === 'PAID'
                            ? 'text-sage-700'
                            : ord.paymentStatus === 'REFUNDED'
                            ? 'text-brick-700'
                            : 'text-amberGold-700'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={ord.currentStatus} size="sm" />
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-cream-300 bg-cream-50 flex items-center justify-between text-xs">
            <span className="text-charcoal-500">
              Showing page {page} of {totalPages} ({totalCount} orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-30"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={() => {
          fetchOrders();
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
