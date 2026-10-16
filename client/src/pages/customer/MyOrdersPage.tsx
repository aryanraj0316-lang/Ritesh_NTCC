import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Clock, RefreshCw, ShoppingBag } from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

export const MyOrdersPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await api.orders.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-cream-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            Patron Records
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
            My Dining Order History
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Logged in as {user?.name} ({user?.email})
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-5 bg-white border border-cream-300 rounded-lg animate-pulse h-28" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No previous orders found"
            description="You haven't placed any royal culinary orders with us yet."
            actionText="Browse Menu"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-cream-300 rounded-lg p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-charcoal-800">
                      {ord.orderNumber}
                    </span>
                    <StatusBadge status={ord.currentStatus} size="sm" />
                  </div>

                  <p className="text-xs text-charcoal-500">
                    {formatDateTime(ord.createdAt)} • {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                  </p>

                  <div className="text-xs text-charcoal-700 font-medium">
                    {ord.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-cream-200 gap-2">
                  <span className="font-serif text-base font-bold text-forest-800">
                    {formatCurrency(ord.totalAmount)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/track/${ord.orderNumber}`}
                      className="btn-secondary text-xs py-1 px-3"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
