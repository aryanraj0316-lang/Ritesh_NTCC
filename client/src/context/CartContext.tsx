import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, CartItem, CartAddon } from '../types';
import { api } from '../lib/api';

export interface AppliedCoupon {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number, selectedAddons?: CartAddon[]) => void;
  updateQuantity: (cartRowId: string, quantity: number) => void;
  removeItem: (cartRowId: string) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  totalItemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dastaan_cart_v1';
const COUPON_STORAGE_KEY = 'dastaan_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Persist coupon
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  // Calculate Subtotal
  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  // Recalculate coupon discount if subtotal changes
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.discountAmount && appliedCoupon.discountAmount < discountAmount) {
        discountAmount = appliedCoupon.discountAmount;
      }
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  // 5% GST
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.05 * 100) / 100;

  // Delivery fee: ₹50, free over ₹999
  const deliveryFee = cart.length === 0 ? 0 : subtotal >= 999 ? 0 : 50;

  // Total
  const totalAmount = Math.round((taxableSubtotal + taxAmount + deliveryFee) * 100) / 100;

  // Total items count
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Helper to generate unique cart row ID
  const generateCartRowId = (menuItemId: string, addons: CartAddon[]) => {
    const sortedAddons = [...addons].sort((a, b) => a.name.localeCompare(b.name));
    const addonKey = sortedAddons.map((a) => `${a.name}:${a.price}`).join('|');
    return `${menuItemId}_${addonKey}`;
  };

  const addItem = (menuItem: MenuItem, quantity = 1, selectedAddons: CartAddon[] = []) => {
    const rowId = generateCartRowId(menuItem.id, selectedAddons);
    const addonPriceTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = menuItem.price + addonPriceTotal;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === rowId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          itemTotal: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: rowId,
            menuItem,
            quantity,
            selectedAddons,
            itemTotal: unitPrice * quantity,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartRowId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartRowId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === cartRowId) {
          const addonPriceTotal = item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
          const unitPrice = item.menuItem.price + addonPriceTotal;
          return {
            ...item,
            quantity,
            itemTotal: unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (cartRowId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartRowId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const res = await api.coupons.validate(code, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid promotional code.');
      throw err;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        taxAmount,
        deliveryFee,
        totalAmount,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
        couponError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
