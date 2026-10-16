import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Truck,
  Store,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/formatters';
import { OrderType, PaymentMethod } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, discountAmount, taxAmount, deliveryFee, totalAmount, appliedCoupon, clearCart } =
    useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');

  // Simulated gateway dialog states
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [simulationStep, setSimulationStep] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [simulationRef, setSimulationRef] = useState<string | null>(null);

  // General error and submitting
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setDeliveryAddress(
          `${defaultAddr.street}, ${defaultAddr.landmark ? defaultAddr.landmark + ', ' : ''}${defaultAddr.city} ${defaultAddr.postalCode}`
        );
      }
    }
  }, [user]);

  // If cart is empty, redirect to menu
  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      navigate('/');
    }
  }, [cart, navigate, isSubmitting]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!customerName.trim()) {
      setError('Please provide your full recipient name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please provide a valid email address for order notifications.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile contact number.');
      return;
    }
    if (orderType === 'DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 8)) {
      setError('Please enter a full delivery address including house/flat number and locality.');
      return;
    }

    // If simulated UPI or CARD is selected, show simulated payment authorization dialog first!
    if (paymentMethod === 'UPI_SIMULATED' || paymentMethod === 'CARD_SIMULATED') {
      setIsSimulatingPayment(true);
      setSimulationStep('PROCESSING');

      // Simulate a 2.5 second gateway confirmation
      setTimeout(() => {
        const ref = `PAY_SIM_${Date.now().toString().slice(-8)}`;
        setSimulationRef(ref);
        setSimulationStep('SUCCESS');

        // Finish after 1 second
        setTimeout(async () => {
          setIsSimulatingPayment(false);
          await submitOrderToBackend(ref);
        }, 1200);
      }, 2200);
      return;
    }

    // Cash on Delivery proceeds directly
    await submitOrderToBackend(null);
  };

  const submitOrderToBackend = async (refToken: string | null) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        orderNotes: orderNotes.trim() || null,
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
        paymentConfirmationRef: refToken,
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          selectedAddons: item.selectedAddons.map((a) => a.name),
        })),
      };

      const res = await api.orders.create(payload);
      if (res.success && res.data) {
        clearCart();
        navigate(`/track/${res.data.orderNumber}`);
      } else {
        throw new Error(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-10">
      {/* Simulated Payment Modal */}
      {isSimulatingPayment && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-cream-300 shadow-modal max-w-sm w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            {simulationStep === 'PROCESSING' ? (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-forest-700 border-t-transparent animate-spin mx-auto" />
                <h3 className="font-serif text-lg font-bold text-charcoal-800">
                  Authorizing Simulated Payment
                </h3>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Connecting to sandbox gateway for{' '}
                  <span className="font-semibold text-charcoal-800">{formatCurrency(totalAmount)}</span>.
                  Validating mock credentials...
                </p>
                <span className="inline-block px-2.5 py-1 bg-cream-100 rounded text-[10px] text-charcoal-500 font-mono">
                  Mode: Safe Simulated Gateway
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-sage-50 text-sage-900 border border-sage-100 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-sage-700" />
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal-800">
                  Payment Confirmed!
                </h3>
                <p className="text-xs text-charcoal-500">
                  Reference: <span className="font-mono font-bold text-charcoal-800">{simulationRef}</span>
                </p>
                <p className="text-[11px] text-forest-700">Dispatching order to royal kitchen...</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-charcoal-600 hover:text-charcoal-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Menu</span>
        </Link>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800 mb-2">
          Patron Checkout & Dining Dispatch
        </h1>
        <p className="text-xs text-charcoal-500 mb-8">
          Review your dining items and provide dispatch instructions for our concierge team.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-brick-50 border border-brick-100 rounded-md text-xs text-brick-900 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-brick-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Details, Fulfillment, Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Order Type */}
            <div className="bg-white border border-cream-300 rounded-lg p-5">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-charcoal-700 mb-3 flex items-center gap-2">
                <span>1. Fulfillment Preference</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`p-3.5 rounded-md border text-left flex items-start gap-3 transition-colors ${
                    orderType === 'DELIVERY'
                      ? 'border-forest-700 bg-forest-50/40 text-charcoal-800'
                      : 'border-cream-300 hover:border-cream-400 bg-white text-charcoal-600'
                  }`}
                >
                  <Truck className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs block">Home Doorstep Delivery</span>
                    <span className="text-[11px] text-charcoal-500 leading-tight">
                      Express thermal dispatch (35-45 mins)
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`p-3.5 rounded-md border text-left flex items-start gap-3 transition-colors ${
                    orderType === 'PICKUP'
                      ? 'border-forest-700 bg-forest-50/40 text-charcoal-800'
                      : 'border-cream-300 hover:border-cream-400 bg-white text-charcoal-600'
                  }`}
                >
                  <Store className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs block">Concierge Boutique Pickup</span>
                    <span className="text-[11px] text-charcoal-500 leading-tight">
                      Ready at restaurant desk (20-25 mins)
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Contact Information */}
            <div className="bg-white border border-cream-300 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-charcoal-700 mb-1">
                2. Patron Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98112 34567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-charcoal-700 mb-1">
                    Email Address (For Tax Receipt) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Delivery Address (if Delivery) */}
            {orderType === 'DELIVERY' && (
              <div className="bg-white border border-cream-300 rounded-lg p-5 space-y-3">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-charcoal-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest-700" />
                  <span>3. Delivery Destination</span>
                </h3>

                <div>
                  <label className="block text-xs font-medium text-charcoal-700 mb-1">
                    Complete Street Address & Landmark *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Flat / Villa number, building name, street, nearby landmark, city, postal code..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="form-input text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Special Instructions */}
            <div className="bg-white border border-cream-300 rounded-lg p-5">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-charcoal-700 mb-2">
                4. Kitchen & Dining Notes
              </h3>
              <input
                type="text"
                placeholder="Allergy notes, extra cutlery, ring doorbell, leave at front desk, etc."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            {/* Step 5: Payment Method */}
            <div className="bg-white border border-cream-300 rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-charcoal-700 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>5. Payment Method</span>
              </h3>

              <div className="space-y-2">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-forest-700 bg-forest-50/40 text-charcoal-800'
                      : 'border-cream-300 hover:border-cream-400 bg-white text-charcoal-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="mt-1 text-forest-700 focus:ring-forest-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Banknote className="w-4 h-4 text-charcoal-700" />
                      <span>Cash on Delivery / Pay at Counter</span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      Pay via Cash or Handheld UPI upon arrival of your thermal parcel.
                    </p>
                  </div>
                </label>

                {/* Simulated UPI */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
                    paymentMethod === 'UPI_SIMULATED'
                      ? 'border-forest-700 bg-forest-50/40 text-charcoal-800'
                      : 'border-cream-300 hover:border-cream-400 bg-white text-charcoal-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI_SIMULATED"
                    checked={paymentMethod === 'UPI_SIMULATED'}
                    onChange={() => setPaymentMethod('UPI_SIMULATED')}
                    className="mt-1 text-forest-700 focus:ring-forest-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <QrCode className="w-4 h-4 text-forest-700" />
                      <span>Instant UPI / QR Code (Simulated Sandbox)</span>
                      <span className="text-[10px] bg-forest-100 text-forest-900 px-1.5 py-0.2 rounded font-medium">
                        Instant Mock
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      Simulates instant verification using Google Pay, PhonePe, or Paytm gateway.
                    </p>
                  </div>
                </label>

                {/* Simulated Card */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
                    paymentMethod === 'CARD_SIMULATED'
                      ? 'border-forest-700 bg-forest-50/40 text-charcoal-800'
                      : 'border-cream-300 hover:border-cream-400 bg-white text-charcoal-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD_SIMULATED"
                    checked={paymentMethod === 'CARD_SIMULATED'}
                    onChange={() => setPaymentMethod('CARD_SIMULATED')}
                    className="mt-1 text-forest-700 focus:ring-forest-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <CreditCard className="w-4 h-4 text-forest-700" />
                      <span>Credit / Debit Card (Simulated Sandbox)</span>
                      <span className="text-[10px] bg-forest-100 text-forest-900 px-1.5 py-0.2 rounded font-medium">
                        Instant Mock
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      Visa, Mastercard, RuPay, and Diners Club simulated secure transaction.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-cream-300 rounded-lg p-5 sticky top-28 space-y-4 shadow-subtle">
              <h3 className="font-serif text-base font-bold text-charcoal-800 pb-3 border-b border-cream-200">
                Order Curations Summary
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs divide-y divide-cream-200">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-charcoal-800">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        {item.selectedAddons.length > 0 && (
                          <div className="text-[11px] text-charcoal-500 pl-3">
                            {item.selectedAddons.map((a) => a.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-charcoal-800">
                        {formatCurrency(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Breakdown */}
              <div className="pt-3 border-t border-cream-200 space-y-2 text-xs">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-forest-700 font-medium">
                    <span>Privilege Promo ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-charcoal-600">
                  <span>GST 5% (CGST 2.5% + SGST 2.5%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>

                <div className="flex justify-between text-charcoal-600">
                  <span>Packaging & Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span>
                </div>

                <div className="pt-3 border-t border-cream-300 flex justify-between items-baseline font-bold text-sm text-charcoal-800">
                  <span>Grand Total</span>
                  <span className="font-serif text-xl text-forest-800">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSimulatingPayment}
                className="btn-primary w-full py-3 text-sm font-semibold mt-4"
              >
                {isSubmitting ? 'Placing Order...' : `Confirm & Place Order • ${formatCurrency(totalAmount)}`}
              </button>

              <div className="text-[11px] text-charcoal-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                <span>Verified End-to-End Kitchen Encryption</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
