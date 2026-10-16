import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Flame } from 'lucide-react';
import { MenuItem, Category } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/formatters';
import { DietBadge } from '../../components/common/DietBadge';
import { MenuItemFormModal } from '../../components/admin/MenuItemFormModal';

export const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Action feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, menuRes] = await Promise.all([
        api.categories.getAll(true),
        api.menu.getAll({ includeUnavailable: true }),
      ]);

      if (catsRes.success) setCategories(catsRes.data);
      if (menuRes.success) setItems(menuRes.data);
    } catch (err) {
      console.error('Failed to load menu admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await api.menu.toggleAvailability(item.id);
      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
        );
        setActionSuccess(`"${item.name}" availability updated.`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle availability.');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!window.confirm(`Are you sure you want to delete or archive "${item.name}"?`)) {
      return;
    }

    try {
      const res = await api.menu.delete(item.id);
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(null), 3500);
        fetchMenuData();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete item.');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) return false;
    if (dietFilter === 'VEG' && !item.isVeg) return false;
    if (dietFilter === 'NON_VEG' && item.isVeg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-cream-100 text-xs px-4 py-3 rounded-lg shadow-elevated border border-charcoal-700 flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-sage-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="fixed bottom-6 right-6 z-50 bg-brick-900 text-white text-xs px-4 py-3 rounded-lg shadow-elevated border border-brick-700 flex items-center gap-2 animate-in slide-in-from-bottom">
          <AlertCircle className="w-4 h-4 text-brick-100 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            Menu Catalog & Pricing
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
            A La Carte Menu Directory
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            {items.length} items registered across {categories.length} categories
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="btn-primary text-xs flex items-center gap-2 self-start sm:self-auto py-2 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-cream-300 rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-subtle">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        {/* Category & Diet Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input text-xs w-auto py-1.5"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value as any)}
            className="form-input text-xs w-auto py-1.5"
          >
            <option value="ALL">All Diets</option>
            <option value="VEG">Vegetarian Only</option>
            <option value="NON_VEG">Non-Vegetarian Only</option>
          </select>

          <button
            onClick={fetchMenuData}
            title="Reload Menu"
            className="btn-secondary text-xs p-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white border border-cream-300 rounded-lg shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-100 text-charcoal-600 border-b border-cream-300">
                <th className="p-3.5 font-semibold">Dish & Imagery</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Diet</th>
                <th className="p-3.5 font-semibold">Price (INR)</th>
                <th className="p-3.5 font-semibold">Prep Time</th>
                <th className="p-3.5 font-semibold">Addons</th>
                <th className="p-3.5 font-semibold">Availability Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-400 text-xs">
                    Loading menu database...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-400 text-xs">
                    No dishes found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                    {/* Dish & Image */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover border border-cream-300 bg-cream-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-charcoal-800">{item.name}</span>
                            {item.isFeatured && (
                              <span className="bg-forest-100 text-forest-900 text-[9px] uppercase font-bold px-1 rounded">
                                Signature
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-charcoal-500 line-clamp-1 max-w-xs">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 font-medium text-charcoal-700">
                      {item.category?.name || 'Unassigned'}
                    </td>

                    {/* Diet */}
                    <td className="p-3.5">
                      <DietBadge isVeg={item.isVeg} showLabel size="sm" />
                    </td>

                    {/* Price */}
                    <td className="p-3.5 font-bold text-charcoal-800">
                      {formatCurrency(item.price)}
                    </td>

                    {/* Prep Time */}
                    <td className="p-3.5 text-charcoal-600">
                      {item.prepTimeMinutes} mins
                    </td>

                    {/* Addons Count */}
                    <td className="p-3.5 text-charcoal-600">
                      {item.addons?.length || 0} configured
                    </td>

                    {/* Availability Switch */}
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          item.isAvailable
                            ? 'bg-sage-50 text-sage-900 border-sage-100 hover:bg-sage-100'
                            : 'bg-charcoal-100 text-charcoal-500 border-charcoal-200 hover:bg-charcoal-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isAvailable ? 'bg-sage-700' : 'bg-charcoal-400'
                          }`}
                        />
                        <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-200 transition-colors"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded text-charcoal-400 hover:text-brick-700 hover:bg-brick-50 transition-colors"
                          title="Delete or Archive Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <MenuItemFormModal
        isOpen={isModalOpen}
        item={editingItem}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSaved={fetchMenuData}
      />
    </div>
  );
};
