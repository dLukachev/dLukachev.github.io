import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null); // Добавляем состояние для ошибок

    useEffect(() => {
        const initTelegram = async () => {
            try {
                // Проверяем наличие Telegram Web App
                if (window.Telegram && window.Telegram.WebApp) {
                    const telegram = window.Telegram.WebApp;
                    telegram.ready(); // Инициализация Telegram Web App

                    const initData = telegram.initDataUnsafe || {};
                    const telegramUser = initData.user;

                    if (telegramUser && telegramUser.id) {
                        const userData = {
                            id: telegramUser.id.toString(),
                            firstName: telegramUser.first_name || '',
                            lastName: telegramUser.last_name || '',
                            username: telegramUser.username || '',
                        };
                        setUser(userData);

                        // Отправляем данные пользователя на бэкенд через getRestaurants
                        await api.getRestaurants({
                            user_id: userData.id,
                            first_name: userData.firstName,
                        });
                    } else {
                        setAuthError('Не удалось получить данные пользователя из Telegram');
                        setUser(null);
                    }
                } else {
                    // Заглушка для тестирования вне Telegram
                    console.log('Telegram Web App не доступен. Используется тестовый пользователь.');
                    const testUser = {
                        id: '1102241880',
                        firstName: 'Danya',
                        lastName: '',
                        username: 'danya123',
                    };
                    setUser(testUser);

                    // Отправляем тестового пользователя на бэкенд
                    try {
                        const response = await api.getRestaurants({
                            user_id: testUser.id,
                            first_name: testUser.firstName,
                        });
                        console.log('Ответ от бэкенда для тестового пользователя:', response);
                    } catch (error) {
                        console.error('Ошибка при авторизации тестового пользователя:', error.message);
                        setAuthError('Не удалось авторизовать тестового пользователя: ' + error.message);
                    }
                }
            } catch (error) {
                console.error('Общая ошибка при инициализации Telegram:', error);
                setAuthError('Ошибка инициализации: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        initTelegram();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, authError }}>
            {children}
        </AuthContext.Provider>
    );
};