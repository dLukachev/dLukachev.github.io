/**
 * API клиент для взаимодействия с бэкендом ресторана
 * Базовый URL: https://backend-rest-hrya.onrender.com
 */

// const BASE_URL = 'https://backend-rest-hrya.onrender.com';
const BASE_URL = 'http://127.0.0.1:3333';


// Общая функция для выполнения запросов
async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    throw error;
  }
}

// Общие endpoints
export const api = {
  /**
   * Проверка работы API
   * @returns {Promise<Object>} Ответ сервера
   */
  checkApi: () => makeRequest('GET', '/'),

  // Рестораны
  /**
   * Получить список всех ресторанов
   * @returns {Promise<Array>} Список ресторанов
   */
  getRestaurants: () => makeRequest('GET', '/restaurants'),

  /**
   * Добавить новый ресторан
   * @param {Object} data - Данные ресторана
   * @param {string} data.address - Адрес ресторана
   * @returns {Promise<Object>} Созданный ресторан
   */
  addRestaurant: (data) => makeRequest('POST', '/restaurants', data),

  // Меню
  /**
   * Получить меню ресторана
   * @param {number} restaurantId - ID ресторана
   * @returns {Promise<Array>} Список пунктов меню
   */
  getMenu: (restaurantId) => makeRequest('GET', `/restaurants/${restaurantId}/menu`),

  /**
   * Добавить пункт в меню ресторана
   * @param {number} restaurantId - ID ресторана
   * @param {Object} data - Данные пункта меню
   * @param {string} data.name - Название
   * @param {number} data.price - Цена
   * @param {string} [data.description] - Описание
   * @param {string} [data.image_url] - URL изображения
   * @returns {Promise<Object>} Созданный пункт меню
   */
  addMenuItem: (restaurantId, data) => makeRequest('POST', `/restaurants/${restaurantId}/menu`, data),

  /**
   * Обновить пункт меню
   * @param {number} restaurantId - ID ресторана
   * @param {number} menuItemId - ID пункта меню
   * @param {Object} data - Новые данные
   * @returns {Promise<Object>} Обновленный пункт меню
   */
  updateMenuItem: (restaurantId, menuItemId, data) => 
    makeRequest('PUT', `/restaurants/${restaurantId}/menu/${menuItemId}`, data),

  // Столы
  /**
   * Получить доступные столы в ресторане
   * @param {number} restaurantId - ID ресторана
   * @returns {Promise<Array>} Список столов
   */
  getAvailableTables: (restaurantId) => makeRequest('GET', `/restaurants/${restaurantId}/tables/available`),

  /**
   * Добавить стол в ресторан
   * @param {number} restaurantId - ID ресторана
   * @param {Object} data - Данные стола
   * @param {number} data.table_number - Номер стола
   * @returns {Promise<Object>} Созданный стол
   */
  addTable: (restaurantId, data) => makeRequest('POST', `/restaurants/${restaurantId}/tables/new`, data),

  /**
   * Удалить стол из ресторана
   * @param {number} restaurantId - ID ресторана
   * @param {number} tableNumber - Номер стола
   * @returns {Promise<Object>} Результат удаления
   */
  deleteTable: (restaurantId, tableNumber) => 
    makeRequest('DELETE', `/restaurants/${restaurantId}/tables/${tableNumber}`),

  // Бронирования
  /**
   * Создать бронирование стола
   * @param {number} restaurantId - ID ресторана
   * @param {number} userId - ID пользователя
   * @param {Object} data - Данные бронирования
   * @param {number} data.table_number - Номер стола
   * @param {string} data.reservation_start - Время начала брони (ISO строка)
   * @returns {Promise<Object>} Созданное бронирование
   */
  createReservation: (restaurantId, userId, data) => 
    makeRequest('POST', `/restaurants/${restaurantId}/${userId}/tables/booking`, data),

  /**
   * Обновить бронирование
   * @param {number} restaurantId - ID ресторана
   * @param {number} userId - ID пользователя
   * @param {number} reservationId - ID бронирования
   * @param {Object} data - Новые данные
   * @returns {Promise<Object>} Обновленное бронирование
   */
  updateReservation: (restaurantId, userId, reservationId, data) => 
    makeRequest('PUT', `/restaurants/${restaurantId}/${userId}/tables/booking/${reservationId}`, data),

  /**
   * Удалить бронирование
   * @param {number} restaurantId - ID ресторана
   * @param {number} userId - ID пользователя
   * @param {number} reservationId - ID бронирования
   * @returns {Promise<Object>} Результат удаления
   */
  deleteReservation: (restaurantId, userId, reservationId) => 
    makeRequest('DELETE', `/restaurants/${restaurantId}/${userId}/tables/booking/${reservationId}`),

  // Корзина
  /**
   * Получить содержимое корзины пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} Содержимое корзины
   */
  getCart: (userId) => makeRequest('GET', `/cart/${userId}`),

  /**
   * Добавить элемент в корзину
   * @param {number} userId - ID пользователя
   * @param {Object} data - Данные элемента
   * @param {number} data.menu_item_id - ID пункта меню
   * @param {string} data.name_item - Название
   * @param {number} data.item_price - Цена
   * @param {number} data.quantity - Количество
   * @returns {Promise<Object>} Добавленный элемент
   */
  addToCart: (userId, data) => makeRequest('POST', `/cart/${userId}`, data),

  /**
   * Удалить элемент из корзины
   * @param {number} userId - ID пользователя
   * @param {number} menuItemId - ID пункта меню
   * @returns {Promise<Object>} Результат удаления
   */
  removeFromCart: (userId, menuItemId) => 
    makeRequest('DELETE', `/cart/${userId}/${menuItemId}`),

  // Пользователи
  /**
   * Получить список всех пользователей
   * @returns {Promise<Array>} Список пользователей
   */
  getUsers: () => makeRequest('GET', '/users'),

  /**
   * Получить информацию о пользователе
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} Данные пользователя
   */
  getUser: (userId) => makeRequest('GET', `/user/${userId}`),

  /**
   * Создать нового пользователя
   * @param {Object} data - Данные пользователя
   * @param {number} data.id - ID пользователя
   * @param {string} data.name - Имя
   * @param {string} data.email - Email
   * @param {number} [data.bonus_points=0] - Бонусные баллы
   * @param {string} [data.photo_url] - URL фото
   * @returns {Promise<Object>} Созданный пользователь
   */
  createUser: (data) => makeRequest('POST', '/user', data),

  /**
   * Удалить пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} Результат удаления
   */
  deleteUser: (userId) => makeRequest('DELETE', `/user/${userId}`),

  // Заказы
  /**
   * Получить заказы пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} Список заказов
   */
  getOrders: (userId) => makeRequest('GET', `/orders/${userId}`),

  /**
   * Создать заказ из корзины
   * @param {number} userId - ID пользователя
   * @param {Object} data - Данные заказа
   * @param {number} data.restaurant_id - ID ресторана
   * @returns {Promise<Object>} Созданный заказ
   */
  createOrder: (userId, data) => makeRequest('POST', `/orders/${userId}`, data),

  /**
   * Удалить заказ
   * @param {number} userId - ID пользователя
   * @param {number} orderId - ID заказа
   * @returns {Promise<Object>} Результат удаления
   */
  deleteOrder: (userId, orderId) => makeRequest('DELETE', `/orders/${userId}/${orderId}`),

  /**
   * Обновить статус заказа
   * @param {number} userId - ID пользователя
   * @param {number} orderId - ID заказа
   * @param {Object} data - Новый статус
   * @param {string} data.status - Новый статус
   * @returns {Promise<Object>} Обновленный заказ
   */
  updateOrderStatus: (userId, orderId, data) => 
    makeRequest('PUT', `/orders/${userId}/${orderId}`, data),

  /**
   * Добавить элемент в заказ
   * @param {number} userId - ID пользователя
   * @param {number} orderId - ID заказа
   * @param {Object} data - Данные элемента
   * @param {number} data.menu_item_id - ID пункта меню
   * @param {number} data.quantity - Количество
   * @returns {Promise<Object>} Добавленный элемент
   */
  addOrderItem: (userId, orderId, data) => 
    makeRequest('POST', `/orders/${userId}/${orderId}/items`, data),

  /**
   * Удалить элемент из заказа
   * @param {number} userId - ID пользователя
   * @param {number} orderId - ID заказа
   * @param {number} menuItemId - ID пункта меню
   * @returns {Promise<Object>} Результат удаления
   */
  removeOrderItem: (userId, orderId, menuItemId) => 
    makeRequest('DELETE', `/orders/${userId}/${orderId}/items/${menuItemId}`),

  // Бронирования
  /**
   * Получить бронирования пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} Список бронирований
   */
  getReservations: (userId) => makeRequest('GET', `/reservations/${userId}`),
  
  // Рестораны
  /**
   * Удалить ресторан
   * @param {number} restaurantId - ID ресторана
   * @returns {Promise<Object>} Результат удаления
   */
  deleteRestaurant: (restaurantId) => makeRequest('DELETE', `/restaurants/${restaurantId}`),

    /**
   * Получить доступные столы в ресторане
   * @param {number} restaurantId - ID ресторана
   * @param {string} [reservationStart] - Время бронирования (ISO строка)
   * @returns {Promise<Array>} Список столов
   */
  getAvailableTables: (restaurantId, reservationStart) => {
    const endpoint = reservationStart
      ? `/restaurants/${restaurantId}/tables/available?reservation_start=${encodeURIComponent(reservationStart)}`
      : `/restaurants/${restaurantId}/tables/available`;
    return makeRequest('GET', endpoint);
  },

};

export default api;


// ПРИМЕР ИСПОЛЬЗОВАНИЯ 
 
// Получить список ресторанов
// api.getRestaurants()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// // Создать нового пользователя
// api.createUser({
//   id: 1234567890,
//   name: "John Doe",
//   email: "john@example.com",
//   bonus_points: 0.0
// })
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// // Добавить элемент в корзину
// api.addToCart(1234567890, {
//   menu_item_id: 1,
//   name_item: "Pizza",
//   item_price: 1200,
//   quantity: 1
// })
//   .then(data => console.log(data))
//   .catch(error => console.error(error));