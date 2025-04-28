import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState({});
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const userId = '1102241880';

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await api.getCart(userId);
        console.log('Данные корзины:', data);

        // Проверяем, является ли data массивом
        if (Array.isArray(data)) {
          setCartItems(data);
        } else {
          // Если data — объект (например, { "cart": "Корзина пуста" }), устанавливаем пустой массив
          setCartItems([]);
        }
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
      await api.removeFromCart(userId, menuItemId);
      const updatedCart = await api.getCart(userId);
      console.log('Обновлённые данные корзины:', updatedCart);

      // Аналогичная проверка для обновлённых данных
      if (Array.isArray(updatedCart)) {
        setCartItems(updatedCart);
      } else {
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
    if (!cartItems || cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const restaurantId = cartItems[0].restaurant_id || 1;
      const orderData = {
        restaurant_id: restaurantId,
      };
      const response = await api.createOrder(userId, orderData);
      alert('Заказ создан: ' + response.message);
      setCartItems([]);
    } catch (error) {
      alert('Не удалось создать заказ: ' + error.message);
    } finally {
      setIsCreatingOrder(false);
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
      {(!cartItems || cartItems.length === 0) ? (
        <p>Корзина пуста</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
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
                <h3 style={{ margin: 0 }}>{item.name_item}</h3>
                <p style={{ margin: '5px 0' }}>Цена: {item.item_price} руб.</p>
                <p style={{ margin: '5px 0' }}>Количество: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                disabled={isRemoving[item.id]}
                style={{
                  padding: '5px 10px',
                  backgroundColor: isRemoving[item.id] ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isRemoving[item.id] ? 'not-allowed' : 'pointer',
                }}
              >
                {isRemoving[item.id] ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          ))}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleCreateOrder}
              disabled={isCreatingOrder}
              style={{
                padding: '10px 20px',
                backgroundColor: isCreatingOrder ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: isCreatingOrder ? 'not-allowed' : 'pointer',
              }}
            >
              {isCreatingOrder ? 'Создание заказа...' : 'Создать заказ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;