import React, { createContext, useState, useEffect } from 'react';
   import api from '../services/api';

   export const AuthContext = createContext();

   export const AuthProvider = ({ children }) => {
       const [user, setUser] = useState(null);
       const [loading, setLoading] = useState(true);
       const [authError, setAuthError] = useState(null);

       useEffect(() => {
           const initTelegram = async () => {
               try {
                   console.log('window.Telegram:', window.Telegram);
                   if (window.Telegram && window.Telegram.WebApp) {
                       const telegram = window.Telegram.WebApp;
                       telegram.ready();

                       const initDataRaw = telegram.initData;
                       console.log('Raw initData:', initDataRaw);

                       if (!initDataRaw) {
                           setAuthError('Не удалось получить initData от Telegram');
                           setUser(null);
                           return;
                       }

                       // Отправляем initData на бэкенд для проверки
                       const response = await api.validateInitData({ init_data: initDataRaw });
                       console.log('Validated user data from backend:', response);

                       const userData = {
                           id: response.id.toString(),
                           firstName: response.first_name || '',
                           lastName: response.last_name || '',
                           username: response.username || '',
                       };
                       setUser(userData);

                       await api.getRestaurants({
                           user_id: userData.id,
                           first_name: userData.firstName,
                       });
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
                           console.log('Response from backend:', response);
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