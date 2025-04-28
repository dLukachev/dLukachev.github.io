import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function RestaurantsAdminPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({ address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRestaurant = async () => {
    setIsAdding(true);
    try {
      const response = await api.addRestaurant(newRestaurant);
      setRestaurants((prev) => [...prev, { data: response.restaurant }]);
      setNewRestaurant({ address: '' });
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
      setRestaurants((prev) =>
        prev.filter((restaurant) => restaurant.data.restaurants_id !== restaurantId)
      );
      alert('Ресторан удалён');
    } catch (error) {
      alert('Не удалось удалить ресторан: ' + error.message);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [restaurantId]: false }));
    }
  };

  if (loading) {
    return <p>Загрузка ресторанов...</p>;
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
      <h2>Управление ресторанами</h2>

      {/* Форма для добавления ресторана */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Добавить новый ресторан</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            name="address"
            placeholder="Адрес ресторана"
            value={newRestaurant.address}
            onChange={handleInputChange}
            style={{ padding: '5px' }}
          />
          <button
            onClick={handleAddRestaurant}
            disabled={isAdding || !newRestaurant.address}
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
      </div>

      {/* Список ресторанов */}
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
                margin: '5px 0',
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