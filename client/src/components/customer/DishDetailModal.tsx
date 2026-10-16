import React, { useState } from 'react';
import { X, Clock, Plus, Minus, Flame, Info } from 'lucide-react';
import { MenuItem, CartAddon } from '../../types';
import { DietBadge } from '../common/DietBadge';
import { formatCurrency } from '../../lib/formatters';

interface DishDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, addons: CartAddon[]) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);

  const toggleAddon = (name: string, price: number) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.name === name);
      if (exists) {
        return prev.filter((a) => a.name !== name);
      } else {
        return [...prev, { name, price }];
      }
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const currentTotal = (item.price + addonsTotal) * quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-xl rounded-lg border border-cream-300 shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-charcoal-700 hover:text-charcoal-900 shadow-sm border border-cream-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dish Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream-200">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-md shadow-subtle border border-cream-300 flex items-center gap-2">
            <DietBadge isVeg={item.isVeg} showLabel />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-500">
                {item.category?.name}
              </span>
              <h2 className="font-serif text-2xl font-bold text-charcoal-800">
                {item.name}
              </h2>
            </div>
            <span className="font-serif text-2xl font-bold text-forest-800 shrink-0">
              {formatCurrency(item.price)}
            </span>
          </div>

          <p className="text-sm text-charcoal-600 leading-relaxed mb-4">
            {item.description}
          </p>

          {/* Quick Specifications */}
          <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-cream-100 border border-cream-300 rounded-md text-xs mb-5">
            <div>
              <span className="text-charcoal-400 block text-[11px]">Prep Time</span>
              <span className="font-medium text-charcoal-700 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-forest-700" />
                {item.prepTimeMinutes} mins
              </span>
            </div>
            <div>
              <span className="text-charcoal-400 block text-[11px]">Spice Scale</span>
              <span className="font-medium text-charcoal-700 flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-brick-700" />
                {item.spiceLevel === 1 ? 'Mild' : item.spiceLevel === 2 ? 'Medium' : item.spiceLevel === 3 ? 'Spicy' : 'Hot'}
              </span>
            </div>
            <div>
              <span className="text-charcoal-400 block text-[11px]">Energy</span>
              <span className="font-medium text-charcoal-700 mt-0.5 block">
                {item.calories ? `${item.calories} kcal` : 'Chef Handi'}
              </span>
            </div>
          </div>

          {/* Allergen Notice */}
          {item.allergens && (
            <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-5 bg-cream-50 p-2.5 rounded border border-cream-200">
              <Info className="w-3.5 h-3.5 text-amberGold-700 shrink-0" />
              <span>Allergen Warning: {item.allergens}</span>
            </div>
          )}

          {/* Add-ons & Customizations */}
          {item.addons && item.addons.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-charcoal-700 mb-2.5">
                Artisanal Accompaniments & Customizations
              </h4>
              <div className="space-y-2">
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <label
                      key={addon.name}
                      className={`flex items-center justify-between p-3 rounded-md border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-forest-700 bg-forest-50/50 text-charcoal-800'
                          : 'border-cream-300 hover:border-cream-400 bg-white text-charcoal-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon.name, addon.price)}
                          className="w-4 h-4 text-forest-700 rounded border-cream-400 focus:ring-forest-700"
                        />
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="font-semibold text-charcoal-800">
                        +{formatCurrency(addon.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Submit Action */}
          <div className="pt-4 border-t border-cream-300 flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-cream-300 rounded-md bg-cream-100">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-cream-200 text-charcoal-700 transition-colors disabled:opacity-30"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-semibold text-sm text-charcoal-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 hover:bg-cream-200 text-charcoal-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Order Button */}
            <button
              onClick={() => {
                onAddToCart(item, quantity, selectedAddons);
                onClose();
              }}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              <span>Add to Order</span>
              <span>•</span>
              <span>{formatCurrency(currentTotal)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
