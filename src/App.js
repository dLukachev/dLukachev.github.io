import React, { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Проверяем, доступен ли Telegram Web Apps
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); // Инициализация
      setUser(tg.initDataUnsafe?.user || null); // Получаем данные пользователя
      tg.expand(); // Разворачиваем приложение на весь экран
    } else {
      console.log("Telegram Web Apps не доступен. Открой приложение через Telegram.");
    }
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Мини-приложение для Telegram</h1>
      {user ? (
        <p>Привет, {user.first_name}!</p>
      ) : (
        <p>Запусти приложение через Telegram</p>
      )}
    </div>
  );
}

export default App;