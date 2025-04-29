import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Импортируем AuthProvider
import RestaurantList from './components/RestaurantList';
import MenuPage from './components/MenuPage';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import UsersPage from './components/UsersPage';
import ReservationsPage from './components/ReservationsPage';
import RestaurantsAdminPage from './components/RestaurantsAdminPage';

function App() {
  return (
    <AuthProvider> {/* Оборачиваем всё приложение в AuthProvider */}
      <Router>
        <div style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
            }}
          >
            <h1 style={{ margin: 0 }}>Ресторанное приложение</h1>
            <div>
              <Link to="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
                Главная
              </Link>
              <Link to="/cart" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
                Корзина
              </Link>
              <Link to="/orders" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
                Заказы
              </Link>
              <Link to="/users" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
                Пользователи
              </Link>
              <Link to="/admin/restaurants" style={{ textDecoration: 'none', color: '#007bff' }}>
                Управление ресторанами
              </Link>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<RestaurantList />} />
            <Route path="/restaurants/:restaurantId/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/restaurants/:restaurantId/reservations" element={<ReservationsPage />} />
            <Route path="/admin/restaurants" element={<RestaurantsAdminPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;