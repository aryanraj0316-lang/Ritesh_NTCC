import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, CheckCircle2, ChevronRight, Award, UtensilsCrossed } from 'lucide-react';
import { MenuItem, Category } from '../../types';
import { api } from '../../lib/api';
import { DishCard } from '../../components/customer/DishCard';
import { DishDetailModal } from '../../components/customer/DishDetailModal';
import { useCart } from '../../context/CartContext';
import { EmptyState } from '../../components/common/EmptyState';

export const HomePage: React.FC = () => {
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch categories and menu items
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catsRes, menuRes] = await Promise.all([
          api.categories.getAll(),
          api.menu.getAll({ includeUnavailable: false }),
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (menuRes.success) setMenuItems(menuRes.data);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickAdd = (item: MenuItem) => {
    addItem(item, 1, []);
    showToast(`Added "${item.name}" to your order.`);
  };

  const handleModalAdd = (item: MenuItem, quantity: number, addons: any[]) => {
    addItem(item, quantity, addons);
    showToast(`Added ${quantity}x "${item.name}" with custom accompaniments.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    // Category match
    if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) {
      return false;
    }
    // Diet match
    if (dietFilter === 'VEG' && !item.isVeg) {
      return false;
    }
    if (dietFilter === 'NON_VEG' && item.isVeg) {
      return false;
    }
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category?.name.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) {
        return false;
      }
    }
    return true;
  });

  const featuredItems = menuItems.filter((i) => i.isFeatured);

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-cream-100 text-xs px-4 py-3 rounded-lg shadow-elevated border border-charcoal-700 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-sage-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editorial Hero Section */}
      <section className="relative bg-cream-50 border-b border-cream-300 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-cream-300 rounded-full text-xs font-medium text-forest-800">
              <Award className="w-3.5 h-3.5 text-forest-700" />
              <span>Royal Awadhi & Mughlai Gastronomy</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-charcoal-800 tracking-tight leading-[1.15]">
              Every dish tells an ancient story of spice & fire.
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-2xl">
              Slow-cooked handi biryanis sealed with whole-wheat dough, 24-hour simmered Dal Bukhara, and melt-in-mouth Galouti kebabs infused with 160 royal potli herbs.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#menu-section"
                className="btn-primary text-xs sm:text-sm px-5 py-2.5"
              >
                <span>Explore Full Menu</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#story"
                className="btn-secondary text-xs sm:text-sm px-5 py-2.5"
              >
                Our Culinary Craft
              </a>
            </div>

            <div className="pt-6 border-t border-cream-200 flex items-center gap-8 text-xs text-charcoal-500">
              <div>
                <span className="font-serif font-bold text-base text-charcoal-800 block">100% Tamper</span>
                <span>Clay Handi Sealed</span>
              </div>
              <div className="w-[1px] h-8 bg-cream-300" />
              <div>
                <span className="font-serif font-bold text-base text-charcoal-800 block">35-45 Mins</span>
                <span>Express Valet Delivery</span>
              </div>
              <div className="w-[1px] h-8 bg-cream-300" />
              <div>
                <span className="font-serif font-bold text-base text-charcoal-800 block">4.9 / 5.0</span>
                <span>Over 12,000 Patrons</span>
              </div>
            </div>
          </div>

          {/* Right Hero Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-white border border-cream-300 rounded-xl p-4 shadow-elevated">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-cream-200 mb-4">
                <img
                  src="/images/dishes/nawabi_mutton_biryani.jpg"
                  alt="Nawabi Mutton Dum Biryani"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-forest-800/95 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                  Chef's Heritage Masterpiece
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>Slow-Cooked Awadhi Handi</span>
                  <span className="text-forest-700 font-semibold">Ready in 30 mins</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal-800">
                  Nawabi Mutton Dum Biryani
                </h3>
                <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                  Tender baby mutton, brown onion paste, ittar, and 2-year aged Daawat basmati slow-baked in an earthenware handi.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-cream-200 mt-2">
                  <span className="font-serif text-lg font-bold text-charcoal-800">₹685.00</span>
                  <button
                    onClick={() => {
                      const item = menuItems.find((i) => i.slug === 'nawabi-mutton-dum-biryani');
                      if (item) setSelectedDish(item);
                    }}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Order Special
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Menu Section */}
      <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
              A La Carte Curations
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
              The Restaurant Menu
            </h2>
          </div>

          {/* Search Bar & Dietary Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search dishes, curries, kebabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-9 py-2 text-xs"
              />
            </div>

            {/* Diet Switcher */}
            <div className="inline-flex items-center p-1 bg-white border border-cream-300 rounded-md text-xs">
              <button
                onClick={() => setDietFilter('ALL')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  dietFilter === 'ALL'
                    ? 'bg-charcoal-800 text-white'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('VEG')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  dietFilter === 'VEG'
                    ? 'bg-sage-50 text-sage-900 font-bold border border-sage-100'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage-700" />
                Veg Only
              </button>
              <button
                onClick={() => setDietFilter('NON_VEG')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  dietFilter === 'NON_VEG'
                    ? 'bg-brick-50 text-brick-900 font-bold border border-brick-100'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brick-700" />
                Non-Veg
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-cream-200">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === 'ALL'
                ? 'bg-forest-700 text-white border-forest-700 shadow-subtle'
                : 'bg-white text-charcoal-700 border-cream-300 hover:bg-cream-100'
            }`}
          >
            All Courses ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat.id
                  ? 'bg-forest-700 text-white border-forest-700 shadow-subtle'
                  : 'bg-white text-charcoal-700 border-cream-300 hover:bg-cream-100'
              }`}
            >
              {cat.name} {cat.itemCount !== undefined && `(${cat.itemCount})`}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white border border-cream-300 rounded-lg p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-[16/10] bg-cream-200 rounded" />
                <div className="h-4 bg-cream-200 rounded w-3/4" />
                <div className="h-3 bg-cream-200 rounded w-full" />
                <div className="h-8 bg-cream-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No dishes found"
            description="We could not find any culinary items matching your selected dietary preference or search keyword."
            actionText="Reset Filters"
            onAction={() => {
              setSelectedCategory('ALL');
              setDietFilter('ALL');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <DishCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedDish(selected)}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </section>

      {/* Culinary Craft Story Section */}
      <section id="story" className="bg-cream-50 border-t border-cream-300 py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-forest-700">
              The Artisanal Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-800">
              Preserving the Royal Deghs of Awadh
            </h2>
            <div className="w-12 h-0.5 bg-forest-700 mx-auto my-3" />
            <p className="text-sm text-charcoal-600 leading-relaxed">
              At Dastaan, our culinary lineage honors the centuries-old "Dum Pukht" technique — cooking on slow breath. We source raw unrefined mustard oils from Punjab, saffron stems directly from Pampore farmers in Kashmir, and whole spices ground fresh each morning in granite mortars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-center">
            <div className="p-6 bg-white border border-cream-300 rounded-lg">
              <span className="font-serif text-3xl font-bold text-forest-800 block mb-2">24 Hours</span>
              <h4 className="font-serif text-sm font-semibold text-charcoal-800 mb-1">Slow Simmered Dal</h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Dal Bukhara slow-reduced over charcoal with churned butter and sun-ripened tomatoes.
              </p>
            </div>

            <div className="p-6 bg-white border border-cream-300 rounded-lg">
              <span className="font-serif text-3xl font-bold text-forest-800 block mb-2">160 Herbs</span>
              <h4 className="font-serif text-sm font-semibold text-charcoal-800 mb-1">Potli Masala Secret</h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Ancestral spice pouch containing sandalwood, stone flower, rose petals, and wild betel roots.
              </p>
            </div>

            <div className="p-6 bg-white border border-cream-300 rounded-lg">
              <span className="font-serif text-3xl font-bold text-forest-800 block mb-2">100% Earthenware</span>
              <h4 className="font-serif text-sm font-semibold text-charcoal-800 mb-1">Handcrafted Clay Handis</h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Dishes dispatched in sealed earthen pots, preserving moisture, aroma, and delicate nuances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dish Detail Modal */}
      <DishDetailModal
        item={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleModalAdd}
      />
    </div>
  );
};
