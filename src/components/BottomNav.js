import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaListAlt, FaUser } from 'react-icons/fa';

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: '/', icon: <FaHome size={24} />, label: 'Рестораны' },
    { to: '/cart', icon: <FaShoppingCart size={24} />, label: 'Корзина' },
    { to: '/orders', icon: <FaListAlt size={24} />, label: 'Заказы' },
    { to: '/profile', icon: <FaUser size={24} />, label: 'Профиль' },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`nav-item ${path === item.to ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default BottomNav;