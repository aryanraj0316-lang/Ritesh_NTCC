import React, { useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomerHeader } from './components/customer/CustomerHeader';
import { CustomerFooter } from './components/customer/CustomerFooter';
import { CartDrawer } from './components/customer/CartDrawer';
import { AuthModal } from './components/customer/AuthModal';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderTrackPage } from './pages/customer/OrderTrackPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Customer Layout Wrapper
const CustomerLayout: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on page change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-800 font-sans antialiased">
      <CustomerHeader onOpenAuthModal={() => setIsAuthModalOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <CustomerFooter />
      <CartDrawer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Customer Storefront Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/track" element={<OrderTrackPage />} />
            <Route path="/track/:orderNumber" element={<OrderTrackPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Restaurant Administration Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="menu" element={<AdminMenuPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
