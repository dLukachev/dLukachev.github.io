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
            return;
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
        return <p className="text-center text-gray-600">Авторизация...</p>;
    }

    if (authError) {
        return <p className="text-center text-red-500">Ошибка авторизации: {authError}</p>;
    }

    if (!user || !user.id) {
        return (
            <p className="text-center text-gray-600">
                Пожалуйста, откройте приложение через Telegram для авторизации.
            </p>
        );
    }

    if (loading) {
        return <p className="text-center text-gray-600">Загрузка ресторанов...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Ошибка загрузки ресторанов: {error}</p>;
    }

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h2 className="text-xl font-bold text-black mb-4">Список ресторанов</h2>
            {restaurants.length === 0 ? (
                <p className="text-gray-600 text-center">Ресторанов нет</p>
            ) : (
                <div className="grid gap-4">
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant.data.restaurants_id}
                            className="p-3 bg-white rounded-lg shadow-md text-center"
                        >
                            <h3 className="text-lg font-bold text-black">{restaurant.data.restaurants_address}</h3>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Link to={`/restaurants/${restaurant.data.restaurants_id}/menu`}>
                                    <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
                                        Меню
                                    </button>
                                </Link>
                                <Link to={`/restaurants/${restaurant.data.restaurants_id}/reservations`}>
                                    <button className="w-full px-4 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
                                        Бронирование
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantList;