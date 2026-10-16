import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { MenuItem, Category, MenuItemAddon } from '../../types';
import { api } from '../../lib/api';

interface MenuItemFormModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  isOpen,
  item,
  categories,
  onClose,
  onSaved,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(25);
  const [spiceLevel, setSpiceLevel] = useState(1);
  const [calories, setCalories] = useState<number | ''>('');
  const [allergens, setAllergens] = useState('');
  const [addons, setAddons] = useState<{ name: string; price: number }[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price);
      setCategoryId(item.categoryId);
      setIsVeg(item.isVeg);
      setIsAvailable(item.isAvailable);
      setIsFeatured(item.isFeatured);
      setImageUrl(item.imageUrl);
      setPrepTimeMinutes(item.prepTimeMinutes);
      setSpiceLevel(item.spiceLevel);
      setCalories(item.calories || '');
      setAllergens(item.allergens || '');
      setAddons(item.addons ? item.addons.map((a) => ({ name: a.name, price: a.price })) : []);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories[0]?.id || '');
      setIsVeg(true);
      setIsAvailable(true);
      setIsFeatured(false);
      setImageUrl('/images/dishes/nawabi_mutton_biryani.jpg');
      setPrepTimeMinutes(20);
      setSpiceLevel(1);
      setCalories('');
      setAllergens('');
      setAddons([]);
    }
    setError(null);
  }, [item, categories]);

  const handleAddAddon = () => {
    setAddons([...addons, { name: '', price: 50 }]);
  };

  const handleRemoveAddon = (index: number) => {
    setAddons(addons.filter((_, idx) => idx !== index));
  };

  const handleAddonChange = (index: number, field: 'name' | 'price', value: any) => {
    const updated = [...addons];
    updated[index] = { ...updated[index], [field]: value };
    setAddons(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Dish name is required.');
    if (!description.trim()) return setError('Description is required.');
    if (!price || Number(price) <= 0) return setError('Valid price in INR is required.');
    if (!categoryId) return setError('Please assign a menu category.');
    if (!imageUrl.trim()) return setError('Valid image URL is required.');

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId,
        isVeg,
        isAvailable,
        isFeatured,
        imageUrl: imageUrl.trim(),
        prepTimeMinutes: Number(prepTimeMinutes) || 20,
        spiceLevel: Number(spiceLevel) || 1,
        calories: calories ? Number(calories) : undefined,
        allergens: allergens.trim() || undefined,
        addons: addons.filter((a) => a.name.trim().length > 0),
      };

      if (item) {
        await api.menu.update(item.id, payload);
      } else {
        await api.menu.create(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-2xl rounded-lg border border-cream-300 shadow-modal overflow-hidden p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-cream-100 text-charcoal-400 hover:text-charcoal-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="font-serif text-xl font-bold text-charcoal-800 mb-1">
          {item ? 'Edit Culinary Item' : 'Add New Royal Dish'}
        </h2>
        <p className="text-xs text-charcoal-500 mb-6">
          Configure dish pricing, gastronomy notes, dietary classifications, and optional accompaniments.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-brick-50 border border-brick-100 text-brick-900 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brick-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Awadhi Murgh Biryani"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Menu Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-input text-xs"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Gastronomic Description *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Heritage recipe history, spice blend, cooking technique, slow simmer duration..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Price (INR ₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="580.00"
                value={price}
                onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Image URL or Local Path *
              </label>
              <input
                type="text"
                required
                placeholder="/images/dishes/nawabi_mutton_biryani.jpg or https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Preparation Time (Minutes)
              </label>
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(parseInt(e.target.value, 10) || 20)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Spice Scale (1 = Mild, 4 = Extra Hot)
              </label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(parseInt(e.target.value, 10))}
                className="form-input text-xs"
              >
                <option value={1}>1 - Mild & Fragrant</option>
                <option value={2}>2 - Medium Balanced</option>
                <option value={3}>3 - Robust & Spicy</option>
                <option value={4}>4 - Royal Angaari (Hot)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Caloric Value (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 640"
                value={calories}
                onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value, 10) : '')}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Allergen Advisory
              </label>
              <input
                type="text"
                placeholder="e.g. Contains Dairy, Cashews, Gluten"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-cream-50 border border-cream-200 rounded-md">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="w-4 h-4 text-forest-700 rounded"
              />
              <span className="text-xs font-medium text-charcoal-800">Vegetarian Diet</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-forest-700 rounded"
              />
              <span className="text-xs font-medium text-charcoal-800">Available Today</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-forest-700 rounded"
              />
              <span className="text-xs font-medium text-charcoal-800">Chef's Signature</span>
            </label>
          </div>

          {/* Custom Addons Builder */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Optional Accompaniments & Add-ons
              </span>
              <button
                type="button"
                onClick={handleAddAddon}
                className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Addon</span>
              </button>
            </div>

            {addons.length === 0 ? (
              <p className="text-[11px] text-charcoal-400 italic">
                No add-ons configured for this dish.
              </p>
            ) : (
              <div className="space-y-2">
                {addons.map((ad, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Addon name (e.g. Burani Garlic Raita)"
                      value={ad.name}
                      onChange={(e) => handleAddonChange(idx, 'name', e.target.value)}
                      className="form-input text-xs flex-1"
                    />
                    <div className="w-28 relative">
                      <span className="absolute left-2.5 top-2 text-charcoal-400 text-xs">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={ad.price}
                        onChange={(e) =>
                          handleAddonChange(idx, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="form-input text-xs pl-6"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(idx)}
                      className="p-2 text-charcoal-400 hover:text-brick-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-cream-300 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs px-5">
              {isSubmitting ? 'Saving Dish...' : item ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
