import React, { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    setUser(tg.initDataUnsafe?.user);
    tg.expand();
  }, []);

  return (
    <div>
      <h1>Mini App</h1>
      {user ? <p>Привет, {user.first.name}!</p> : <p>Загрузка...</p>}
    </div>
  );
}

export default App;