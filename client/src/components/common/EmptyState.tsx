import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white border border-cream-300 rounded-lg">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-cream-100 text-charcoal-500 border border-cream-300">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-lg font-medium text-charcoal-800 mb-1.5">{title}</h3>
      <p className="max-w-sm text-sm text-charcoal-500 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-secondary text-xs">
          {actionText}
        </button>
      )}
    </div>
  );
};
