import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

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
        return <p className="text-center text-gray-600">Загрузка корзины...</p>;
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
            <h2 className="text-xl font-bold text-black mb-4">Корзина</h2>
            {cartItems.length === 0 ? (
                <p className="text-gray-600 text-center">Корзина пуста</p>
            ) : (
                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div
                            key={item.menu_item_id}
                            className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
                        >
                            <div className="space-y-1">
                                <p className="text-black font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">Цена: {item.price} руб.</p>
                                <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveFromCart(item.menu_item_id)}
                                disabled={isRemoving[item.menu_item_id]}
                                className={`px-3 py-1 rounded-md text-white shadow-md ${
                                    isRemoving[item.menu_item_id]
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-pink-500 hover:bg-pink-600'
                                } transition`}
                            >
                                {isRemoving[item.menu_item_id] ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    ))}
                    <div className="mt-4">
                        <label htmlFor="orderType" className="text-sm text-gray-600 mr-2">
                            Тип заказа:
                        </label>
                        <select
                            id="orderType"
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        >
                            <option value="DINE_IN">Обед в ресторане</option>
                            <option value="DELIVERY">Доставка</option>
                            <option value="PICKUP">Самовывоз</option>
                        </select>
                    </div>
                    <button
                        onClick={handleCreateOrder}
                        className="w-full mt-4 px-4 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        Создать заказ
                    </button>
                </div>
            )}
        </div>
    );
}

export default CartPage;