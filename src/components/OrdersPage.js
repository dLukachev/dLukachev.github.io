import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [newItem, setNewItem] = useState({ orderId: null, menu_item_id: '', quantity: '' });
  const [isAddingItem, setIsAddingItem] = useState({});

  const userId = '1102241880';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.getOrders(userId);
        setOrders(response.orders || []);
        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить заказы: ' + error.message);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await api.updateOrderStatus(userId, orderId, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert('Статус заказа обновлён');
    } catch (error) {
      alert('Не удалось обновить статус: ' + error.message);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setIsDeleting((prev) => ({ ...prev, [orderId]: true }));
    try {
      await api.deleteOrder(userId, orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      alert('Заказ удалён');
    } catch (error) {
      alert('Не удалось удалить заказ: ' + error.message);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAddItem = async (orderId) => {
    setIsAddingItem((prev) => ({ ...prev, [orderId]: true }));
    try {
      const itemData = {
        menu_item_id: parseInt(newItem.menu_item_id),
        quantity: parseInt(newItem.quantity),
      };
      const response = await api.addOrderItem(userId, orderId, itemData);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, items: [...order.items, response.order_item] }
            : order
        )
      );
      setNewItem({ orderId: null, menu_item_id: '', quantity: '' });
      alert('Элемент добавлен в заказ');
    } catch (error) {
      alert('Не удалось добавить элемент: ' + error.message);
    } finally {
      setIsAddingItem((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleRemoveItem = async (orderId, menuItemId) => {
    try {
      await api.removeOrderItem(userId, orderId, menuItemId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.filter((item) => item.menu_item_id !== menuItemId),
              }
            : order
        )
      );
      alert('Элемент удалён из заказа');
    } catch (error) {
      alert('Не удалось удалить элемент: ' + error.message);
    }
  };

  if (loading) {
    return <p>Загрузка заказов...</p>;
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
      <h2>Мои заказы</h2>
      {orders.length === 0 ? (
        <p>У вас нет заказов</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>Заказ #{order.id}</h3>
                  <p style={{ margin: '5px 0' }}>
                    Ресторан ID: {order.restaurant_id}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    Дата: {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    Общая цена: {order.total_price} руб.
                  </p>
                  <p style={{ margin: '5px 0' }}>Статус: {order.status}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={isUpdating[order.id]}
                    style={{
                      padding: '5px',
                      borderRadius: '3px',
                      cursor: isUpdating[order.id] ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <option value="pending">Ожидает</option>
                    <option value="completed">Завершён</option>
                    <option value="cancelled">Отменён</option>
                  </select>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    disabled={isDeleting[order.id]}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: isDeleting[order.id] ? '#ccc' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: isDeleting[order.id] ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isDeleting[order.id] ? 'Удаление...' : 'Удалить заказ'}
                  </button>
                </div>
              </div>

              {/* Список элементов заказа */}
              {order.items && order.items.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '5px 0' }}>Товары:</p>
                  <ul>
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>
                          Пункт меню ID: {item.menu_item_id}, Количество: {item.quantity}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(order.id, item.menu_item_id)}
                          style={{
                            padding: '2px 5px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                        >
                          Удалить
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Форма для добавления нового элемента */}
              <div style={{ marginTop: '10px' }}>
                <h4>Добавить элемент в заказ</h4>
                {newItem.orderId === order.id ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="ID пункта меню"
                      value={newItem.menu_item_id}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, menu_item_id: e.target.value }))
                      }
                      style={{ padding: '5px' }}
                    />
                    <input
                      type="number"
                      placeholder="Количество"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
                      }
                      style={{ padding: '5px' }}
                    />
                    <button
                      onClick={() => handleAddItem(order.id)}
                      disabled={
                        isAddingItem[order.id] || !newItem.menu_item_id || !newItem.quantity
                      }
                      style={{
                        padding: '5px 10px',
                        backgroundColor: isAddingItem[order.id] ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: isAddingItem[order.id] ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isAddingItem[order.id] ? 'Добавление...' : 'Добавить'}
                    </button>
                    <button
                      onClick={() => setNewItem({ orderId: null, menu_item_id: '', quantity: '' })}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewItem({ orderId: order.id, menu_item_id: '', quantity: '' })}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    Добавить новый элемент
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;