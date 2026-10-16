import React from 'react';
import { Award, Shield, Phone, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 text-cream-300 border-t border-charcoal-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <span className="font-serif text-2xl font-bold tracking-wider text-cream-100 uppercase">
              Dastaan
            </span>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              Preserving and interpreting the timeless culinary legacies of Awadh, the Mughal royal courts, and ancient spice corridors through handcrafted artisanal preparations.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest-500 font-medium pt-2">
              <Award className="w-4 h-4" />
              <span>Michelin Guide Recommended 2025</span>
            </div>
          </div>

          {/* Location & Timings */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Boutique Location
            </h4>
            <div className="flex items-start gap-2.5 text-charcoal-400">
              <MapPin className="w-4 h-4 text-forest-500 shrink-0 mt-0.5" />
              <span>
                Pavilion 4, Horizon Plaza, Golf Course Road, Sector 43, Gurugram, Haryana 122002
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-charcoal-400 pt-1">
              <Phone className="w-4 h-4 text-forest-500 shrink-0" />
              <span>+91 98201 44521 / (0124) 489-2100</span>
            </div>
            <div className="flex items-center gap-2.5 text-charcoal-400">
              <Mail className="w-4 h-4 text-forest-500 shrink-0" />
              <span>concierge@dastaanheritage.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Patron Services
            </h4>
            <ul className="space-y-2 text-charcoal-400">
              <li>
                <Link to="/" className="hover:text-cream-100 transition-colors">
                  A La Carte Menu
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-cream-100 transition-colors">
                  Live Dispatch Tracking
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-cream-100 transition-colors">
                  Order Invoices & Receipts
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-forest-400 hover:text-forest-100 transition-colors font-medium">
                  Kitchen Portal (Staff Only)
                </Link>
              </li>
            </ul>
          </div>

          {/* Authenticity & Hygiene */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Culinary Standards
            </h4>
            <div className="p-3 bg-charcoal-800 rounded-md border border-charcoal-700 space-y-2">
              <div className="flex items-center gap-2 text-forest-400 font-medium text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Tamper-Evident Clay Handi Packaging</span>
              </div>
              <p className="text-[11px] text-charcoal-400 leading-normal">
                Slow-dum cooked dishes are sealed with unbleached flour dough and dispatched in thermal earthenware to preserve steam and fragrant essential oils.
              </p>
            </div>
            <p className="text-[10px] text-charcoal-500 pt-1">
              FSSAI License No: 10822005000188
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-charcoal-500 gap-4">
          <p>© {new Date().getFullYear()} Dastaan Heritage Kitchen Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>GST Registration: 06AABCD1234E1Z5</span>
            <span>Handcrafted in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
