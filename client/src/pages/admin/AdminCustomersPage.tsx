import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, ShoppingBag, DollarSign, Calendar, ChevronRight, X, ArrowUpRight } from 'lucide-react';
import { CustomerSummary } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const fetchCustomers = async (search?: string) => {
    setIsLoading(true);
    try {
      const res = await api.customers.getAll(search);
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchQuery.trim());
  };

  return (
    <div className="space-y-6">
      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/50 backdrop-blur-sm flex justify-end">
          <div className="w-screen max-w-lg bg-white border-l border-cream-300 shadow-modal flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-cream-300 bg-cream-50 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal-800">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-charcoal-500">
                  Customer Profile & Dining History
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Contact Snapshot */}
              <div className="p-4 bg-cream-50 border border-cream-300 rounded-lg space-y-2.5">
                <div className="flex items-center gap-2 text-charcoal-700">
                  <Phone className="w-4 h-4 text-forest-700" />
                  <a href={`tel:${selectedCustomer.phone}`} className="font-semibold hover:underline">
                    {selectedCustomer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-charcoal-700">
                  <Mail className="w-4 h-4 text-forest-700" />
                  <span>{selectedCustomer.email}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-cream-300 rounded-lg text-center">
                  <span className="text-[10px] text-charcoal-400 block uppercase font-medium">
                    Total Orders
                  </span>
                  <span className="font-serif text-lg font-bold text-charcoal-800">
                    {selectedCustomer.totalOrders}
                  </span>
                </div>
                <div className="p-3 bg-white border border-cream-300 rounded-lg text-center">
                  <span className="text-[10px] text-charcoal-400 block uppercase font-medium">
                    Completed
                  </span>
                  <span className="font-serif text-lg font-bold text-sage-900">
                    {selectedCustomer.completedOrders}
                  </span>
                </div>
                <div className="p-3 bg-white border border-cream-300 rounded-lg text-center">
                  <span className="text-[10px] text-charcoal-400 block uppercase font-medium">
                    Lifetime Spend
                  </span>
                  <span className="font-serif text-base font-bold text-forest-800">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-semibold text-charcoal-800">
                  Full Order History ({selectedCustomer.orders.length})
                </h4>
                <div className="space-y-2">
                  {selectedCustomer.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 border border-cream-300 rounded-lg bg-cream-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-charcoal-800">
                            {ord.orderNumber}
                          </span>
                          <StatusBadge status={ord.currentStatus} size="sm" />
                        </div>
                        <span className="text-[11px] text-charcoal-500">
                          {formatDateTime(ord.createdAt)}
                        </span>
                      </div>
                      <span className="font-bold text-charcoal-800 text-sm">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cream-300 bg-cream-50 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-secondary text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            CRM & Lifetime Value Directory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
            Patron Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Aggregated from verified database order records and registered accounts
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by patron name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-cream-300 rounded-lg shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-100 text-charcoal-600 border-b border-cream-300">
                <th className="p-3.5 font-semibold">Patron Name</th>
                <th className="p-3.5 font-semibold">Contact Details</th>
                <th className="p-3.5 font-semibold">Total Orders Placed</th>
                <th className="p-3.5 font-semibold">Completed Orders</th>
                <th className="p-3.5 font-semibold">Lifetime Spend (INR)</th>
                <th className="p-3.5 font-semibold">Last Order Date</th>
                <th className="p-3.5 font-semibold text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-400 text-xs">
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-400 text-xs">
                    No customer profiles found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.key}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-cream-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-charcoal-800">
                      {c.name}
                    </td>
                    <td className="p-3.5">
                      <span className="text-charcoal-700 block">{c.phone || '—'}</span>
                      <span className="text-[11px] text-charcoal-400">{c.email}</span>
                    </td>
                    <td className="p-3.5 font-medium text-charcoal-700">
                      {c.totalOrders} order(s)
                    </td>
                    <td className="p-3.5 text-sage-900 font-medium">
                      {c.completedOrders}
                    </td>
                    <td className="p-3.5 font-bold text-forest-800">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="p-3.5 text-charcoal-500 whitespace-nowrap">
                      {formatDateTime(c.lastOrderDate)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <span>History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
