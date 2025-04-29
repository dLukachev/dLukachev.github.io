import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

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
        return <p>Авторизация...</p>;
    }

    if (!user) {
        return <p>Пожалуйста, откройте приложение через Telegram для авторизации.</p>;
    }

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
                                    <p style={{ margin: '5px 0' }}>Тип заказа: {order.order_type}</p>
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
                                        <option value="PENDING">Ожидает</option>
                                        <option value="CONFIRMED">Подтверждён</option>
                                        <option value="COMPLETED">Завершён</option>
                                        <option value="CANCELLED">Отменён</option>
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

                            <div style={{ marginTop: '10px' }}>
                                <p style={{ margin: '5px 0' }}>Товары:</p>
                                {(order.order_items && order.order_items.length > 0) ? (
                                    <ul>
                                        {order.order_items.map((item) => (
                                            <li
                                                key={item.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '5px 0',
                                                }}
                                            >
                                                <span>
                                                    Название: {item.menu_item_name}, Количество: {item.quantity}, Цена: {item.price} руб.
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
                                ) : (
                                    <p>Элементы отсутствуют</p>
                                )}
                            </div>

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