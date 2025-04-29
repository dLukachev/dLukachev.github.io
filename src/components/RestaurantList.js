import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function RestaurantList() {
    const { user, loading: authLoading, authError } = useContext(AuthContext);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !user.id) {
            setLoading(false);
            return; // Если user или user.id отсутствует, не делаем запрос
        }

        const fetchRestaurants = async () => {
            try {
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
            <h2>Список ресторанов</h2>
            {restaurants.length === 0 ? (
                <p>Ресторанов нет</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant.data.restaurants_id}
                            style={{
                                width: '200px',
                                margin: '10px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                textAlign: 'center',
                            }}
                        >
                            <h3>{restaurant.data.restaurants_address}</h3>
                            <Link to={`/restaurants/${restaurant.data.restaurants_id}/menu`}>
                                <button
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        marginRight: '5px',
                                    }}
                                >
                                    Посмотреть меню
                                </button>
                            </Link>
                            <Link to={`/restaurants/${restaurant.data.restaurants_id}/reservations`}>
                                <button
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Забронировать стол
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantList;