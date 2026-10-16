import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, LogOut, Clock, Compass, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/formatters';

interface CustomerHeaderProps {
  onOpenAuthModal?: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({ onOpenAuthModal }) => {
  const { totalItemsCount, subtotal, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-300">
      {/* Top Heritage Notice Bar */}
      <div className="bg-charcoal-800 text-cream-200 text-[11px] font-medium tracking-wide py-1.5 px-4 text-center hidden md:flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-forest-500" />
          Royal Kitchen Open Daily: 12:00 PM – 11:30 PM • Authentic Slow-Cooked Awadhi Recipes
        </span>
        <span className="flex items-center gap-3">
          <span>Complimentary Delivery on Orders Above ₹999</span>
          <span className="text-cream-400">•</span>
          <Link to="/track" className="underline hover:text-white transition-colors">
            Track Order
          </Link>
          {isAdmin && (
            <>
              <span className="text-cream-400">•</span>
              <Link to="/admin" className="text-forest-100 bg-forest-800 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase">
                Admin Portal
              </Link>
            </>
          )}
        </span>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link to="/" className="flex flex-col group">
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-charcoal-800 group-hover:text-forest-700 transition-colors uppercase">
            Dastaan
          </span>
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-charcoal-500 -mt-1">
            Heritage Kitchen & Bar
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-charcoal-700 hover:text-forest-700 transition-colors"
          >
            Menu
          </Link>
          <a
            href="#story"
            className="text-sm font-medium text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            Culinary Craft
          </a>
          <Link
            to="/track"
            className="text-sm font-medium text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            Live Tracking
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              className="text-sm font-medium text-charcoal-500 hover:text-charcoal-800 transition-colors"
            >
              Order History
            </Link>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* User Account / Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-charcoal-800 bg-cream-100 hover:bg-cream-200 border border-cream-300 rounded-md transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-forest-700" />
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white border border-cream-300 rounded-md shadow-elevated py-1.5 z-50 text-xs"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-cream-200">
                    <p className="font-semibold text-charcoal-800 truncate">{user?.name}</p>
                    <p className="text-charcoal-500 text-[11px] truncate">{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-forest-700 hover:bg-cream-100 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 px-3 py-2 text-charcoal-700 hover:bg-cream-100"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    My Past Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-brick-700 hover:bg-cream-100 text-left border-t border-cream-200 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="text-xs font-medium text-charcoal-700 hover:text-charcoal-900 px-3 py-1.5 rounded-md hover:bg-cream-200 transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-md text-xs font-medium tracking-tight transition-all active:scale-[0.98]"
            aria-label="View Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brick-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline border-l border-forest-600 pl-2">
              {formatCurrency(subtotal)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
