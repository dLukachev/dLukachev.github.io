import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState({});
  const userId = '1102241880';

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.getCart(userId);
        setCartItems(response || []);
        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить корзину: ' + error.message);
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemoveFromCart = async (menuItemId) => {
    setIsRemoving((prev) => ({ ...prev, [menuItemId]: true }));
    try {
      console.log(`Удаляем элемент ${menuItemId} из корзины пользователя ${userId}`);
      await api.removeFromCart(userId, menuItemId);
      setCartItems((prev) => prev.filter((item) => item.menu_item_id !== menuItemId));
      alert('Элемент удалён из корзины');
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      alert('Не удалось удалить элемент: ' + error.message);
    } finally {
      setIsRemoving((prev) => ({ ...prev, [menuItemId]: false }));
    }
  };

  const handleClearCart = async () => {
    try {
      await api.clearCart(userId);
      setCartItems([]);
      alert('Корзина очищена');
    } catch (error) {
      alert('Не удалось очистить корзину: ' + error.message);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        restaurant_id: cartItems[0]?.restaurant_id || 1,
      };
      const response = await api.createOrder(userId, orderData);
      setCartItems([]);
      alert('Заказ создан: ' + response.message);
    } catch (error) {
      alert('Не удалось создать заказ: ' + error.message);
    }
  };

  if (loading) {
    return <p>Загрузка корзины...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">
          <button
            style={{
              padding: '5px 10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Назад
          </button>
        </Link>
      </div>
      <h2>Корзина</h2>
      {cartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.menu_item_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            >
              <div>
                <p style={{ margin: '5px 0' }}>Название: {item.name_item}</p>
                <p style={{ margin: '5px 0' }}>Цена: {item.item_price} руб.</p>
                <p style={{ margin: '5px 0' }}>Количество: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item.menu_item_id)}
                disabled={isRemoving[item.menu_item_id]}
                style={{
                  padding: '5px 10px',
                  backgroundColor: isRemoving[item.menu_item_id] ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isRemoving[item.menu_item_id] ? 'not-allowed' : 'pointer',
                }}
              >
                {isRemoving[item.menu_item_id] ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          ))}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleClearCart}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Очистить корзину
            </button>
            <button
              onClick={handleCreateOrder}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Создать заказ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;