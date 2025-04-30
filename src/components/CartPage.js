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

      if (!cartItems[0]?.restaurant_id) {
        alert('Ошибка: ID ресторана не найден в корзине.');
        return;
      }

      const orderData = {
        restaurant_id: cartItems[0].restaurant_id, // Используем restaurant_id из корзины
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
    return <p className="text-center">Авторизация...</p>;
  }

  if (!user) {
    return (
      <p className="text-center">
        Пожалуйста, откройте приложение через Telegram для авторизации.
      </p>
    );
  }

  if (loading) {
    return <p className="text-center">Загрузка корзины...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="dark p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">Корзина</h2>
      {cartItems.length === 0 ? (
        <p className="text-center text-hint">Корзина пуста</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.menu_item_id} className="p-3 bg-gray-700 rounded-lg shadow-md flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-hint">Цена: {item.price} руб.</p>
                <p className="text-sm text-hint">Количество: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item.menu_item_id)}
                disabled={isRemoving[item.menu_item_id]}
                className="p-2 rounded-md disabled:opacity-50 bg-destructive"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))}
          <div className="mt-4">
            <label htmlFor="orderType" className="block text-sm mb-2">Тип заказа:</label>
            <select
              id="orderType"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="p-2 rounded-md w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
            >
              <option value="DINE_IN">Обед в ресторане</option>
              <option value="DELIVERY">Доставка</option>
              <option value="PICKUP">Самовывоз</option>
            </select>
          </div>
          <button
            onClick={handleCreateOrder}
            className="w-full px-4 py-3 rounded-lg shadow-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Создать заказ
          </button>
        </div>
      )}
    </div>
  );
}

export default CartPage;