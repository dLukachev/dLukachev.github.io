import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import api from '../services/api.js';
import { FaTrash } from 'react-icons/fa';

function UsersPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    bonus_points: 0,
    photo_url: '',
  });
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
    return <p className="text-center">Авторизация...</p>;
  }

  if (!user) {
    return (
      <p className="text-center">
        Пожалуйста, откройте приложение через Telegram для авторизации.
      </p>
    );
  }

  if (loading) {
    return <p className="text-center">Загрузка пользователей...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (user.role !== 'admin') {
    return <p className="text-center">Доступ только для администраторов</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Управление пользователями</h2>
      <div className="mb-4 p-3 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2">Создать нового пользователя</h3>
        <div className="space-y-2">
          <input
            type="text"
            name="id"
            placeholder="ID пользователя"
            value={newUser.id}
            onChange={handleInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
          />
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={newUser.name}
            onChange={handleInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={handleInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
          />
          <input
            type="number"
            name="bonus_points"
            placeholder="Бонусные баллы"
            value={newUser.bonus_points}
            onChange={handleInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
          />
          <input
            type="text"
            name="photo_url"
            placeholder="URL фото (опционально)"
            value={newUser.photo_url}
            onChange={handleInputChange}
            className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
          />
          <button
            onClick={handleCreateUser}
            className="w-full px-4 py-2 rounded-lg shadow-md"
          >
            Создать пользователя
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">Список пользователей</h3>
      {users.length === 0 ? (
        <p className="text-center text-hint">Пользователей нет</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="space-y-1">
                <p className="font-bold">ID: {user.id}</p>
                <p className="text-sm text-hint">Имя: {user.name}</p>
                <p className="text-sm text-hint">Email: {user.email}</p>
                <p className="text-sm text-hint">Бонусные баллы: {user.bonus_points}</p>
                {user.photo_url && (
                  <img
                    src={user.photo_url}
                    alt={user.name}
                    className="w-12 h-12 object-cover rounded-md"
                    onError={(e) => (e.target.src = 'https://placehold.co/50x50')}
                  />
                )}
              </div>
              <button
                onClick={() => handleDeleteUser(user.id)}
                disabled={isDeleting[user.id]}
                className="p-2 rounded-md disabled:opacity-50 bg-destructive"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersPage;