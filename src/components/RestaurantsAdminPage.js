import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FaTrash } from 'react-icons/fa';

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
    return <p className="text-center text-[var(--tg-theme-text-color)]">Авторизация...</p>;
  }

  if (authError) {
    return <p className="text-center text-red-500">Ошибка авторизации: {authError}</p>;
  }

  if (!user || !user.id) {
    return (
      <p className="text-center text-[var(--tg-theme-text-color)]">
        Пожалуйста, откройте приложение через Telegram для авторизации.
      </p>
    );
  }

  if (loading) {
    return <p className="text-center text-[var(--tg-theme-text-color)]">Загрузка ресторанов...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Ошибка загрузки ресторанов: {error}</p>;
  }

  if (user.role !== 'admin') {
    return <p className="text-center text-[var(--tg-theme-text-color)]">Доступ только для администраторов</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[var(--tg-theme-text-color)]">Управление ресторанами</h2>
      <div className="mb-4 p-3 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Добавить новый ресторан</h3>
        <input
          type="text"
          placeholder="Адрес ресторана"
          value={newRestaurant}
          onChange={(e) => setNewRestaurant(e.target.value)}
          className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)] mb-2"
          style={{ borderColor: 'var(--tg-theme-hint-color)' }}
        />
        <button
          onClick={handleAddRestaurant}
          disabled={isAdding || !newRestaurant}
          className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
          style={{
            backgroundColor: isAdding ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-button-color)',
            color: 'var(--tg-theme-button-text-color)',
          }}
        >
          {isAdding ? 'Добавление...' : 'Добавить ресторан'}
        </button>
      </div>
      <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Список ресторанов</h3>
      {restaurants.length === 0 ? (
        <p className="text-[var(--tg-theme-hint-color)] text-center">Ресторанов нет</p>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <div key={restaurant.data.restaurants_id} className="p-3 bg-white rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[var(--tg-theme-text-color)]">
                  ID: {restaurant.data.restaurants_id}, Адрес: {restaurant.data.restaurants_address}
                </span>
                <button
                  onClick={() => handleDeleteRestaurant(restaurant.data.restaurants_id)}
                  disabled={isDeleting[restaurant.data.restaurants_id]}
                  className="p-2 rounded-md disabled:opacity-50"
                  style={{
                    backgroundColor: isDeleting[restaurant.data.restaurants_id] ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-destructive-color, #dc3545)',
                    color: 'var(--tg-theme-button-text-color)',
                  }}
                >
                  <FaTrash size={16} />
                </button>
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-medium text-[var(--tg-theme-text-color)]">Меню ресторана</h4>
                {menuItems[restaurant.data.restaurants_id]?.length === 0 ? (
                  <p className="text-sm text-[var(--tg-theme-hint-color)]">Меню пусто</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {menuItems[restaurant.data.restaurants_id]?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                      >
                        <span className="text-sm text-[var(--tg-theme-hint-color)]">
                          ID: {item.id}, {item.name}, Цена: {item.price}
                        </span>
                        <button
                          onClick={() => handleDeleteMenuItem(restaurant.data.restaurants_id, item.id)}
                          disabled={isDeletingMenuItem[item.id]}
                          className="p-2 rounded-md disabled:opacity-50"
                          style={{
                            backgroundColor: isDeletingMenuItem[item.id] ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-destructive-color, #dc3545)',
                            color: 'var(--tg-theme-button-text-color)',
                          }}
                        >
                          <FaTrash size={16} />
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