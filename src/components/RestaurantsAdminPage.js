import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import api from '../services/api.js';
import { FaTrash, FaPlus } from 'react-icons/fa';

function RestaurantsAdminPage() {
  const { user, loading: authLoading, authError } = useContext(AuthContext);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [newRestaurant, setNewRestaurant] = useState('');
  const [newMenuItem, setNewMenuItem] = useState({
    restaurantId: null,
    name: '',
    price: '',
    description: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [isDeletingMenuItem, setIsDeletingMenuItem] = useState({});

  // ... (предыдущий код useEffect, handleAddRestaurant, handleDeleteRestaurant, handleDeleteMenuItem)

  const handleNewMenuItemChange = (e) => {
    const { name, value } = e.target;
    setNewMenuItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateMenuItem = async (restaurantId) => {
    setIsAddingMenuItem((prev) => ({ ...prev, [restaurantId]: true }));
    try {
      const menuItemData = {
        name: newMenuItem.name,
        price: parseFloat(newMenuItem.price),
        description: newMenuItem.description,
        image_url: newMenuItem.image_url,
      };
      const response = await api.addMenuItem(restaurantId, menuItemData);
      setMenuItems((prev) => ({
        ...prev,
        [restaurantId]: [...(prev[restaurantId] || []), response.menu_item],
      }));
      setNewMenuItem({ restaurantId: null, name: '', price: '', description: '', image_url: '' });
      alert('Пункт меню добавлен');
    } catch (error) {
      alert('Не удалось добавить пункт меню: ' + error.message);
    } finally {
      setIsAddingMenuItem((prev) => ({ ...prev, [restaurantId]: false }));
    }
  };

  // ... (предыдущий код для authLoading, authError, user, loading, error, role checks)

  return (
    <div
      className="p-4"
      style={{ backgroundColor: 'var(--tg-theme-bg-color, #121212)', color: 'var(--tg-theme-text-color, #E0E0E0)' }}
    >
      <h2 className="text-xl font-bold mb-4">Управление ресторанами</h2>
      {/* Форма добавления ресторана (без изменений) */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2">Добавить новый ресторан</h3>
        <input
          type="text"
          placeholder="Адрес ресторана"
          value={newRestaurant}
          onChange={(e) => setNewRestaurant(e.target.value)}
          className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)] mb-2"
          style={{ borderColor: 'var(--tg-theme-hint-color, #B0B0B0)' }}
        />
        <button
          onClick={handleAddRestaurant}
          disabled={isAdding || !newRestaurant}
          className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
          style={{
            backgroundColor: isAdding ? 'var(--tg-theme-hint-color, #B0B0B0)' : 'var(--tg-theme-button-color, #1976D2)',
            color: 'var(--tg-theme-button-text-color, #FFFFFF)',
          }}
        >
          {isAdding ? 'Добавление...' : 'Добавить ресторан'}
        </button>
      </div>
      <h3 className="text-lg font-bold mb-2">Список ресторанов</h3>
      {restaurants.length === 0 ? (
        <p className="text-center" style={{ color: 'var(--tg-theme-hint-color, #B0B0B0)' }}>
          Ресторанов нет
        </p>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <div key={restaurant.data.restaurants_id} className="p-3 bg-white rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">
                  ID: {restaurant.data.restaurants_id}, Адрес: {restaurant.data.restaurants_address}
                </span>
                <button
                  onClick={() => handleDeleteRestaurant(restaurant.data.restaurants_id)}
                  disabled={isDeleting[restaurant.data.restaurants_id]}
                  className="p-2 rounded-md disabled:opacity-50"
                  style={{
                    backgroundColor: isDeleting[restaurant.data.restaurants_id]
                      ? 'var(--tg-theme-hint-color, #B0B0B0)'
                      : 'var(--tg-theme-destructive-color, #dc3545)',
                    color: 'var(--tg-theme-button-text-color, #FFFFFF)',
                  }}
                >
                  <FaTrash size={16} />
                </button>
              </div>
              {/* Новая форма добавления пункта меню */}
              {newMenuItem.restaurantId === restaurant.data.restaurants_id ? (
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <h4 className="text-sm font-medium">Добавить пункт меню</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="name"
                      placeholder="Название"
                      value={newMenuItem.name}
                      onChange={handleNewMenuItemChange}
                      className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                      style={{ borderColor: 'var(--tg-theme-hint-color, #B0B0B0)' }}
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Цена"
                      value={newMenuItem.price}
                      onChange={handleNewMenuItemChange}
                      className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                      style={{ borderColor: 'var(--tg-theme-hint-color, #B0B0B0)' }}
                    />
                    <input
                      type="text"
                      name="description"
                      placeholder="Описание (опционально)"
                      value={newMenuItem.description}
                      onChange={handleNewMenuItemChange}
                      className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                      style={{ borderColor: 'var(--tg-theme-hint-color, #B0B0B0)' }}
                    />
                    <input
                      type="text"
                      name="image_url"
                      placeholder="URL изображения (опционально)"
                      value={newMenuItem.image_url}
                      onChange={handleNewMenuItemChange}
                      className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
                      style={{ borderColor: 'var(--tg-theme-hint-color, #B0B0B0)' }}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCreateMenuItem(restaurant.data.restaurants_id)}
                        disabled={
                          isAddingMenuItem[restaurant.data.restaurants_id] ||
                          !newMenuItem.name ||
                          !newMenuItem.price
                        }
                        className="flex-1 px-4 py-2 rounded-lg shadow-md disabled:opacity-50 flex items-center justify-center"
                        style={{
                          backgroundColor: isAddingMenuItem[restaurant.data.restaurants_id]
                            ? 'var(--tg-theme-hint-color, #B0B0B0)'
                            : 'var(--tg-theme-button-color, #1976D2)',
                          color: 'var(--tg-theme-button-text-color, #FFFFFF)',
                        }}
                      >
                        <FaPlus className="mr-2" />{' '}
                        {isAddingMenuItem[restaurant.data.restaurants_id] ? 'Добавление...' : 'Добавить'}
                      </button>
                      <button
                        onClick={() =>
                          setNewMenuItem({
                            restaurantId: null,
                            name: '',
                            price: '',
                            description: '',
                            image_url: '',
                          })
                        }
                        className="flex-1 px-4 py-2 rounded-lg shadow-md flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--tg-theme-destructive-color, #dc3545)',
                          color: 'var(--tg-theme-button-text-color, #FFFFFF)',
                        }}
                      >
                        <FaTimes className="mr-2" /> Отмена
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() =>
                    setNewMenuItem({
                      restaurantId: restaurant.data.restaurants_id,
                      name: '',
                      price: '',
                      description: '',
                      image_url: '',
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg shadow-md flex items-center justify-center mb-2"
                  style={{
                    backgroundColor: 'var(--tg-theme-button-color, #1976D2)',
                    color: 'var(--tg-theme-button-text-color, #FFFFFF)',
                  }}
                >
                  <FaPlus className="mr-2" /> Добавить пункт меню
                </button>
              )}
              <div className="mt-2">
                <h4 className="text-sm font-medium">Меню ресторана</h4>
                {menuItems[restaurant.data.restaurants_id]?.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color, #B0B0B0)' }}>
                    Меню пусто
                  </p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {menuItems[restaurant.data.restaurants_id]?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                      >
                        <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color, #B0B0B0)' }}>
                          ID: {item.id}, {item.name}, Цена: {item.price}
                        </span>
                        <button
                          onClick={() => handleDeleteMenuItem(restaurant.data.restaurants_id, item.id)}
                          disabled={isDeletingMenuItem[item.id]}
                          className="p-2 rounded-md disabled:opacity-50"
                          style={{
                            backgroundColor: isDeletingMenuItem[item.id]
                              ? 'var(--tg-theme-hint-color, #B0B0B0)'
                              : 'var(--tg-theme-destructive-color, #dc3545)',
                            color: 'var(--tg-theme-button-text-color, #FFFFFF)',
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantsAdminPage;