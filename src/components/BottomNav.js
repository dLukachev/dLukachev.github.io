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
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-secondary-bg-color)] shadow-md flex justify-around py-2">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center ${path === item.to ? 'text-[var(--tg-theme-link-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}
        >
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default BottomNav;