import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

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
        return <p className="text-center text-gray-600">Авторизация...</p>;
    }

    if (!user) {
        return (
            <p className="text-center text-gray-600">
                Пожалуйста, откройте приложение через Telegram для авторизации.
            </p>
        );
    }

    if (loading) {
        return <p className="text-center text-gray-600">Загрузка пользователей...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4 max-w-md">
            <Link to="/">
                <button className="mb-4 px-4 py-2 bg-gray-200 text-black rounded-lg shadow-md hover:bg-gray-300 transition">
                    Назад
                </button>
            </Link>
            <h2 className="text-xl font-bold text-black mb-4">Управление пользователями</h2>
            <div className="p-3 bg-white rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-bold text-black mb-2">Создать нового пользователя</h3>
                <div className="space-y-2">
                    <input
                        type="text"
                        name="id"
                        placeholder="ID пользователя"
                        value={newUser.id}
                        onChange={handleInputChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="name"
                        placeholder="Имя"
                        value={newUser.name}
                        onChange={handleInputChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="bonus_points"
                        placeholder="Бонусные баллы"
                        value={newUser.bonus_points}
                        onChange={handleInputChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="photo_url"
                        placeholder="URL фото (опционально)"
                        value={newUser.photo_url}
                        onChange={handleInputChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCreateUser}
                        className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        Создать пользователя
                    </button>
                </div>
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Список пользователей</h3>
            {users.length === 0 ? (
                <p className="text-gray-600 text-center">Пользователей нет</p>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
                        >
                            <div className="space-y-1">
                                <p className="text-black font-medium">ID: {user.id}</p>
                                <p className="text-sm text-gray-600">Имя: {user.name}</p>
                                <p className="text-sm text-gray-600">Email: {user.email}</p>
                                <p className="text-sm text-gray-600">Бонусные баллы: {user.bonus_points}</p>
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
                                className={`px-3 py-1 rounded-md text-white shadow-md ${
                                    isDeleting[user.id] ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'
                                } transition`}
                            >
                                {isDeleting[user.id] ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UsersPage;