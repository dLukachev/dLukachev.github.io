import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await api.getRestaurants();
        setRestaurants(data || []);
        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить рестораны: ' + error.message);
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  if (loading) {
    return <p>Загрузка ресторанов...</p>;
  }

  if (error) {
    return <p>{error}</p>;
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