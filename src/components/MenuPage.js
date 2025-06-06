import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import api from '../services/api.js';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function MenuPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', image_url: '' });
  const [newItemForm, setNewItemForm] = useState({ name: '', price: '', description: '', image_url: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const clearCartIfRestaurantChanged = async () => {
      const previousRestaurantId = localStorage.getItem('previousRestaurantId');
      if (previousRestaurantId && previousRestaurantId !== restaurantId) {
        try {
          await api.clearCart(user.id);
          console.log('Корзина очищена при переходе в другой ресторан');
        } catch (error) {
          console.error('Не удалось очистить корзину:', error);
        }
      }
      localStorage.setItem('previousRestaurantId', restaurantId);
    };

    const fetchMenu = async () => {
      try {
        const data = await api.getMenu(restaurantId);
        setMenuItems(data);
        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить меню: ' + error.message);
        setLoading(false);
      }
    };

    const init = async () => {
      await clearCartIfRestaurantChanged();
      await fetchMenu();
    };
    init();
  }, [restaurantId, user]);

  const handleAddToCart = async (item) => {
    const itemId = item.id;
    setIsAdding((prev) => ({ ...prev, [itemId]: true }));
    try {
      // Проверяем restaurantId
      const parsedRestaurantId = parseInt(restaurantId);
      if (isNaN(parsedRestaurantId)) {
        throw new Error('Некорректный ID ресторана');
      }

      // Проверяем menu_item_id
      if (!item.id || isNaN(item.id)) {
        throw new Error('Некорректный ID пункта меню');
      }

      const cartItem = {
        menu_item_id: parseInt(item.id),
        quantity: 1,
        restaurant_id: parsedRestaurantId,
      };

      // Логируем данные для отладки
      console.log('Добавление в корзину:', cartItem);

      const response = await api.addToCart(user.id, cartItem);
      alert('Добавлено в корзину: ' + response.message);
    } catch (error) {
      alert('Не удалось добавить в корзину: ' + error.message);
    } finally {
      setIsAdding((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setEditForm({
      name: item.name,
      price: item.price,
      description: item.description || '',
      image_url: item.image_url || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = async (itemId) => {
    try {
      const updatedData = {
        name: editForm.name,
        price: parseFloat(editForm.price),
        description: editForm.description,
        image_url: editForm.image_url,
      };
      const response = await api.updateMenuItem(restaurantId, itemId, updatedData);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? response.menu_item : item))
      );
      setEditingItem(null);
      alert('Пункт меню обновлён');
    } catch (error) {
      alert('Не удалось обновить пункт меню: ' + error.message);
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateItem = async () => {
    setIsCreating(true);
    try {
      const newItemData = {
        name: newItemForm.name,
        price: parseFloat(newItemForm.price),
        description: newItemForm.description,
        image_url: newItemForm.image_url,
      };
      const response = await api.addMenuItem(restaurantId, newItemData);
      setMenuItems((prev) => [...prev, response.menu_item]);
      setNewItemForm({ name: '', price: '', description: '', image_url: '' });
      alert('Пункт меню добавлен');
    } catch (error) {
      alert('Не удалось добавить пункт меню: ' + error.message);
    } finally {
      setIsCreating(false);
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
    return <p className="text-center">Загрузка меню...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="dark p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">Меню ресторана</h2>
      {user.role === 'admin' && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">Добавить новый пункт меню</h3>
          <div className="space-y-2">
            <input
              type="text"
              name="name"
              placeholder="Название"
              value={newItemForm.name}
              onChange={handleNewItemChange}
              className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
            />
            <input
              type="number"
              name="price"
              placeholder="Цена"
              value={newItemForm.price}
              onChange={handleNewItemChange}
              className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
            />
            <input
              type="text"
              name="description"
              placeholder="Описание (опционально)"
              value={newItemForm.description}
              onChange={handleNewItemChange}
              className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
            />
            <input
              type="text"
              name="image_url"
              placeholder="URL изображения (опционально)"
              value={newItemForm.image_url}
              onChange={handleNewItemChange}
              className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
            />
            <button
              onClick={handleCreateItem}
              disabled={isCreating || !newItemForm.name || !newItemForm.price}
              className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
            >
              {isCreating ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </div>
      )}
      <div className="grid gap-4">
        {menuItems.map((item) => (
          <div key={item.id || item.name} className="p-3 bg-gray-700 rounded-lg shadow-md">
            {editingItem === item.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                />
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                />
                <input
                  type="text"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                />
                <input
                  type="text"
                  name="image_url"
                  value={editForm.image_url}
                  onChange={handleEditChange}
                  className="p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateItem(item.id)}
                    className="flex-1 px-4 py-2 rounded-lg shadow-md flex items-center justify-center"
                  >
                    <FaSave className="mr-2" /> Сохранить
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="flex-1 px-4 py-2 rounded-lg shadow-md flex items-center justify-center bg-destructive"
                  >
                    <FaTimes className="mr-2" /> Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={item.image_url || 'https://placehold.co/100x100'}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-md mb-2"
                  onError={(e) => (e.target.src = 'https://placehold.co/100x100')}
                />
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-hint">{item.description}</p>
                <p className="text-sm text-hint">Цена: {item.price} руб.</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isAdding[item.id]}
                    className="flex-1 px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
                  >
                    {isAdding[item.id] ? 'Добавление...' : 'В корзину'}
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleEditClick(item)}
                      className="flex-1 px-4 py-2 rounded-lg shadow-md flex items-center justify-center bg-secondary"
                    >
                      <FaEdit className="mr-2" /> Редактировать
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {menuItems.length === 0 && <p className="text-center text-hint">Меню пусто</p>}
    </div>
  );
}

export default MenuPage;