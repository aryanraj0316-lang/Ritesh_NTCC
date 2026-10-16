import React from 'react';

interface DietBadgeProps {
  isVeg: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const DietBadge: React.FC<DietBadgeProps> = ({ isVeg, showLabel = false, size = 'md' }) => {
  const boxSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  if (isVeg) {
    return (
      <span className="inline-flex items-center gap-1.5" title="Vegetarian">
        <span
          className={`inline-flex items-center justify-center ${boxSize} border border-sage-700 bg-white rounded-sm shrink-0`}
        >
          <span className={`${dotSize} rounded-full bg-sage-700`} />
        </span>
        {showLabel && (
          <span className="text-[11px] font-medium tracking-wide uppercase text-sage-900">
            Veg
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5" title="Non-Vegetarian">
      <span
        className={`inline-flex items-center justify-center ${boxSize} border border-brick-700 bg-white rounded-sm shrink-0`}
      >
        <span
          className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-brick-700`}
        />
      </span>
      {showLabel && (
        <span className="text-[11px] font-medium tracking-wide uppercase text-brick-900">
          Non-Veg
        </span>
      )}
    </span>
  );
};
