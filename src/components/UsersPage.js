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
        return <p>Авторизация...</p>;
    }

    if (!user) {
        return <p>Пожалуйста, откройте приложение через Telegram для авторизации.</p>;
    }

    if (loading) {
        return <p>Загрузка пользователей...</p>;
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
            <h2>Управление пользователями</h2>

            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Создать нового пользователя</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        name="id"
                        placeholder="ID пользователя"
                        value={newUser.id}
                        onChange={handleInputChange}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="text"
                        name="name"
                        placeholder="Имя"
                        value={newUser.name}
                        onChange={handleInputChange}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="number"
                        name="bonus_points"
                        placeholder="Бонусные баллы"
                        value={newUser.bonus_points}
                        onChange={handleInputChange}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="text"
                        name="photo_url"
                        placeholder="URL фото (опционально)"
                        value={newUser.photo_url}
                        onChange={handleInputChange}
                        style={{ padding: '5px' }}
                    />
                    <button
                        onClick={handleCreateUser}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                        }}
                    >
                        Создать пользователя
                    </button>
                </div>
            </div>

            <h3>Список пользователей</h3>
            {users.length === 0 ? (
                <p>Пользователей нет</p>
            ) : (
                <div>
                    {users.map((user) => (
                        <div
                            key={user.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: '10px 0',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                            }}
                        >
                            <div>
                                <p style={{ margin: '5px 0' }}>ID: {user.id}</p>
                                <p style={{ margin: '5px 0' }}>Имя: {user.name}</p>
                                <p style={{ margin: '5px 0' }}>Email: {user.email}</p>
                                <p style={{ margin: '5px 0' }}>Бонусные баллы: {user.bonus_points}</p>
                                {user.photo_url && (
                                    <img
                                        src={user.photo_url}
                                        alt={user.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        onError={(e) => (e.target.src = 'https://placehold.co/50x50')}
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={isDeleting[user.id]}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: isDeleting[user.id] ? '#ccc' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: isDeleting[user.id] ? 'not-allowed' : 'pointer',
                                }}
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