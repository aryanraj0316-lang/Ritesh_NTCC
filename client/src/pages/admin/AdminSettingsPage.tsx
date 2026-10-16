import React, { useState, useEffect } from 'react';
import { Settings, Shield, Clock, Percent, Truck, Tag, CheckCircle2 } from 'lucide-react';
import { Coupon } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/formatters';

export const AdminSettingsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [restaurantName, setRestaurantName] = useState('Dastaan Heritage Kitchen');
  const [restaurantPhone, setRestaurantPhone] = useState('+91 98201 44521');
  const [restaurantAddress, setRestaurantAddress] = useState(
    'Pavilion 4, Horizon Plaza, Golf Course Road, Sector 43, Gurugram, Haryana 122002'
  );
  const [gstRate, setGstRate] = useState(5.0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(999);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(50);

  useEffect(() => {
    api.coupons.getAll().then((res) => {
      if (res.success) setCoupons(res.data);
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-cream-100 text-xs px-4 py-3 rounded-lg shadow-elevated border border-charcoal-700 flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-sage-500 shrink-0" />
          <span>Operational parameters saved successfully.</span>
        </div>
      )}

      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-forest-700 block mb-1">
          Store Configuration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-800">
          Restaurant Operational Settings
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Manage boutique contact details, tax compliance, and delivery fee thresholds
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Boutique Profile */}
        <div className="p-5 bg-white border border-cream-300 rounded-lg shadow-subtle space-y-4">
          <h3 className="font-serif text-sm font-semibold text-charcoal-800 pb-2 border-b border-cream-200">
            Boutique Identity & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Establishment Brand Name
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="form-input text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Concierge Contact Phone
              </label>
              <input
                type="text"
                value={restaurantPhone}
                onChange={(e) => setRestaurantPhone(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Flagship Boutique Location Address
              </label>
              <textarea
                rows={2}
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                className="form-input text-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* Financial & Delivery Parameters */}
        <div className="p-5 bg-white border border-cream-300 rounded-lg shadow-subtle space-y-4">
          <h3 className="font-serif text-sm font-semibold text-charcoal-800 pb-2 border-b border-cream-200">
            Taxes & Delivery Economics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Standard GST Tax Rate (%)
              </label>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
                <input
                  type="number"
                  step="0.1"
                  value={gstRate}
                  onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                  className="form-input pl-9 text-xs"
                />
              </div>
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                2.5% CGST + 2.5% SGST Restaurant Rate
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Free Delivery Order Threshold (INR ₹)
              </label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(parseInt(e.target.value, 10) || 0)}
                className="form-input text-xs"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Orders &gt;= ₹{freeDeliveryThreshold} enjoy free delivery
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Base Delivery Fee (INR ₹)
              </label>
              <input
                type="number"
                value={baseDeliveryFee}
                onChange={(e) => setBaseDeliveryFee(parseInt(e.target.value, 10) || 0)}
                className="form-input text-xs"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Applied on orders below threshold
              </span>
            </div>
          </div>
        </div>

        {/* Active Promotional Coupons */}
        <div className="p-5 bg-white border border-cream-300 rounded-lg shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cream-200">
            <h3 className="font-serif text-sm font-semibold text-charcoal-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-forest-700" />
              <span>Active Promotional Codes</span>
            </h3>
            <span className="text-[11px] text-charcoal-500">{coupons.length} active coupons</span>
          </div>

          <div className="divide-y divide-cream-200 text-xs">
            {coupons.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-forest-800 tracking-wider">
                    {c.code}
                  </span>
                  <span className="text-charcoal-500 block text-[11px] mt-0.5">
                    {c.description} (Min Order: {formatCurrency(c.minOrderAmount)})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-charcoal-800">
                    {c.discountType === 'PERCENTAGE'
                      ? `${c.discountValue}% OFF`
                      : `${formatCurrency(c.discountValue)} OFF`}
                  </span>
                  {c.maxDiscountAmount && (
                    <span className="block text-[10px] text-charcoal-400">
                      Capped at {formatCurrency(c.maxDiscountAmount)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary py-2.5 px-6 text-xs">
            Save Operational Parameters
          </button>
        </div>
      </form>
    </div>
  );
};
