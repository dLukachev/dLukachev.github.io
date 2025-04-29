import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import api from '../services/api.js';

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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[var(--tg-theme-text-color)]">Список ресторанов</h2>
      {restaurants.length === 0 ? (
        <p className="text-[var(--tg-theme-hint-color)] text-center">Ресторанов нет</p>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.data.restaurants_id}
              className="p-3 bg-white rounded-lg shadow-md text-center"
            >
              <h3 className="text-lg font-bold text-[var(--tg-theme-text-color)]">{restaurant.data.restaurants_address}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link to={`/restaurants/${restaurant.data.restaurants_id}/menu`}>
                  <button
                    className="w-full px-4 py-2 rounded-lg shadow-md"
                    style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
                  >
                    Меню
                  </button>
                </Link>
                <Link to={`/restaurants/${restaurant.data.restaurants_id}/reservations`}>
                  <button
                    className="w-full px-4 py-2 rounded-lg shadow-md"
                    style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
                  >
                    Бронирование
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {user.role === 'admin' && (
        <Link to="/restaurants-admin">
          <button
            className="w-full mt-4 px-4 py-2 rounded-lg shadow-md"
            style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            Управление ресторанами
          </button>
        </Link>
      )}
    </div>
  );
}

export default RestaurantList;