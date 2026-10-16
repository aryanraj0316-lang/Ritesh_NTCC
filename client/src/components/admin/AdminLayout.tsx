import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Clock, ShieldAlert, CheckCircle2, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { api } from '../../lib/api';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isKitchenAccepting, setIsKitchenAccepting] = useState(true);

  // System clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll pending count
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPending = async () => {
      try {
        const res = await api.reports.getKPIs();
        if (res.success && res.data) {
          setPendingOrdersCount(res.data.awaitingConfirmationCount || 0);
        }
      } catch (err) {
        // quiet
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-forest-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Redirect to admin login if not admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Sidebar */}
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} />

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-cream-300 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs text-charcoal-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-forest-700" />
              <span>
                {currentTime.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                •{' '}
                {currentTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </span>

            <span className="text-cream-300">•</span>

            <button
              onClick={() => setIsKitchenAccepting(!isKitchenAccepting)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                isKitchenAccepting
                  ? 'bg-sage-50 text-sage-900 border-sage-100 hover:bg-sage-100'
                  : 'bg-brick-50 text-brick-900 border-brick-100 hover:bg-brick-100'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isKitchenAccepting ? 'bg-sage-700 animate-pulse' : 'bg-brick-700'
                }`}
              />
              <span>{isKitchenAccepting ? 'Storefront: Accepting Orders' : 'Storefront: Paused'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {pendingOrdersCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amberGold-50 border border-amberGold-100 rounded-md text-amberGold-700 text-xs font-medium">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>{pendingOrdersCount} order(s) awaiting confirmation</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs font-medium text-charcoal-700 bg-cream-100 px-3 py-1.5 rounded-md border border-cream-300">
              <span className="w-2 h-2 rounded-full bg-forest-700" />
              <span>{user?.name} (Admin)</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet context={{ refreshPending: () => {} }} />
        </main>
      </div>
    </div>
  );
};
