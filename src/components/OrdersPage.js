import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import api from '../services/api.js';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

function OrdersPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [newItem, setNewItem] = useState({ orderId: null, menu_item_id: '', quantity: '' });
  const [isAddingItem, setIsAddingItem] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const response = await api.getOrders(user.id);
        setOrders(response.orders || []);
        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить заказы: ' + error.message);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await api.updateOrderStatus(user.id, orderId, { status: newStatus });
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
      await api.deleteOrder(user.id, orderId);
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
      const response = await api.addOrderItem(user.id, orderId, itemData);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, order_items: [...(order.order_items || []), response.order_item] }
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
      await api.removeOrderItem(user.id, orderId, menuItemId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_items: (order.order_items || []).filter((item) => item.menu_item_id !== menuItemId),
              }
            : order
        )
      );
      alert('Элемент удалён из заказа');
    } catch (error) {
      alert('Не удалось удалить элемент: ' + error.message);
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
    return <p className="text-center">Загрузка заказов...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Мои заказы</h2>
      {orders.length === 0 ? (
        <p className="text-center text-hint">У вас нет заказов</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-3 bg-white rounded-lg shadow-md">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Заказ #{order.id}</h3>
                <p className="text-sm text-hint">Тип заказа: {order.order_type}</p>
                <p className="text-sm text-hint">
                  Дата: {new Date(order.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-hint">Общая цена: {order.total_price} руб.</p>
                <p className="text-sm text-hint">Статус: {order.status}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={isUpdating[order.id]}
                  className="flex-1 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                >
                  <option value="PENDING">Ожидает</option>
                  <option value="CONFIRMED">Подтверждён</option>
                  <option value="COMPLETED">Завершён</option>
                  <option value="CANCELLED">Отменён</option>
                </select>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  disabled={isDeleting[order.id]}
                  className="p-2 rounded-md disabled:opacity-50 bg-destructive"
                >
                  <FaTrash size={16} />
                </button>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium">Товары:</p>
                {(order.order_items && order.order_items.length > 0) ? (
                  <ul className="space-y-2 mt-2">
                    {order.order_items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                      >
                        <span className="text-sm text-hint">
                          {item.menu_item_name}, Кол-во: {item.quantity}, Цена: {item.price} руб.
                        </span>
                        <button
                          onClick={() => handleRemoveItem(order.id, item.menu_item_id)}
                          className="p-2 rounded-md bg-destructive"
                        >
                          <FaTrash size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-hint">Элементы отсутствуют</p>
                )}
              </div>
              {user.role === 'admin' && (
                <div className="mt-4">
                  {newItem.orderId === order.id ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="ID пункта меню"
                        value={newItem.menu_item_id}
                        onChange={(e) =>
                          setNewItem((prev) => ({ ...prev, menu_item_id: e.target.value }))
                        }
                        className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                      />
                      <input
                        type="number"
                        placeholder="Количество"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
                        }
                        className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddItem(order.id)}
                          disabled={
                            isAddingItem[order.id] || !newItem.menu_item_id || !newItem.quantity
                          }
                          className="flex-1 px-4 py-2 rounded-lg shadow-md disabled:opacity-50 flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" /> {isAddingItem[order.id] ? 'Добавление...' : 'Добавить'}
                        </button>
                        <button
                          onClick={() => setNewItem({ orderId: null, menu_item_id: '', quantity: '' })}
                          className="flex-1 px-4 py-2 rounded-lg shadow-md flex items-center justify-center bg-destructive"
                        >
                          <FaTimes className="mr-2" /> Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewItem({ orderId: order.id, menu_item_id: '', quantity: '' })}
                      className="w-full px-4 py-2 rounded-lg shadow-md flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" /> Добавить элемент
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;