import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  pendingOrdersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ pendingOrdersCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, exact: true },
    {
      label: 'Orders',
      to: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { label: 'Menu Items', to: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', to: '/admin/categories', icon: Tags },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Sales & Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-charcoal-900 text-cream-200 border-r border-charcoal-800 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand & System Status */}
      <div>
        <div className="p-5 border-b border-charcoal-800">
          <div className="flex items-center gap-2 text-forest-500 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest-400">
              Operations Center
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold tracking-wider text-cream-100 uppercase">
            Dastaan
          </h2>
          <p className="text-[11px] text-charcoal-400">Fine Dining Management v2.4</p>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-800 text-white font-semibold'
                    : 'text-charcoal-400 hover:text-cream-100 hover:bg-charcoal-800'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-brick-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Profile & Front Desk Link */}
      <div className="p-4 border-t border-charcoal-800 space-y-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded text-xs text-charcoal-400 hover:text-cream-100 hover:bg-charcoal-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront Portal</span>
          </span>
          <span className="text-[10px] bg-charcoal-800 px-1.5 py-0.5 rounded text-charcoal-400">
            Live
          </span>
        </Link>

        <div className="pt-2 border-t border-charcoal-800 flex items-center justify-between">
          <div className="text-xs truncate max-w-[140px]">
            <p className="font-semibold text-cream-100 truncate">{user?.name || 'Chef Admin'}</p>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">Manager</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of operations"
            className="p-1.5 rounded hover:bg-charcoal-800 text-charcoal-400 hover:text-brick-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
