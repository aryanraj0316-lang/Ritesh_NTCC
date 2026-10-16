import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../lib/formatters';
import { DietBadge } from '../common/DietBadge';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    deliveryFee,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch {
      // Handled in context
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-900/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-cream-300 shadow-modal flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-cream-300 flex items-center justify-between bg-cream-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-forest-700" />
              <div>
                <h2 className="font-serif text-lg font-bold text-charcoal-800">
                  Your Order Cart
                </h2>
                <p className="text-[11px] text-charcoal-500">
                  {cart.length} {cart.length === 1 ? 'curated dish' : 'curated dishes'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cream-100 border border-cream-300 mx-auto flex items-center justify-center text-charcoal-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-base font-semibold text-charcoal-800">
                  Your cart is empty
                </h3>
                <p className="text-xs text-charcoal-500 max-w-xs mx-auto">
                  Explore our menu to discover award-winning Awadhi and royal Indian culinary creations.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-secondary text-xs mt-2"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-cream-50 border border-cream-300 rounded-lg flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            <DietBadge isVeg={item.menuItem.isVeg} size="sm" />
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-semibold text-charcoal-800 leading-snug">
                              {item.menuItem.name}
                            </h4>
                            <span className="text-xs font-semibold text-charcoal-600 block">
                              {formatCurrency(item.menuItem.price)}
                            </span>
                          </div>
                        </div>

                        <span className="text-sm font-bold text-forest-800">
                          {formatCurrency(item.itemTotal)}
                        </span>
                      </div>

                      {/* Customizations snapshot */}
                      {item.selectedAddons.length > 0 && (
                        <div className="ml-5 pl-2 border-l border-cream-300 mb-2 space-y-0.5">
                          {item.selectedAddons.map((addon) => (
                            <div
                              key={addon.name}
                              className="text-[11px] text-charcoal-500 flex justify-between"
                            >
                              <span>+ {addon.name}</span>
                              <span>+{formatCurrency(addon.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stepper & Delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-cream-200 mt-1">
                        <div className="flex items-center border border-cream-300 rounded bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-cream-100 text-charcoal-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-charcoal-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-cream-100 text-charcoal-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-charcoal-400 hover:text-brick-700 p-1 transition-colors text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promotional Coupon Box */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="p-3 bg-forest-50 border border-forest-100 rounded-md flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-forest-800">
                        <Check className="w-4 h-4 text-forest-600 shrink-0" />
                        <div>
                          <span className="font-bold tracking-wider uppercase">
                            {appliedCoupon.code}
                          </span>
                          <span className="block text-[11px] text-forest-600">
                            {appliedCoupon.description} (-{formatCurrency(discountAmount)})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-brick-700 hover:text-brick-900 text-[11px] font-semibold underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
                          <input
                            type="text"
                            placeholder="Enter Promo Code (e.g. ROYAL10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="form-input pl-8 py-1.5 text-xs uppercase font-medium tracking-wide"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isApplyingCoupon || !couponInput.trim()}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          {isApplyingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-brick-700 flex items-center gap-1 pt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {couponError}
                        </p>
                      )}
                      <p className="text-[10px] text-charcoal-400 pt-0.5">
                        Try <span className="font-semibold text-charcoal-600">ROYAL10</span> (10% off &gt; ₹800) or <span className="font-semibold text-charcoal-600">FIRSTBITE</span> (₹150 off &gt; ₹600)
                      </p>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer & Bill Breakdown */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-cream-300 bg-cream-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-forest-700 font-medium">
                    <span>Privilege Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-charcoal-600">
                  <span>Taxes (5% GST: CGST + SGST)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>

                <div className="flex justify-between text-charcoal-600">
                  <div className="flex items-center gap-1">
                    <span>Packaging & Delivery</span>
                    {subtotal >= 999 && (
                      <span className="text-[10px] bg-sage-50 text-sage-900 border border-sage-100 px-1.5 py-0.2 rounded font-medium">
                        FREE
                      </span>
                    )}
                  </div>
                  <span>{deliveryFee === 0 ? '₹0.00' : formatCurrency(deliveryFee)}</span>
                </div>

                <div className="pt-2 border-t border-cream-300 flex justify-between items-baseline font-bold text-sm text-charcoal-800">
                  <span>Total Amount</span>
                  <span className="font-serif text-lg text-forest-800">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
