import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import api from '../services/api.js';
import { FaTrash } from 'react-icons/fa';

function CartPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState({});
  const [orderType, setOrderType] = useState('DINE_IN');

  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        const response = await api.getCart(user.id);
        if (Array.isArray(response)) {
          setCartItems(response);
        } else if (response.cart === 'Корзина пуста') {
          setCartItems([]);
        } else {
          setError(response.error || 'Неизвестная ошибка при загрузке корзины');
          setCartItems([]);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const handleRemoveFromCart = async (menuItemId) => {
    setIsRemoving((prev) => ({ ...prev, [menuItemId]: true }));
    try {
      await api.removeFromCart(user.id, menuItemId);
      const response = await api.getCart(user.id);
      if (Array.isArray(response)) {
        setCartItems(response);
      } else if (response.cart === 'Корзина пуста') {
        setCartItems([]);
      } else {
        setError(response.error || 'Неизвестная ошибка при загрузке корзины');
        setCartItems([]);
      }
      alert('Элемент удалён из корзины');
    } catch (error) {
      alert('Не удалось удалить элемент: ' + error.message);
    } finally {
      setIsRemoving((prev) => ({ ...prev, [menuItemId]: false }));
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (cartItems.length === 0) {
        alert('Корзина пуста. Добавьте элементы перед созданием заказа.');
        return;
      }

      const orderData = {
        restaurant_id: cartItems[0]?.restaurant_id || 1,
        order_type: orderType,
      };
      const response = await api.createOrder(user.id, orderData);
      setCartItems([]);
      alert('Заказ создан: ' + response.message);
    } catch (error) {
      alert('Не удалось создать заказ: ' + error.message);
    }
  };

  if (authLoading) {
    return <p className="text-center text-[var(--tg-theme-text-color)]">Авторизация...</p>;
  }

  if (!user) {
    return (
      <p className="text-center text-[var(--tg-theme-text-color)]">
        Пожалуйста, откройте приложение через Telegram для авторизации.
      </p>
    );
  }

  if (loading) {
    return <p className="text-center text-[var(--tg-theme-text-color)]">Загрузка корзины...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div
     className="p-4"
     style={{ backgroundColor: 'var(--tg-theme-bg-color, #121212)', color: 'var(--tg-theme-text-color, #E0E0E0)' }}
    >
      <h2 className="text-xl font-bold mb-4 text-[var(--tg-theme-text-color)]">Корзина</h2>
      {cartItems.length === 0 ? (
        <p className="text-[var(--tg-theme-hint-color)] text-center">Корзина пуста</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.menu_item_id} className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-bold text-[var(--tg-theme-text-color)]">{item.name}</p>
                <p className="text-sm text-[var(--tg-theme-hint-color)]">Цена: {item.price} руб.</p>
                <p className="text-sm text-[var(--tg-theme-hint-color)]">Количество: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item.menu_item_id)}
                disabled={isRemoving[item.menu_item_id]}
                className="p-2 rounded-md disabled:opacity-50"
                style={{
                  backgroundColor: isRemoving[item.menu_item_id] ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-destructive-color, #dc3545)',
                  color: 'var(--tg-theme-button-text-color)',
                }}
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))}
          <div className="mt-4">
            <label htmlFor="orderType" className="block text-sm text-[var(--tg-theme-text-color)] mb-2">Тип заказа:</label>
            <select
              id="orderType"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
              style={{ borderColor: 'var(--tg-theme-hint-color)' }}
            >
              <option value="DINE_IN">Обед в ресторане</option>
              <option value="DELIVERY">Доставка</option>
              <option value="PICKUP">Самовывоз</option>
            </select>
          </div>
          <button
            onClick={handleCreateOrder}
            className="w-full px-4 py-3 rounded-lg shadow-md"
            style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            Создать заказ
          </button>
        </div>
      )}
    </div>
  );
}

export default CartPage;