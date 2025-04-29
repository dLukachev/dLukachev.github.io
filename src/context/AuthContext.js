import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [retryCount, setRetryCount] = useState(0); // Счетчик повторных попыток

    const validateTelegram = async (initDataRaw) => {
        try {
            console.log('Validating initData:', initDataRaw);
            const response = await api.validateInitData({ init_data: initDataRaw });
            console.log('Validated user data from backend:', response);

            const userData = {
                id: response.id.toString(),
                firstName: response.first_name || '',
                lastName: response.last_name || '',
                username: response.username || '',
            };
            setUser(userData);
            setAuthError(null);

            // Проверяем доступность ресторанов
            await api.getRestaurants({
                user_id: userData.id,
                first_name: userData.firstName,
            });
            console.log('Successfully fetched restaurants for user:', userData.id);
        } catch (error) {
            console.error('Validation error:', error.message);
            throw error; // Пробрасываем ошибку для обработки в основном блоке
        }
    };

    const initTelegram = async () => {
        try {
            console.log('window.Telegram:', window.Telegram);
            if (window.Telegram && window.Telegram.WebApp) {
                const telegram = window.Telegram.WebApp;
                telegram.ready();

                const initDataRaw = telegram.initData;
                console.log('Raw initData:', initDataRaw);

                if (!initDataRaw) {
                    throw new Error('Не удалось получить initData от Telegram');
                }

                // Пытаемся валидировать initData
                await validateTelegram(initDataRaw);
            } else {
                console.log('Telegram Web App не доступен. Используется тестовый пользователь.');
                const testUser = {
                    id: '1102241880',
                    firstName: 'Danya',
                    lastName: '',
                    username: 'danya123',
                };
                console.log('Test user data:', testUser);
                setUser(testUser);

                try {
                    const params = {
                        user_id: testUser.id,
                        first_name: testUser.firstName,
                    };
                    console.log('Sending request with params:', params);
                    const response = await api.getRestaurants(params);
                    console.log('Response from backend for test user:', response);
                    setAuthError(null);
                } catch (error) {
                    console.error('Ошибка при авторизации тестового пользователя:', error.message);
                    setAuthError('Не удалось авторизовать тестового пользователя: ' + error.message);
                    setUser(null); // Сбрасываем user, если запрос не удался
                    throw error;
                }
            }
        } catch (error) {
            console.error('Общая ошибка при инициализации Telegram:', error.message);
            setAuthError('Ошибка инициализации: ' + error.message);

            // Пробуем повторить валидацию, если это не последняя попытка
            if (retryCount < 2) {
                console.log(`Попытка повторной валидации (${retryCount + 1}/2)...`);
                setTimeout(() => {
                    setRetryCount((prev) => prev + 1);
                    initTelegram();
                }, 3000); // Ждем 3 секунды перед повторной попыткой
                return; // Не устанавливаем loading в false, пока не закончим повторные попытки
            } else {
                setUser(null); // Если все попытки исчерпаны, сбрасываем user
            }
        } finally {
            if (retryCount >= 2 || !authError) {
                setLoading(false); // Устанавливаем loading в false только после всех попыток
            }
        }
    };

    useEffect(() => {
        initTelegram();
    }, [retryCount]); // Повторный вызов при изменении retryCount

    return (
        <AuthContext.Provider value={{ user, loading, authError }}>
            {children}
        </AuthContext.Provider>
    );
};