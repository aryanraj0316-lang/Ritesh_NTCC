import React from 'react';
import { Clock, Plus, Flame } from 'lucide-react';
import { MenuItem } from '../../types';
import { DietBadge } from '../common/DietBadge';
import { formatCurrency } from '../../lib/formatters';

interface DishCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ item, onSelect, onQuickAdd }) => {
  const hasAddons = item.addons && item.addons.length > 0;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group flex flex-col bg-white border border-cream-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-cream-400 hover:shadow-subtle cursor-pointer"
    >
      {/* Food Photography */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-200">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <DietBadge isVeg={item.isVeg} />
        </div>

        {item.isFeatured && (
          <span className="absolute top-2.5 right-2.5 bg-forest-800/90 text-white text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-sm">
            Chef's Signature
          </span>
        )}

        <div className="absolute bottom-2.5 right-2.5 bg-charcoal-900/75 backdrop-blur-sm text-cream-100 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-cream-300" />
          <span>{item.prepTimeMinutes}m</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Spice */}
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
            <span className="text-[11px] font-medium tracking-wide uppercase text-charcoal-500">
              {item.category?.name}
            </span>
            {item.spiceLevel > 1 && (
              <span className="flex items-center gap-0.5 text-brick-700 text-[10px] font-medium" title={`Spice Level: ${item.spiceLevel}/4`}>
                <Flame className="w-3 h-3 fill-brick-700" />
                {item.spiceLevel === 2 ? 'Medium' : item.spiceLevel === 3 ? 'Spicy' : 'Hot'}
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h3 className="font-serif text-base font-semibold text-charcoal-800 group-hover:text-forest-700 transition-colors line-clamp-1 mb-1.5">
            {item.name}
          </h3>

          {/* Gastronomic Description */}
          <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Pricing & Add Action */}
        <div className="pt-2 border-t border-cream-200 flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-charcoal-400 block -mb-0.5">Price</span>
            <span className="text-base font-bold text-charcoal-800 tracking-tight">
              {formatCurrency(item.price)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasAddons) {
                onSelect(item);
              } else {
                onQuickAdd(item);
              }
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-cream-100 hover:bg-forest-700 hover:text-white text-forest-800 border border-cream-300 hover:border-forest-700 rounded-md text-xs font-semibold tracking-tight transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{hasAddons ? 'Customize' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
