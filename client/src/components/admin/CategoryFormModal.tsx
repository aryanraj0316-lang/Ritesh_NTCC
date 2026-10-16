import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../lib/api';

interface CategoryFormModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  category,
  onClose,
  onSaved,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setSortOrder(category.sortOrder);
      setIsActive(category.isActive);
    } else {
      setName('');
      setDescription('');
      setSortOrder(0);
      setIsActive(true);
    }
    setError(null);
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      if (category) {
        await api.categories.update(category.id, payload);
      } else {
        await api.categories.create(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-md rounded-lg border border-cream-300 shadow-modal p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-cream-100 text-charcoal-400 hover:text-charcoal-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="font-serif text-xl font-bold text-charcoal-800 mb-1">
          {category ? 'Edit Menu Category' : 'Create Menu Category'}
        </h2>
        <p className="text-xs text-charcoal-500 mb-5">
          Categories organize dishes across customer browsing menus and kitchen preparation sections.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-brick-50 border border-brick-100 text-brick-900 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brick-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-charcoal-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Awadhi Biryanis"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 mb-1">
              Description (Editorial Subtitle)
            </label>
            <textarea
              rows={2}
              placeholder="Brief culinary note describing the preparation style..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="form-input text-xs"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-forest-700 rounded"
                />
                <span className="text-xs font-medium text-charcoal-800">Active on Menu</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-cream-300 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs px-5">
              {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
