import React from 'react';
import { OrderStatus } from '../../types';
import { getOrderStatusLabel } from '../../lib/formatters';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const getStyle = () => {
    switch (status) {
      case 'PLACED':
        return 'bg-cream-200 text-charcoal-700 border-cream-300';
      case 'CONFIRMED':
        return 'bg-forest-50 text-forest-800 border-forest-100';
      case 'PREPARING':
        return 'bg-amberGold-50 text-amberGold-700 border-amberGold-100';
      case 'OUT_FOR_DELIVERY':
      case 'READY_FOR_PICKUP':
        return 'bg-cream-200 text-forest-800 border-cream-400';
      case 'COMPLETED':
        return 'bg-sage-50 text-sage-900 border-sage-100';
      case 'CANCELLED':
        return 'bg-brick-50 text-brick-900 border-brick-100';
      default:
        return 'bg-cream-100 text-charcoal-700 border-cream-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md tracking-tight ${sizeClasses} ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {getOrderStatusLabel(status)}
    </span>
  );
};
