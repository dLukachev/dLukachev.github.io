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
  const [tables, setTables] = useState({}); // Новое состояние для столов
  const [newRestaurant, setNewRestaurant] = useState('');
  const [newTable, setNewTable] = useState({}); // Состояние для создания столов
  const [newMenuItem, setNewMenuItem] = useState({}); // Состояние для создания пунктов меню
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState({}); // Состояние загрузки для столов
  const [isAddingMenuItem, setIsAddingMenuItem] = useState({}); // Состояние загрузки для меню
  const [isDeleting, setIsDeleting] = useState({});
  const [isDeletingMenuItem, setIsDeletingMenuItem] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const usersData = await api.getUsers();
        setUsers(usersData?.users || []);

        const restaurantsData = await api.getRestaurants({
          user_id: user.id,
          first_name: user.firstName,
        });
        const formattedRestaurants = restaurantsData.map(item => ({
          id: item.data.restaurants_id,
          address: item.data.restaurants_address,
        }));
        setRestaurants(formattedRestaurants);

        const menuData = {};
        const tablesData = {};
        for (const restaurant of formattedRestaurants) {
          try {
            const menuResponse = await api.getMenu(restaurant.id);
            menuData[restaurant.id] = menuResponse || [];
          } catch (error) {
            menuData[restaurant.id] = [];
          }
          try {
            const tablesResponse = await api.getAvailableTables(restaurant.id);
            tablesData[restaurant.id] = tablesResponse || [];
          } catch (error) {
            tablesData[restaurant.id] = [];
          }
        }
        setMenuItems(menuData);
        setTables(tablesData);

        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить данные: ' + error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
      const response = await api.createUser(userData);
      setUsers((prev) => [...prev, response.user]);
      setNewUser({ id: '', name: '', email: '', bonus_points: 0, photo_url: '' });
      alert('Пользователь создан');
    } catch (error) {
      alert('Не удалось создать пользователя: ' + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsDeleting((prev) => ({ ...prev, [userId]: true }));
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      alert('Пользователь удалён');
    } catch (error) {
      alert('Не удалось удалить пользователя: ' + error.message);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleAddRestaurant = async () => {
    setIsAdding(true);
    try {
      const response = await api.addRestaurant({ address: newRestaurant });
      setRestaurants((prev) => [...prev, response.restaurant]);
      setMenuItems((prev) => ({ ...prev, [response.restaurant.id]: [] }));
      setTables((prev) => ({ ...prev, [response.restaurant.id]: [] }));
      setNewRestaurant('');
      alert('Ресторан добавлен');
    } catch (error) {
      if (error.message.includes('already exists')) {
        alert('Ресторан с таким адресом уже существует. Попробуйте другой адрес.');
      } else {
        alert('Не удалось добавить ресторан: ' + error.message);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    setIsDeleting((prev) => ({ ...prev, [restaurantId]: true }));
    try {
      await api.deleteRestaurant(restaurantId);
      setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId));
      setMenuItems((prev) => {
        const newMenuItems = { ...prev };
        delete newMenuItems[restaurantId];
        return newMenuItems;
      });
      setTables((prev) => {
        const newTables = { ...prev };
        delete newTables[restaurantId];
        return newTables;
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

  // Обработчики для создания столов
  const handleTableInputChange = (restaurantId, e) => {
    const { name, value } = e.target;
    setNewTable((prev) => ({
      ...prev,
      [restaurantId]: {
        ...prev[restaurantId],
        [name]: value,
      },
    }));
  };

  const handleCreateTable = async (restaurantId) => {
    setIsAddingTable((prev) => ({ ...prev, [restaurantId]: true }));
    try {
      const tableData = {
        table_number: parseInt(newTable[restaurantId]?.table_number),
        capacity: parseInt(newTable[restaurantId]?.capacity),
      };
      const response = await api.addTable(restaurantId, tableData);
      setTables((prev) => ({
        ...prev,
        [restaurantId]: [...(prev[restaurantId] || []), response.table],
      }));
      setNewTable((prev) => ({
        ...prev,
        [restaurantId]: { table_number: '', capacity: '' },
      }));
      alert('Стол добавлен');
    } catch (error) {
      alert('Не удалось добавить стол: ' + error.message);
    } finally {
      setIsAddingTable((prev) => ({ ...prev, [restaurantId]: false }));
    }
  };

  // Обработчики для создания пунктов меню
  const handleMenuItemInputChange = (restaurantId, e) => {
    const { name, value } = e.target;
    setNewMenuItem((prev) => ({
      ...prev,
      [restaurantId]: {
        ...prev[restaurantId],
        [name]: value,
      },
    }));
  };

  const handleCreateMenuItem = async (restaurantId) => {
    setIsAddingMenuItem((prev) => ({ ...prev, [restaurantId]: true }));
    try {
      const menuItemData = {
        name: newMenuItem[restaurantId]?.name,
        price: parseFloat(newMenuItem[restaurantId]?.price),
        description: newMenuItem[restaurantId]?.description || '',
        image_url: newMenuItem[restaurantId]?.image_url || '',
      };
      const response = await api.addMenuItem(restaurantId, menuItemData);
      setMenuItems((prev) => ({
        ...prev,
        [restaurantId]: [...(prev[restaurantId] || []), response.menu_item],
      }));
      setNewMenuItem((prev) => ({
        ...prev,
        [restaurantId]: { name: '', price: '', description: '', image_url: '' },
      }));
      alert('Пункт меню добавлен');
    } catch (error) {
      alert('Не удалось добавить пункт меню: ' + error.message);
    } finally {
      setIsAddingMenuItem((prev) => ({ ...prev, [restaurantId]: false }));
    }
  };

  if (authLoading) {
    return <p className="text-center">Авторизация...</p>;
  }

  if (authError) {
    return <p className="text-center text-red-500">Ошибка авторизации: {authError}</p>;
  }

  if (!user || !user.id) {
    return (
      <div className="text-center">
        <p>Пожалуйста, откройте приложение через Telegram для авторизации.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Профиль</h2>

      <div className="mb-6 p-3 rounded-lg shadow-md bg-white">
        <h3 className="text-lg font-bold mb-2">Информация о пользователе</h3>
        <div className="space-y-1">
          <p>
            <span className="font-bold">Имя:</span> {user.firstName || 'Не указано'}
          </p>
          <p>
            <span className="font-bold">Email:</span> {user.email || 'Не указано'}
          </p>
          <p>
            <span className="font-bold">Бонусные баллы:</span> {user.bonus_points || 0}
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

      <div className="mb-6 p-3 rounded-lg shadow-md bg-white">
        <h3 className="text-lg font-bold mb-2">Создать нового пользователя</h3>
        <div className="space-y-2">
          <input
            type="text"
            name="id"
            placeholder="ID пользователя"
            value={newUser.id}
            onChange={handleUserInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={newUser.name}
            onChange={handleUserInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={handleUserInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="bonus_points"
            placeholder="Бонусные баллы"
            value={newUser.bonus_points}
            onChange={handleUserInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="photo_url"
            placeholder="URL фото (опционально)"
            value={newUser.photo_url}
            onChange={handleUserInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateUser}
            disabled={isAdding}
            className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
          >
            {isAdding ? 'Создание...' : 'Создать пользователя'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Список пользователей</h3>
        {loading ? (
          <p className="text-center">Загрузка пользователей...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-center text-hint">Пользователей нет</p>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-lg shadow-md flex justify-between items-center bg-white"
              >
                <div className="space-y-1">
                  <p className="font-bold">ID: {u.id}</p>
                  <p className="text-sm text-hint">Имя: {u.name}</p>
                  <p className="text-sm text-hint">Email: {u.email}</p>
                  <p className="text-sm text-hint">Бонусные баллы: {u.bonus_points}</p>
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
                  className="p-2 rounded-md disabled:opacity-50 bg-destructive"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Управление ресторанами</h3>
        <div className="mb-4 p-3 rounded-lg shadow-md bg-white">
          <h4 className="text-md font-bold mb-2">Добавить новый ресторан</h4>
          <input
            type="text"
            placeholder="Адрес ресторана"
            value={newRestaurant}
            onChange={(e) => setNewRestaurant(e.target.value)}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <button
            onClick={handleAddRestaurant}
            disabled={isAdding || !newRestaurant}
            className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
          >
            {isAdding ? 'Добавление...' : 'Добавить ресторан'}
          </button>
        </div>
        <h4 className="text-md font-bold mb-2">Список ресторанов</h4>
        {loading ? (
          <p className="text-center">Загрузка ресторанов...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-hint">Ресторанов нет</p>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="p-3 rounded-lg shadow-md bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">
                    ID: {restaurant.id}, Адрес: {restaurant.address}
                  </span>
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                    disabled={isDeleting[restaurant.id]}
                    className="p-2 rounded-md disabled:opacity-50 bg-destructive"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>

                {/* Раздел для создания столов */}
                <div className="mt-4 p-3 rounded-lg shadow-md bg-white">
                  <h5 className="text-md font-bold mb-2">Добавить новый стол</h5>
                  <div className="space-y-2">
                    <input
                      type="number"
                      name="table_number"
                      placeholder="Номер стола"
                      value={newTable[restaurant.id]?.table_number || ''}
                      onChange={(e) => handleTableInputChange(restaurant.id, e)}
                      className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="capacity"
                      placeholder="Вместимость"
                      value={newTable[restaurant.id]?.capacity || ''}
                      onChange={(e) => handleTableInputChange(restaurant.id, e)}
                      className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCreateTable(restaurant.id)}
                      disabled={
                        isAddingTable[restaurant.id] ||
                        !newTable[restaurant.id]?.table_number ||
                        !newTable[restaurant.id]?.capacity
                      }
                      className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
                    >
                      {isAddingTable[restaurant.id] ? 'Добавление...' : 'Добавить стол'}
                    </button>
                  </div>
                </div>

                {/* Список столов */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Список столов</h5>
                  {tables[restaurant.id]?.length === 0 ? (
                    <p className="text-sm text-hint">Столов нет</p>
                  ) : (
                    <div className="space-y-2">
                      {tables[restaurant.id]?.map((table) => (
                        <div
                          key={table.table_number}
                          className="flex justify-between items-center p-2 rounded-md bg-gray-100"
                        >
                          <span className="text-sm text-hint">
                            Стол #{table.table_number}, Вместимость: {table.capacity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Раздел для создания пунктов меню */}
                <div className="mt-4 p-3 rounded-lg shadow-md bg-white">
                  <h5 className="text-md font-bold mb-2">Добавить новый пункт меню</h5>
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="name"
                      placeholder="Название"
                      value={newMenuItem[restaurant.id]?.name || ''}
                      onChange={(e) => handleMenuItemInputChange(restaurant.id, e)}
                      className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Цена"
                      value={newMenuItem[restaurant.id]?.price || ''}
                      onChange={(e) => handleMenuItemInputChange(restaurant.id, e)}
                      className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="description"
                      placeholder="Описание (опционально)"
                      value={newMenuItem[restaurant.id]?.description || ''}
                      onChange={(e) => handleMenuItemInputChange(restaurant.id, e)}
                      className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="image_url"
                      placeholder="URL изображения (опционально)"
                      value={newMenuItem[restaurant.id]?.image_url || ''}
                      onChange={(e) => handleMenuItemInputChange(restaurant.id, e)}
                      className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCreateMenuItem(restaurant.id)}
                      disabled={
                        isAddingMenuItem[restaurant.id] ||
                        !newMenuItem[restaurant.id]?.name ||
                        !newMenuItem[restaurant.id]?.price
                      }
                      className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
                    >
                      {isAddingMenuItem[restaurant.id] ? 'Добавление...' : 'Добавить пункт меню'}
                    </button>
                  </div>
                </div>

                {/* Список пунктов меню */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Меню ресторана</h5>
                  {menuItems[restaurant.id]?.length === 0 ? (
                    <p className="text-sm text-hint">Меню пусто</p>
                  ) : (
                    <div className="space-y-2">
                      {menuItems[restaurant.id]?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-2 rounded-md bg-gray-100"
                        >
                          <span className="text-sm text-hint">
                            ID: {item.id}, {item.name}, Цена: {item.price}
                          </span>
                          <button
                            onClick={() => handleDeleteMenuItem(restaurant.id, item.id)}
                            disabled={isDeletingMenuItem[item.id]}
                            className="p-2 rounded-md disabled:opacity-50 bg-destructive"
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