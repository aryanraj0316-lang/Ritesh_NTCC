import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  ChevronRight,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDateTime, getOrderStatusLabel } from '../../lib/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { DietBadge } from '../common/DietBadge';
import { api } from '../../lib/api';

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  if (!order) return null;

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancellation submodal
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleStatusChange = async (targetStatus: OrderStatus, notes?: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await api.orders.updateStatus(order.id, targetStatus, notes);
      if (res.success) {
        onOrderUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    setIsUpdating(true);
    setError(null);
    try {
      const res = await api.orders.cancel(order.id, cancelReason.trim());
      if (res.success) {
        setIsCancelling(false);
        setCancelReason('');
        onOrderUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-screen max-w-xl bg-white border-l border-cream-300 shadow-modal flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-cream-300 bg-cream-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-mono text-base font-bold text-charcoal-800">
                {order.orderNumber}
              </span>
              <StatusBadge status={order.currentStatus} />
            </div>
            <p className="text-xs text-charcoal-500">
              Placed on {formatDateTime(order.createdAt)} • {order.orderType}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-brick-50 border border-brick-100 text-brick-900 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brick-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Action Transitions State Machine Bar */}
          {order.currentStatus !== 'COMPLETED' && order.currentStatus !== 'CANCELLED' && (
            <div className="p-4 bg-cream-100 border border-cream-300 rounded-lg space-y-2.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-charcoal-600 block">
                Operational Status Progression
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {order.currentStatus === 'PLACED' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('CONFIRMED', 'Order verified and accepted by kitchen')}
                      disabled={isUpdating}
                      className="btn-primary py-2 px-3 text-xs"
                    >
                      <span>Confirm & Accept Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsCancelling(true)}
                      disabled={isUpdating}
                      className="btn-destructive py-2 px-3 text-xs"
                    >
                      Reject Order
                    </button>
                  </>
                )}

                {order.currentStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusChange('PREPARING', 'Sent to Executive Chef for preparation')}
                    disabled={isUpdating}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    <span>Send to Kitchen (Start Cooking)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {order.currentStatus === 'PREPARING' && (
                  <button
                    onClick={() =>
                      handleStatusChange(
                        order.orderType === 'PICKUP' ? 'READY_FOR_PICKUP' : 'OUT_FOR_DELIVERY',
                        order.orderType === 'PICKUP'
                          ? 'Dish packed and ready at concierge desk'
                          : 'Handed over to delivery valet'
                      )
                    }
                    disabled={isUpdating}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    <span>
                      {order.orderType === 'PICKUP'
                        ? 'Mark Ready for Pickup'
                        : 'Dispatch for Doorstep Delivery'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {(order.currentStatus === 'OUT_FOR_DELIVERY' ||
                  order.currentStatus === 'READY_FOR_PICKUP') && (
                  <button
                    onClick={() => handleStatusChange('COMPLETED', 'Delivered to patron')}
                    disabled={isUpdating}
                    className="btn-primary py-2 px-4 text-xs bg-sage-700 hover:bg-sage-900"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Order & Mark Delivered</span>
                  </button>
                )}
              </div>

              {/* Cancel reason input sub-box */}
              {isCancelling && (
                <div className="pt-3 border-t border-cream-300 space-y-2 animate-in fade-in">
                  <label className="block text-xs font-medium text-charcoal-800">
                    Specify Rejection / Cancellation Reason:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen overwhelmed, item out of stock, address unserviceable"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="form-input text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="btn-destructive py-1 px-3 text-xs"
                    >
                      Confirm Cancel
                    </button>
                    <button
                      onClick={() => setIsCancelling(false)}
                      className="btn-secondary py-1 px-3 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer & Delivery Information */}
          <div className="bg-cream-50 border border-cream-300 rounded-lg p-4 space-y-3">
            <h4 className="font-serif text-sm font-semibold text-charcoal-800">
              Patron & Delivery Information
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-charcoal-400 block text-[11px]">Patron Name</span>
                <span className="font-semibold text-charcoal-800">{order.customerName}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block text-[11px]">Contact Phone</span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-semibold text-forest-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  {order.customerPhone}
                </a>
              </div>
              <div className="col-span-2">
                <span className="text-charcoal-400 block text-[11px]">Email</span>
                <span className="text-charcoal-700">{order.customerEmail}</span>
              </div>
              {order.deliveryAddress && (
                <div className="col-span-2">
                  <span className="text-charcoal-400 block text-[11px]">Delivery Destination</span>
                  <span className="text-charcoal-700 flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </span>
                </div>
              )}
              {order.orderNotes && (
                <div className="col-span-2 p-2.5 bg-amberGold-50 border border-amberGold-100 rounded text-amberGold-700">
                  <span className="font-semibold block text-[11px]">Special Instructions:</span>
                  <span>{order.orderNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ordered Items Breakdown */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-charcoal-800">
              Items Ordered ({order.items.length})
            </h4>

            <div className="divide-y divide-cream-200 border border-cream-300 rounded-lg overflow-hidden bg-white">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {item.menuItem && (
                      <div className="mt-0.5">
                        <DietBadge isVeg={item.menuItem.isVeg} size="sm" />
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-charcoal-800">
                        {item.quantity}x {item.itemName}
                      </span>
                      <span className="text-[11px] text-charcoal-400 block">
                        Unit snapshot: {formatCurrency(item.itemPrice)}
                      </span>

                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="mt-1 pl-2 border-l border-cream-300 text-[11px] text-charcoal-500 space-y-0.5">
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
          </div>

          {/* Bill Calculation */}
          <div className="p-4 bg-cream-50 border border-cream-300 rounded-lg space-y-1.5 text-xs">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-forest-700 font-medium">
                <span>Discount ({order.couponCode})</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-600">
              <span>Taxes 5% GST</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Packaging & Delivery</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="pt-2 border-t border-cream-300 flex justify-between font-bold text-sm text-charcoal-800">
              <span>Total Revenue</span>
              <span className="font-serif text-base text-forest-800">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-charcoal-500 pt-1 text-[11px]">
              <span>Payment Details:</span>
              <span className="font-semibold uppercase text-charcoal-700">
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Audit History Log */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-charcoal-800">
              Timestamped Audit Log
            </h4>
            <div className="space-y-2 border-l-2 border-cream-300 pl-3">
              {order.statusHistory.map((item, idx) => (
                <div key={item.id || idx} className="relative pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal-800">
                      {getOrderStatusLabel(item.status)}
                    </span>
                    <span className="text-[10px] text-charcoal-400">
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cream-300 bg-cream-50 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Kitchen KOT</span>
          </button>
          <button onClick={onClose} className="btn-secondary text-xs">
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
