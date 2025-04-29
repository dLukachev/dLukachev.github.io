import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FaTrash } from 'react-icons/fa';

function ProfilePage() {
  const { user, loading: authLoading, authError } = useContext(AuthContext);
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    bonus_points: 0,
    photo_url: '',
  });
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [newRestaurant, setNewRestaurant] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isDeletingMenuItem, setIsDeletingMenuItem] = useState({});
  const [authRetry, setAuthRetry] = useState(false); // Новое состояние для отслеживания попыток авторизации

  useEffect(() => {
    console.log('User from AuthContext:', user);
    if (!user) {
      // Если user отсутствует, попробуем подождать 3 секунды перед повторной попыткой
      const timer = setTimeout(() => {
        setAuthRetry(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    const fetchData = async () => {
      try {
        console.log('Fetching users...');
        const usersData = await api.getUsers();
        console.log('Users data:', usersData);
        setUsers(usersData || []);

        console.log('Fetching restaurants with params:', { user_id: user.id, first_name: user.firstName });
        const restaurantsData = await api.getRestaurants({
          user_id: user.id,
          first_name: user.firstName,
        });
        console.log('Restaurants data:', restaurantsData);
        setRestaurants(restaurantsData || []);

        const menuData = {};
        for (const restaurant of restaurantsData) {
          console.log(`Fetching menu for restaurant ${restaurant.id}...`);
          try {
            const menuResponse = await api.getMenu(restaurant.id);
            console.log(`Menu for restaurant ${restaurant.id}:`, menuResponse);
            menuData[restaurant.id] = menuResponse.menu || [];
          } catch (error) {
            console.error(`Ошибка загрузки меню для ресторана ${restaurant.id}:`, error);
            menuData[restaurant.id] = [];
          }
        }
        console.log('Menu data:', menuData);
        setMenuItems(menuData);

        setLoading(false);
      } catch (error) {
        console.error('Fetch data error:', error);
        setError('Не удалось загрузить данные: ' + error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authRetry]);

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async () => {
    setIsAdding(true);
    try {
      const userData = {
        ...newUser,
        id: parseInt(newUser.id),
        bonus_points: parseFloat(newUser.bonus_points) || 0,
      };
      console.log('Creating user with data:', userData);
      const response = await api.createUser(userData);
      console.log('Create user response:', response);
      setUsers((prev) => [...prev, response]);
      setNewUser({ id: '', name: '', email: '', bonus_points: 0, photo_url: '' });
      alert('Пользователь создан');
    } catch (error) {
      console.error('Create user error:', error);
      alert('Не удалось создать пользователя: ' + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsDeleting((prev) => ({ ...prev, [userId]: true }));
    try {
      console.log('Deleting user:', userId);
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      alert('Пользователь удалён');
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Не удалось удалить пользователя: ' + error.message);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleAddRestaurant = async () => {
    setIsAdding(true);
    try {
      console.log('Adding restaurant with address:', newRestaurant);
      const response = await api.addRestaurant({ address: newRestaurant });
      console.log('Add restaurant response:', response);
      setRestaurants((prev) => [...prev, response]);
      setMenuItems((prev) => ({ ...prev, [response.id]: [] }));
      setNewRestaurant('');
      alert('Ресторан добавлен');
    } catch (error) {
      console.error('Add restaurant error:', error);
      alert('Не удалось добавить ресторан: ' + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    setIsDeleting((prev) => ({ ...prev, [restaurantId]: true }));
    try {
      console.log('Deleting restaurant:', restaurantId);
      await api.deleteRestaurant(restaurantId);
      setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId));
      setMenuItems((prev) => {
        const newMenuItems = { ...prev };
        delete newMenuItems[restaurantId];
        return newMenuItems;
      });
      alert('Ресторан удалён');
    } catch (error) {
      console.error('Delete restaurant error:', error);
      alert('Не удалось удалить ресторан: ' + error.message);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [restaurantId]: false }));
    }
  };

  const handleDeleteMenuItem = async (restaurantId, menuItemId) => {
    setIsDeletingMenuItem((prev) => ({ ...prev, [menuItemId]: true }));
    try {
      console.log('Deleting menu item:', { restaurantId, menuItemId });
      await api.deleteMenuItem(restaurantId, menuItemId);
      setMenuItems((prev) => ({
        ...prev,
        [restaurantId]: prev[restaurantId].filter((item) => item.id !== menuItemId),
      }));
      alert('Элемент меню удалён');
    } catch (error) {
      console.error('Delete menu item error:', error);
      alert('Не удалось удалить элемент меню: ' + error.message);
    } finally {
      setIsDeletingMenuItem((prev) => ({ ...prev, [menuItemId]: false }));
    }
  };

  console.log('Rendering ProfilePage with state:', { authLoading, authError, user, loading, error, users, restaurants, menuItems });

  if (authLoading) {
    return <p className="text-center" style={{ color: '#ffffff' }}>Авторизация...</p>;
  }

  if (authError) {
    return <p className="text-center" style={{ color: '#ff0000' }}>Ошибка авторизации: {authError}</p>;
  }

  if (!user || !user.id) {
    return (
      <div className="text-center" style={{ color: '#ffffff' }}>
        <p>Пожалуйста, откройте приложение через Telegram для авторизации.</p>
        {authRetry && <p>Попытка повторной авторизации...</p>}
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#000000' }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Профиль</h2>

      <div className="mb-6 p-3 rounded-lg shadow-md" style={{ backgroundColor: '#1a1a1a' }}>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#ffffff' }}>
          Информация о пользователе
        </h3>
        <div className="space-y-1">
          <p style={{ color: '#ffffff' }}>
            <span className="font-bold">Имя:</span> {user.firstName || 'Не указано'}
          </p>
          <p style={{ color: '#ffffff' }}>
            <span className="font-bold">Email:</span> {user.email || 'Не указано'}
          </p>
          <p style={{ color: '#ffffff' }}>
            <span className="font-bold">Бонусные баллы:</span> {user.bonus_points || 0}
          </p>
          <p style={{ color: '#ffffff' }}>
            <span className="font-bold">Роль:</span> {user.role || 'Пользователь'}
          </p>
          {user.photo_url && (
            <img
              src={user.photo_url}
              alt="Фото пользователя"
              className="w-16 h-16 object-cover rounded-full mt-2"
              onError={(e) => (e.target.src = 'https://placehold.co/50x50')}
            />
          )}
        </div>
      </div>

      <div className="mb-6 p-3 rounded-lg shadow-md" style={{ backgroundColor: '#1a1a1a' }}>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#ffffff' }}>
          Создать нового пользователя
        </h3>
        <div className="space-y-2">
          <input
            type="text"
            name="id"
            placeholder="ID пользователя"
            value={newUser.id}
            onChange={handleUserInputChange}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#aaaaaa', backgroundColor: '#2a2a2a', color: '#ffffff' }}
          />
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={newUser.name}
            onChange={handleUserInputChange}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#aaaaaa', backgroundColor: '#2a2a2a', color: '#ffffff' }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={handleUserInputChange}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#aaaaaa', backgroundColor: '#2a2a2a', color: '#ffffff' }}
          />
          <input
            type="number"
            name="bonus_points"
            placeholder="Бонусные баллы"
            value={newUser.bonus_points}
            onChange={handleUserInputChange}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#aaaaaa', backgroundColor: '#2a2a2a', color: '#ffffff' }}
          />
          <input
            type="text"
            name="photo_url"
            placeholder="URL фото (опционально)"
            value={newUser.photo_url}
            onChange={handleUserInputChange}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#aaaaaa', backgroundColor: '#2a2a2a', color: '#ffffff' }}
          />
          <button
            onClick={handleCreateUser}
            disabled={isAdding}
            className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
            style={{ backgroundColor: isAdding ? '#aaaaaa' : '#007bff', color: '#ffffff' }}
          >
            Создать пользователя
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2" style={{ color: '#ffffff' }}>
          Список пользователей
        </h3>
        {loading ? (
          <p className="text-center" style={{ color: '#ffffff' }}>
            Загрузка пользователей...
          </p>
        ) : error ? (
          <p className="text-center" style={{ color: '#ff0000' }}>
            {error}
          </p>
        ) : users.length === 0 ? (
          <p className="text-center" style={{ color: '#aaaaaa' }}>
            Пользователей нет
          </p>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-lg shadow-md flex justify-between items-center"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <div className="space-y-1">
                  <p className="font-bold" style={{ color: '#ffffff' }}>
                    ID: {u.id}
                  </p>
                  <p className="text-sm" style={{ color: '#aaaaaa' }}>
                    Имя: {u.name}
                  </p>
                  <p className="text-sm" style={{ color: '#aaaaaa' }}>
                    Email: {u.email}
                  </p>
                  <p className="text-sm" style={{ color: '#aaaaaa' }}>
                    Бонусные баллы: {u.bonus_points}
                  </p>
                  {u.photo_url && (
                    <img
                      src={u.photo_url}
                      alt={u.name}
                      className="w-12 h-12 object-cover rounded-md"
                      onError={(e) => (e.target.src = 'https://placehold.co/50x50')}
                    />
                  )}
                </div>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  disabled={isDeleting[u.id]}
                  className="p-2 rounded-md disabled:opacity-50"
                  style={{
                    backgroundColor: isDeleting[u.id] ? '#aaaaaa' : '#dc3545',
                    color: '#ffffff',
                  }}
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2" style={{ color: '#ffffff' }}>
          Управление ресторанами
        </h3>
        <div className="mb-4 p-3 rounded-lg shadow-md" style={{ backgroundColor: '#1a1a1a' }}>
          <h4 className="text-md font-bold mb-2" style={{ color: '#ffffff' }}>
            Добавить новый ресторан
          </h4>
          <input
            type="text"
            placeholder="Адрес ресторана"
            value={newRestaurant}
            onChange={(e) => setNewRestaurant(e.target.value)}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            style={{ borderColor: '#aaaaaa', backgroundColor: '#2a2a2a', color: '#ffffff' }}
          />
          <button
            onClick={handleAddRestaurant}
            disabled={isAdding || !newRestaurant}
            className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
            style={{
              backgroundColor: isAdding ? '#aaaaaa' : '#007bff',
              color: '#ffffff',
            }}
          >
            {isAdding ? 'Добавление...' : 'Добавить ресторан'}
          </button>
        </div>
        <h4 className="text-md font-bold mb-2" style={{ color: '#ffffff' }}>
          Список ресторанов
        </h4>
        {loading ? (
          <p className="text-center" style={{ color: '#ffffff' }}>
            Загрузка ресторанов...
          </p>
        ) : error ? (
          <p className="text-center" style={{ color: '#ff0000' }}>
            {error}
          </p>
        ) : restaurants.length === 0 ? (
          <p className="text-center" style={{ color: '#aaaaaa' }}>
            Ресторанов нет
          </p>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="p-3 rounded-lg shadow-md"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold" style={{ color: '#ffffff' }}>
                    ID: {restaurant.id}, Адрес: {restaurant.address}
                  </span>
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                    disabled={isDeleting[restaurant.id]}
                    className="p-2 rounded-md disabled:opacity-50"
                    style={{
                      backgroundColor: isDeleting[restaurant.id] ? '#aaaaaa' : '#dc3545',
                      color: '#ffffff',
                    }}
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
                <div className="mt-2">
                  <h5 className="text-sm font-medium" style={{ color: '#ffffff' }}>
                    Меню ресторана
                  </h5>
                  {menuItems[restaurant.id]?.length === 0 ? (
                    <p className="text-sm" style={{ color: '#aaaaaa' }}>
                      Меню пусто
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {menuItems[restaurant.id]?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-2 rounded-md"
                          style={{ backgroundColor: '#2a2a2a' }}
                        >
                          <span className="text-sm" style={{ color: '#aaaaaa' }}>
                            ID: {item.id}, {item.name}, Цена: {item.price}
                          </span>
                          <button
                            onClick={() => handleDeleteMenuItem(restaurant.id, item.id)}
                            disabled={isDeletingMenuItem[item.id]}
                            className="p-2 rounded-md disabled:opacity-50"
                            style={{
                              backgroundColor: isDeletingMenuItem[item.id] ? '#aaaaaa' : '#dc3545',
                              color: '#ffffff',
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
    </div>
  );
}

export default ProfilePage;