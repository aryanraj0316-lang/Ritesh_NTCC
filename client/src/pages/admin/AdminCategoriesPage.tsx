import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../lib/api';
import { CategoryFormModal } from '../../components/admin/CategoryFormModal';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Safe delete dialog states
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.categories.getAll(true);
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      const res = await api.categories.delete(
        deletingCategory.id,
        deletingCategory.itemCount && deletingCategory.itemCount > 0 ? reassignTargetId : undefined
      );

      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(null), 3500);
        setDeletingCategory(null);
        setReassignTargetId('');
        fetchCategories();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-cream-100 text-xs px-4 py-3 rounded-lg shadow-elevated border border-charcoal-700 flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-sage-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Safe Delete Reassignment Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-cream-300 shadow-modal max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal-800">
              Delete Category: {deletingCategory.name}
            </h3>

            {deletingCategory.itemCount && deletingCategory.itemCount > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  This category currently contains{' '}
                  <span className="font-bold text-charcoal-800">{deletingCategory.itemCount} menu item(s)</span>.
                  To protect menu integrity, please select another active category to reassign these dishes before deletion:
                </p>

                <div>
                  <label className="block text-xs font-medium text-charcoal-700 mb-1">
                    Reassign Dishes To:
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="form-input text-xs"
                    required
                  >
                    <option value="">Select Target Category...</option>
                    {categories
                      .filter((c) => c.id !== deletingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-charcoal-600 leading-relaxed">
                This category contains no menu items and can be deleted immediately.
              </p>
            )}

            {actionError && (
              <div className="p-3 bg-brick-50 border border-brick-100 text-brick-900 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-brick-700 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={
                  isDeleting ||
                  Boolean(
                    (deletingCategory.itemCount ?? 0) > 0 && !reassignTargetId
                  )
                }
                className="btn-destructive text-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
            Menu Hierarchy & Taxonomy
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
            Category Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Organizing dishes into curated culinary courses and sections
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="btn-primary text-xs flex items-center gap-2 self-start sm:self-auto py-2 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-cream-300 rounded-lg shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-100 text-charcoal-600 border-b border-cream-300">
                <th className="p-3.5 font-semibold">Category Name</th>
                <th className="p-3.5 font-semibold">Slug</th>
                <th className="p-3.5 font-semibold">Description</th>
                <th className="p-3.5 font-semibold">Sort Order</th>
                <th className="p-3.5 font-semibold">Assigned Dishes</th>
                <th className="p-3.5 font-semibold">Active Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-400 text-xs">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-400 text-xs">
                    No categories registered yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3.5 font-bold text-charcoal-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>{cat.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-charcoal-500">{cat.slug}</td>
                    <td className="p-3.5 text-charcoal-600 max-w-sm truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="p-3.5 font-medium text-charcoal-700">{cat.sortOrder}</td>
                    <td className="p-3.5 font-semibold text-charcoal-800">
                      <span className="px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 text-[11px]">
                        {cat.itemCount || 0} dishes
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          cat.isActive
                            ? 'bg-sage-50 text-sage-900 border-sage-100'
                            : 'bg-charcoal-100 text-charcoal-600 border-charcoal-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.isActive ? 'bg-sage-700' : 'bg-charcoal-400'
                          }`}
                        />
                        <span>{cat.isActive ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-200 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 rounded text-charcoal-400 hover:text-brick-700 hover:bg-brick-50 transition-colors"
                          title="Delete Category"
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

      {/* Category Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        category={editingCategory}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSaved={fetchCategories}
      />
    </div>
  );
};
