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
            await api.deleteMenuItem(restaurantId, menuItemId); // Физическое удаление
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
                                marginBottom: '10px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px',
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
                                    {isDeleting[restaurant.data.restaurants_id] ? 'Удаление...' : 'Удалить ресторан'}
                                </button>
                            </div>

                            <div style={{ marginLeft: '20px' }}>
                                <h4>Меню ресторана</h4>
                                {menuItems[restaurant.data.restaurants_id]?.length === 0 ? (
                                    <p>Меню пусто</p>
                                ) : (
                                    <div>
                                        {menuItems[restaurant.data.restaurants_id]?.map((item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: '5px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '3px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '5px',
                                                }}
                                            >
                                                <span>ID: {item.id}, Название: {item.name}, Цена: {item.price}</span>
                                                <button
                                                    onClick={() => handleDeleteMenuItem(restaurant.data.restaurants_id, item.id)}
                                                    disabled={isDeletingMenuItem[item.id]}
                                                    style={{
                                                        padding: '3px 6px',
                                                        backgroundColor: isDeletingMenuItem[item.id] ? '#ccc' : '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: isDeletingMenuItem[item.id] ? 'not-allowed' : 'pointer',
                                                    }}
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