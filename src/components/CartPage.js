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
        if (!user) return; // Ждем авторизацию

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
        return <p>Авторизация...</p>;
    }

    if (!user) {
        return <p>Пожалуйста, откройте приложение через Telegram для авторизации.</p>;
    }

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
                                <p style={{ margin: '5px 0' }}>Название: {item.name}</p>
                                <p style={{ margin: '5px 0' }}>Цена: {item.price} руб.</p>
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
                    <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                        <label htmlFor="orderType">Тип заказа: </label>
                        <select
                            id="orderType"
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            style={{ padding: '5px', marginLeft: '10px', borderRadius: '3px' }}
                        >
                            <option value="DINE_IN">Обед в ресторане</option>
                            <option value="DELIVERY">Доставка</option>
                            <option value="PICKUP">Самовывоз</option>
                        </select>
                    </div>
                    <button
                        onClick={handleCreateOrder}
                        style={{
                            marginTop: '10px',
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
            )}
        </div>
    );
}

export default CartPage;