import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav.js';
import RestaurantList from './components/RestaurantList';
import CartPage from './components/CartPage';
import MenuPage from './components/MenuPage';
import UsersPage from './components/UsersPage';
import OrdersPage from './components/OrdersPage';
import RestaurantsAdminPage from './components/RestaurantsAdminPage';
import ReservationsPage from './components/ReservationsPage';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const location = useLocation();

  React.useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const backButton = window.Telegram.WebApp.BackButton;
      if (['/', '/cart', '/orders', '/profile'].includes(location.pathname)) {
        backButton.hide();
      } else {
        backButton.show();
        backButton.onClick(() => {
          window.history.back();
        });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <Routes>
        <Route path="/" element={<RestaurantList />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/restaurants/:restaurantId/menu" element={<MenuPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/restaurants-admin" element={<RestaurantsAdminPage />} />
        <Route path="/restaurants/:restaurantId/reservations" element={<ReservationsPage />} />
        <Route path="/profile" element={<div className="p-4">Профиль (в разработке)</div>} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}