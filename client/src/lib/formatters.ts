import { OrderStatus } from '../types';

export const formatCurrency = (amount: number | string | undefined | null): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateStr: string | Date | undefined | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (dateStr: string | Date | undefined | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateStr: string | Date | undefined | null): string => {
  if (!dateStr) return '—';
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`;
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'PLACED':
      return 'Order Placed';
    case 'CONFIRMED':
      return 'Kitchen Confirmed';
    case 'PREPARING':
      return 'Slow Cooking';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'READY_FOR_PICKUP':
      return 'Ready for Pickup';
    case 'COMPLETED':
      return 'Delivered / Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export const getOrderStatusStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'PLACED':
      return 1;
    case 'CONFIRMED':
      return 2;
    case 'PREPARING':
      return 3;
    case 'OUT_FOR_DELIVERY':
    case 'READY_FOR_PICKUP':
      return 4;
    case 'COMPLETED':
      return 5;
    case 'CANCELLED':
      return -1;
    default:
      return 1;
  }
};
