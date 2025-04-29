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
        return <p className="text-center text-gray-600">Авторизация...</p>;
    }

    if (!user) {
        return (
            <p className="text-center text-gray-600">
                Пожалуйста, откройте приложение через Telegram для авторизации.
            </p>
        );
    }

    if (loading) {
        return <p className="text-center text-gray-600">Загрузка заказов...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4 max-w-md">
            <Link to="/">
                <button className="mb-4 px-4 py-2 bg-gray-200 text-black rounded-lg shadow-md hover:bg-gray-300 transition">
                    Назад
                </button>
            </Link>
            <h2 className="text-xl font-bold text-black mb-4">Мои заказы</h2>
            {orders.length === 0 ? (
                <p className="text-gray-600 text-center">У вас нет заказов</p>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="p-3 bg-white rounded-lg shadow-md"
                        >
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-black">Заказ #{order.id}</h3>
                                <p className="text-sm text-gray-600">Тип заказа: {order.order_type}</p>
                                <p className="text-sm text-gray-600">
                                    Дата: {new Date(order.created_at).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">Общая цена: {order.total_price} руб.</p>
                                <p className="text-sm text-gray-600">Статус: {order.status}</p>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    disabled={isUpdating[order.id]}
                                    className={`flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isUpdating[order.id] ? 'cursor-not-allowed' : ''
                                    }`}
                                >
                                    <option value="PENDING">Ожидает</option>
                                    <option value="CONFIRMED">Подтверждён</option>
                                    <option value="COMPLETED">Завершён</option>
                                    <option value="CANCELLED">Отменён</option>
                                </select>
                                <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    disabled={isDeleting[order.id]}
                                    className={`px-3 py-1 rounded-md text-white shadow-md ${
                                        isDeleting[order.id] ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'
                                    } transition`}
                                >
                                    {isDeleting[order.id] ? 'Удаление...' : 'Удалить'}
                                </button>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 font-medium">Товары:</p>
                                {(order.order_items && order.order_items.length > 0) ? (
                                    <ul className="space-y-2 mt-2">
                                        {order.order_items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                                            >
                                                <span className="text-sm text-gray-600">
                                                    {item.menu_item_name}, Кол-во: {item.quantity}, Цена: {item.price} руб.
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveItem(order.id, item.menu_item_id)}
                                                    className="px-2 py-1 bg-pink-500 text-white rounded-md shadow-md hover:bg-pink-600 transition"
                                                >
                                                    Удалить
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-600">Элементы отсутствуют</p>
                                )}
                            </div>
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
                                            className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Количество"
                                            value={newItem.quantity}
                                            onChange={(e) =>
                                                setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
                                            }
                                            className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAddItem(order.id)}
                                                disabled={
                                                    isAddingItem[order.id] || !newItem.menu_item_id || !newItem.quantity
                                                }
                                                className={`flex-1 px-4 py-2 rounded-lg text-white shadow-md ${
                                                    isAddingItem[order.id] ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                                } transition`}
                                            >
                                                {isAddingItem[order.id] ? 'Добавление...' : 'Добавить'}
                                            </button>
                                            <button
                                                onClick={() => setNewItem({ orderId: null, menu_item_id: '', quantity: '' })}
                                                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setNewItem({ orderId: order.id, menu_item_id: '', quantity: '' })}
                                        className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                                    >
                                        Добавить элемент
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