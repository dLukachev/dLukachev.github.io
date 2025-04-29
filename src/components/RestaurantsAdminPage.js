import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function RestaurantsAdminPage() {
    const { user, loading: authLoading, authError } = useContext(AuthContext);
    const [restaurants, setRestaurants] = useState([]);
    const [menuItems, setMenuItems] = useState({});
    const [newRestaurant, setNewRestaurant] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState({});
    const [isDeletingMenuItem, setIsDeletingMenuItem] = useState({});

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

                const menuData = {};
                for (const restaurant of data) {
                    try {
                        const menu = await api.getMenu(restaurant.data.restaurants_id);
                        menuData[restaurant.data.restaurants_id] = menu || [];
                    } catch (error) {
                        console.error(`Ошибка загрузки меню для ресторана ${restaurant.data.restaurants_id}:`, error);
                        menuData[restaurant.data.restaurants_id] = [];
                    }
                }
                setMenuItems(menuData);

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
            setMenuItems((prev) => ({ ...prev, [response.restaurant.id]: [] }));
            setNewRestaurant('');
            alert('Ресторан добавлен');
        } catch ( Taleerror) {
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
            setMenuItems((prev) => {
                const newMenuItems = { ...prev };
                delete newMenuItems[restaurantId];
                return newMenuItems;
            });
            alert('Ресторан удалён');
        } catch (error) {
            alert('Не удалось удалить ресторан: ' + error.message);
        } finally {
            setIsDeleting((prev) => ({ ...prev, [restaurantId]: false }));
        }
    };

    const handleDeleteMenuItem = async (restaurantId, menuItemId) => {
        setIsDeletingMenuItem((prev) => ({ ...prev, [menuItemId]: true }));
        try {
            await api.deleteMenuItem(restaurantId, menuItemId);
            setMenuItems((prev) => ({
                ...prev,
                [restaurantId]: prev[restaurantId].filter((item) => item.id !== menuItemId),
            }));
            alert('Элемент меню удалён');
        } catch (error) {
            alert('Не удалось удалить элемент меню: ' + error.message);
        } finally {
            setIsDeletingMenuItem((prev) => ({ ...prev, [menuItemId]: false }));
        }
    };

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
            <Link to="/">
                <button className="mb-4 px-4 py-2 bg-gray-200 text-black rounded-lg shadow-md hover:bg-gray-300 transition">
                    Назад
                </button>
            </Link>
            <h2 className="text-xl font-bold text-black mb-4">Управление ресторанами</h2>
            <div className="p-3 bg-white rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-bold text-black mb-2">Добавить новый ресторан</h3>
                <input
                    type="text"
                    placeholder="Адрес ресторана"
                    value={newRestaurant}
                    onChange={(e) => setNewRestaurant(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
                <button
                    onClick={handleAddRestaurant}
                    disabled={isAdding || !newRestaurant}
                    className={`w-full px-4 py-3 rounded-lg text-white shadow-md ${
                        isAdding ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                    } transition`}
                >
                    {isAdding ? 'Добавление...' : 'Добавить ресторан'}
                </button>
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Список ресторанов</h3>
            {restaurants.length === 0 ? (
                <p className="text-gray-600 text-center">Ресторанов нет</p>
            ) : (
                <div className="space-y-4">
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant.data.restaurants_id}
                            className="p-3 bg-white rounded-lg shadow-md"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-black font-medium">
                                    ID: {restaurant.data.restaurants_id}, Адрес: {restaurant.data.restaurants_address}
                                </span>
                                <button
                                    onClick={() => handleDeleteRestaurant(restaurant.data.restaurants_id)}
                                    disabled={isDeleting[restaurant.data.restaurants_id]}
                                    className={`px-3 py-1 rounded-md text-white shadow-md ${
                                        isDeleting[restaurant.data.restaurants_id]
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-pink-500 hover:bg-pink-600'
                                    } transition`}
                                >
                                    {isDeleting[restaurant.data.restaurants_id] ? 'Удаление...' : 'Удалить'}
                                </button>
                            </div>
                            <div className="mt-2">
                                <h4 className="text-sm text-gray-600 font-medium">Меню ресторана</h4>
                                {menuItems[restaurant.data.restaurants_id]?.length === 0 ? (
                                    <p className="text-sm text-gray-600">Меню пусто</p>
                                ) : (
                                    <div className="space-y-2 mt-2">
                                        {menuItems[restaurant.data.restaurants_id]?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                                            >
                                                <span className="text-sm text-gray-600">
                                                    ID: {item.id}, {item.name}, Цена: {item.price}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteMenuItem(restaurant.data.restaurants_id, item.id)}
                                                    disabled={isDeletingMenuItem[item.id]}
                                                    className={`px-2 py-1 rounded-md text-white shadow-md ${
                                                        isDeletingMenuItem[item.id]
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-pink-500 hover:bg-pink-600'
                                                    } transition`}
                                                >
                                                    {isDeletingMenuItem[item.id] ? 'Удаление...' : 'Удалить'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantsAdminPage;