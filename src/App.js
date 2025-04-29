import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import RestaurantList from './components/RestaurantList';
import CartPage from './components/CartPage';
import MenuPage from './components/MenuPage';
import UsersPage from './components/UsersPage';
import OrdersPage from './components/OrdersPage';
import RestaurantsAdminPage from './components/RestaurantsAdminPage';
import ReservationsPage from './components/ReservationsPage';
import ProfilePage from './components/ProfilePage';
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
    <div
      className="min-h-screen pb-16"
      style={{ backgroundColor: 'var(--tg-theme-bg-color, #121212)' }}
    >
      <Routes>
        <Route path="/" element={<RestaurantList />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/restaurants/:restaurantId/menu" element={<MenuPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/restaurants-admin" element={<RestaurantsAdminPage />} />
        <Route path="/restaurants/:restaurantId/reservations" element={<ReservationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center p-4" style={{ color: 'var(--tg-theme-text-color)', backgroundColor: 'var(--tg-theme-bg-color)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
      <p>Проверьте URL или вернитесь на главную страницу.</p>
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