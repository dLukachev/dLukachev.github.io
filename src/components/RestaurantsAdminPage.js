import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function RestaurantsAdminPage() {
    const { user, loading: authLoading, authError } = useContext(AuthContext); // Добавляем authError
    const [restaurants, setRestaurants] = useState([]);
    const [newRestaurant, setNewRestaurant] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState({});

    useEffect(() => {
        if (!user || !user.id) {
            setLoading(false);
            return; // Если user или user.id отсутствует, не делаем запрос
        }

        const fetchRestaurants = async () => {
            try {
                // Передаем user_id и first_name как параметры
                const data = await api.getRestaurants({
                    user_id: user.id,
                    first_name: user.firstName,
                });
                setRestaurants(data || []);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, [user]);

    const handleAddRestaurant = async () => {
        setIsAdding(true);
        try {
            const response = await api.addRestaurant({ address: newRestaurant });
            const formattedRestaurant = {
                data: {
                    restaurants_id: response.restaurant.id,
                    restaurants_address: response.restaurant.address,
                },
            };
            setRestaurants((prev) => [...prev, formattedRestaurant]);
            setNewRestaurant('');
            alert('Ресторан добавлен');
        } catch (error) {
            alert('Не удалось добавить ресторан: ' + error.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteRestaurant = async (restaurantId) => {
        setIsDeleting((prev) => ({ ...prev, [restaurantId]: true }));
        try {
            await api.deleteRestaurant(restaurantId);
            setRestaurants((prev) => prev.filter((restaurant) => restaurant.data.restaurants_id !== restaurantId));
            alert('Ресторан удалён');
        } catch (error) {
            alert('Не удалось удалить ресторан: ' + error.message);
        } finally {
            setIsDeleting((prev) => ({ ...prev, [restaurantId]: false }));
        }
    };

    if (authLoading) {
        return <p>Авторизация...</p>;
    }

    if (authError) {
        return <p>Ошибка авторизации: {authError}</p>;
    }

    if (!user || !user.id) {
        return <p>Пожалуйста, откройте приложение через Telegram для авторизации.</p>;
    }

    if (loading) {
        return <p>Загрузка ресторанов...</p>;
    }

    if (error) {
        return <p>Ошибка загрузки ресторанов: {error}</p>;
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
            <h2>Управление ресторанами</h2>

            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Добавить новый ресторан</h3>
                <input
                    type="text"
                    placeholder="Адрес ресторана"
                    value={newRestaurant}
                    onChange={(e) => setNewRestaurant(e.target.value)}
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                />
                <button
                    onClick={handleAddRestaurant}
                    disabled={isAdding || !newRestaurant}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: isAdding ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: isAdding ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isAdding ? 'Добавление...' : 'Добавить ресторан'}
                </button>
            </div>

            <h3>Список ресторанов</h3>
            {restaurants.length === 0 ? (
                <p>Ресторанов нет</p>
            ) : (
                <div>
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant.data.restaurants_id}
                            style={{
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <span>ID: {restaurant.data.restaurants_id}, Адрес: {restaurant.data.restaurants_address}</span>
                            <button
                                onClick={() => handleDeleteRestaurant(restaurant.data.restaurants_id)}
                                disabled={isDeleting[restaurant.data.restaurants_id]}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: isDeleting[restaurant.data.restaurants_id] ? '#ccc' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: isDeleting[restaurant.data.restaurants_id] ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isDeleting[restaurant.data.restaurants_id] ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantsAdminPage;