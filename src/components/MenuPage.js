import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function MenuPage() {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', image_url: '' });
  const [newItemForm, setNewItemForm] = useState({ name: '', price: '', description: '', image_url: '' });
  const [isCreating, setIsCreating] = useState(false);

  const userId = '1102241880';

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await api.getMenu(restaurantId);
        console.log('Данные меню:', data);
        setMenuItems(data);
        setLoading(false);
      } catch (error) {
        setError('Не удалось загрузить меню: ' + error.message);
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurantId]);

  const handleAddToCart = async (item) => {
    const itemId = item.id;
    setIsAdding((prev) => ({ ...prev, [itemId]: true }));
    try {
      const cartItem = {
        menu_item_id: itemId,
        name_item: item.name,
        item_price: item.price,
        quantity: 1,
      };
      const response = await api.addToCart(userId, cartItem);
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
      setMenuItems((prev) => [...prev, response.menu_item]); // Добавляем новый пункт с id
      setNewItemForm({ name: '', price: '', description: '', image_url: '' });
      alert('Пункт меню добавлен');
    } catch (error) {
      alert('Не удалось добавить пункт меню: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <p>Загрузка меню...</p>;
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
      <h2>Меню ресторана</h2>

      {/* Форма для добавления нового пункта меню */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Добавить новый пункт меню</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <input
            type="text"
            name="name"
            placeholder="Название"
            value={newItemForm.name}
            onChange={handleNewItemChange}
            style={{ padding: '5px' }}
          />
          <input
            type="number"
            name="price"
            placeholder="Цена"
            value={newItemForm.price}
            onChange={handleNewItemChange}
            style={{ padding: '5px' }}
          />
          <input
            type="text"
            name="description"
            placeholder="Описание (опционально)"
            value={newItemForm.description}
            onChange={handleNewItemChange}
            style={{ padding: '5px' }}
          />
          <input
            type="text"
            name="image_url"
            placeholder="URL изображения (опционально)"
            value={newItemForm.image_url}
            onChange={handleNewItemChange}
            style={{ padding: '5px' }}
          />
          <button
            onClick={handleCreateItem}
            disabled={isCreating || !newItemForm.name || !newItemForm.price}
            style={{
              padding: '5px 10px',
              backgroundColor: isCreating ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: isCreating ? 'not-allowed' : 'pointer',
            }}
          >
            {isCreating ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>

      {/* Список пунктов меню */}
      {menuItems.length === 0 ? (
        <p>Меню пусто</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {menuItems.map((item) => (
            <div
              key={item.id || item.name} // Временный ключ, если id отсутствует
              style={{
                width: '200px',
                margin: '10px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                textAlign: 'center',
              }}
            >
              {editingItem === item.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    style={{ padding: '5px' }}
                  />
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    style={{ padding: '5px' }}
                  />
                  <input
                    type="text"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    style={{ padding: '5px' }}
                  />
                  <input
                    type="text"
                    name="image_url"
                    value={editForm.image_url}
                    onChange={handleEditChange}
                    style={{ padding: '5px' }}
                  />
                  <button
                    onClick={() => handleUpdateItem(item.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <>
                  <img
                    src={item.image_url || 'https://placehold.co/100x100'}
                    alt={item.name}
                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    onError={(e) => (e.target.src = 'https://placehold.co/100x100')}
                  />
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p>Цена: {item.price} руб.</p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isAdding[item.id]}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: isAdding[item.id] ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: isAdding[item.id] ? 'not-allowed' : 'pointer',
                      marginRight: '5px',
                    }}
                  >
                    {isAdding[item.id] ? 'Добавление...' : 'Добавить в корзину'}
                  </button>
                  <button
                    onClick={() => handleEditClick(item)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    Редактировать
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuPage;