import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Store,
  XCircle,
  FileText,
  AlertCircle,
  Printer,
  ChevronRight,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusStepIndex } from '../../lib/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DietBadge } from '../../components/common/DietBadge';

export const OrderTrackPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();

  const [inputOrderNumber, setInputOrderNumber] = useState(paramOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch order by orderNumber
  const fetchOrder = async (ordNum: string) => {
    if (!ordNum.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.orders.track(ordNum.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(`Order "${ordNum}" could not be located.`);
      }
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify your order number.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) {
      setInputOrderNumber(paramOrderNumber);
      fetchOrder(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  // Live auto-polling every 6 seconds to reflect administrative status changes in real-time
  useEffect(() => {
    if (!order || order.currentStatus === 'COMPLETED' || order.currentStatus === 'CANCELLED') {
      return;
    }
    const interval = setInterval(() => {
      fetchOrder(order.orderNumber);
    }, 6000);

    return () => clearInterval(interval);
  }, [order?.orderNumber, order?.currentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOrderNumber.trim()) {
      navigate(`/track/${encodeURIComponent(inputOrderNumber.trim())}`);
      fetchOrder(inputOrderNumber.trim());
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!cancelReason.trim()) {
      setCancelError('Please specify a brief cancellation reason.');
      return;
    }

    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await api.orders.cancel(order.id, cancelReason.trim());
      if (res.success) {
        setIsCancelModalOpen(false);
        setCancelReason('');
        await fetchOrder(order.orderNumber);
      }
    } catch (err: any) {
      setCancelError(err.message || 'Could not cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const currentStep = order ? getOrderStatusStepIndex(order.currentStatus) : 1;
  const isCancelled = order?.currentStatus === 'CANCELLED';
  const canCancel =
    order &&
    (order.currentStatus === 'PLACED' || order.currentStatus === 'CONFIRMED');

  const steps = [
    { label: 'Order Placed', step: 1 },
    { label: 'Kitchen Confirmed', step: 2 },
    { label: 'Handi Slow-Cooking', step: 3 },
    {
      label: order?.orderType === 'PICKUP' ? 'Ready for Pickup' : 'Out for Delivery',
      step: 4,
    },
    { label: 'Completed / Delivered', step: 5 },
  ];

  return (
    <div className="min-h-screen bg-cream-100 py-10">
      {/* Cancel Reason Dialog */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-cream-300 shadow-modal max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal-800">
              Cancel Order {order?.orderNumber}
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Orders can only be cancelled while in preliminary review. Once our Executive Chef begins cooking in the sealed clay handi, orders cannot be rescinded.
            </p>

            {cancelError && (
              <div className="p-3 bg-brick-50 border border-brick-100 text-brick-900 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-brick-700 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Accidental order, changed dining plans, requested time change..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="form-input text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="btn-destructive text-xs"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="bg-white border border-cream-300 rounded-lg p-6 mb-8 shadow-subtle">
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            Real-Time Concierge Tracking
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800 mb-4">
            Track Your Dining Order
          </h1>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Order Reference Number (e.g. ORD-20261016-1001)"
              value={inputOrderNumber}
              onChange={(e) => setInputOrderNumber(e.target.value)}
              className="form-input text-xs font-mono uppercase"
            />
            <button type="submit" disabled={isLoading} className="btn-primary text-xs px-5">
              {isLoading ? 'Locating...' : 'Track'}
            </button>
          </form>

          {error && (
            <p className="text-xs text-brick-700 mt-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Order Details View */}
        {order && (
          <div className="space-y-6">
            {/* Status Card & Lifecycle Timeline */}
            <div className="bg-white border border-cream-300 rounded-lg p-6 shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-base font-bold text-charcoal-800">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.currentStatus} />
                  </div>
                  <p className="text-xs text-charcoal-500">
                    Placed on {formatDateTime(order.createdAt)} • {order.orderType === 'DELIVERY' ? 'Doorstep Delivery' : 'Boutique Pickup'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchOrder(order.orderNumber)}
                    className="btn-secondary text-xs p-2"
                    title="Refresh live status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>

                  {canCancel && (
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      className="btn-destructive text-xs py-1.5 px-3"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Stepper */}
              {isCancelled ? (
                <div className="p-4 bg-brick-50 border border-brick-100 rounded-md text-xs text-brick-900 space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <XCircle className="w-4 h-4 text-brick-700" />
                    <span>Order Cancelled</span>
                  </div>
                  <p className="text-brick-700">
                    Reason: {order.cancellationReason || 'Cancelled upon request.'}
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-cream-300 -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-0.5 bg-forest-700 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 4) * 100))}%`,
                      }}
                    />

                    {/* Step Nodes */}
                    <div className="relative z-10 flex justify-between">
                      {steps.map((st) => {
                        const isDone = currentStep >= st.step;
                        const isCurrent = currentStep === st.step;

                        return (
                          <div key={st.step} className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                isDone
                                  ? 'bg-forest-700 text-white'
                                  : 'bg-white text-charcoal-400 border-2 border-cream-300'
                              } ${isCurrent ? 'ring-4 ring-forest-100' : ''}`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <span>{st.step}</span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] mt-2 font-medium max-w-[80px] text-center leading-tight ${
                                isDone ? 'text-charcoal-800' : 'text-charcoal-400'
                              } ${isCurrent ? 'font-bold text-forest-800' : ''}`}
                            >
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated Delivery Notice */}
              {!isCancelled && order.currentStatus !== 'COMPLETED' && (
                <div className="p-3.5 bg-cream-100 border border-cream-300 rounded-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-charcoal-700">
                    <Clock className="w-4 h-4 text-forest-700" />
                    <span>
                      Estimated {order.orderType === 'DELIVERY' ? 'Arrival' : 'Readiness'}:{' '}
                      <span className="font-bold text-charcoal-800">
                        {order.estimatedDeliveryTime
                          ? formatDateTime(order.estimatedDeliveryTime)
                          : 'Within 35 minutes'}
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] text-forest-700 font-medium">Live Kitchen Active</span>
                </div>
              )}
            </div>

            {/* Audit Log Timeline */}
            <div className="bg-white border border-cream-300 rounded-lg p-6 shadow-subtle">
              <h3 className="font-serif text-base font-bold text-charcoal-800 mb-4 pb-2 border-b border-cream-200">
                Chronological Kitchen Audit Log
              </h3>
              <div className="space-y-4">
                {order.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-forest-700 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-charcoal-800">
                          {getOrderStatusLabel(item.status)}
                        </span>
                        <span className="text-charcoal-400 text-[11px]">
                          {formatDateTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-charcoal-500 mt-0.5">{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Itemized Snapshot & Bill Receipt */}
            <div className="bg-white border border-cream-300 rounded-lg p-6 shadow-subtle space-y-4">
              <h3 className="font-serif text-base font-bold text-charcoal-800 pb-2 border-b border-cream-200">
                Itemized Order Curations
              </h3>

              <div className="divide-y divide-cream-200 text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      {item.menuItem && (
                        <div className="mt-0.5">
                          <DietBadge isVeg={item.menuItem.isVeg} size="sm" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-charcoal-800">
                          {item.quantity}x {item.itemName}
                        </span>
                        <span className="text-charcoal-400 block text-[11px]">
                          Unit: {formatCurrency(item.itemPrice)}
                        </span>

                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <div className="text-[11px] text-charcoal-500 pl-2 border-l border-cream-300 mt-1 space-y-0.5">
                            {item.selectedAddons.map((addon) => (
                              <div key={addon.name}>
                                + {addon.name} ({formatCurrency(addon.price)})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="font-bold text-charcoal-800">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Summary */}
              <div className="pt-4 border-t border-cream-200 space-y-1.5 text-xs max-w-sm ml-auto">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-forest-700 font-medium">
                    <span>Discount Applied ({order.couponCode})</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal-600">
                  <span>GST 5% (CGST + SGST)</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Packaging & Delivery</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="pt-2 border-t border-cream-300 flex justify-between font-bold text-sm text-charcoal-800">
                  <span>Total Paid / Payable</span>
                  <span className="font-serif text-lg text-forest-800">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="text-[11px] text-charcoal-500 pt-1 flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-semibold uppercase text-charcoal-700">
                    {order.paymentMethod.replace('_', ' ')} ({order.paymentStatus})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
