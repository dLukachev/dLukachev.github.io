import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import RestaurantsAdminPage from './RestaurantsAdminPage';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response.users || []);
        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить пользователей: ' + error.message);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async () => {
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[var(--tg-theme-text-color)]">Профиль</h2>

      {/* Информация о пользователе */}
      <div className="mb-6 p-3 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Информация о пользователе</h3>
        <div className="space-y-1">
          <p className="text-[var(--tg-theme-text-color)]">
            <span className="font-bold">Имя:</span> {user.firstName || 'Не указано'}
          </p>
          <p className="text-[var(--tg-theme-text-color)]">
            <span className="font-bold">Email:</span> {user.email || 'Не указано'}
          </p>
          <p className="text-[var(--tg-theme-text-color)]">
            <span className="font-bold">Бонусные баллы:</span> {user.bonus_points || 0}
          </p>
          <p className="text-[var(--tg-theme-text-color)]">
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

      {/* Создание пользователей (только для админов) */}
      {user.role === 'admin' && (
        <>
          <div className="mb-6 p-3 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Создать нового пользователя</h3>
            <div className="space-y-2">
              <input
                type="text"
                name="id"
                placeholder="ID пользователя"
                value={newUser.id}
                onChange={handleInputChange}
                className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                style={{ borderColor: 'var(--tg-theme-hint-color)' }}
              />
              <input
                type="text"
                name="name"
                placeholder="Имя"
                value={newUser.name}
                onChange={handleInputChange}
                className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                style={{ borderColor: 'var(--tg-theme-hint-color)' }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleInputChange}
                className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                style={{ borderColor: 'var(--tg-theme-hint-color)' }}
              />
              <input
                type="number"
                name="bonus_points"
                placeholder="Бонусные баллы"
                value={newUser.bonus_points}
                onChange={handleInputChange}
                className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                style={{ borderColor: 'var(--tg-theme-hint-color)' }}
              />
              <input
                type="text"
                name="photo_url"
                placeholder="URL фото (опционально)"
                value={newUser.photo_url}
                onChange={handleInputChange}
                className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                style={{ borderColor: 'var(--tg-theme-hint-color)' }}
              />
              <button
                onClick={handleCreateUser}
                className="w-full px-4 py-2 rounded-lg shadow-md"
                style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              >
                Создать пользователя
              </button>
            </div>
          </div>

          {/* Список пользователей */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Список пользователей</h3>
            {loading ? (
              <p className="text-center text-[var(--tg-theme-text-color)]">Загрузка пользователей...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : users.length === 0 ? (
              <p className="text-[var(--tg-theme-hint-color)] text-center">Пользователей нет</p>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-[var(--tg-theme-text-color)]">ID: {u.id}</p>
                      <p className="text-sm text-[var(--tg-theme-hint-color)]">Имя: {u.name}</p>
                      <p className="text-sm text-[var(--tg-theme-hint-color)]">Email: {u.email}</p>
                      <p className="text-sm text-[var(--tg-theme-hint-color)]">Бонусные баллы: {u.bonus_points}</p>
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
                        backgroundColor: isDeleting[u.id] ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-destructive-color, #dc3545)',
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

          {/* Админка ресторанов */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Управление ресторанами</h3>
            <RestaurantsAdminPage />
          </div>
        </>
      )}
    </div>
  );
}

export default ProfilePage;