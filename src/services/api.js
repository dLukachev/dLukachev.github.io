import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:3333',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для обработки ответов и ошибок
const handleResponse = async (request) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (error.response) {
      // Сервер вернул ошибку с кодом (например, 404, 400)
      const errorMessage = error.response.data.error || error.response.data.message || 'Неизвестная ошибка сервера';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      throw new Error('Нет ответа от сервера');
    } else {
      // Ошибка при настройке запроса
      throw new Error('Ошибка при отправке запроса: ' + error.message);
    }
  }
};

const api = {
  // Рестораны
  getRestaurants: () => handleResponse(apiClient.get('/restaurants')),
  addRestaurant: (data) => handleResponse(apiClient.post('/restaurants', data)),
  deleteRestaurant: (restaurantId) =>
    handleResponse(apiClient.delete(`/restaurants/${restaurantId}`)),

  // Меню
  getMenu: (restaurantId) =>
    handleResponse(apiClient.get(`/restaurants/${restaurantId}/menu`)),
  addMenuItem: (restaurantId, data) =>
    handleResponse(apiClient.post(`/restaurants/${restaurantId}/menu`, data)),
  updateMenuItem: (restaurantId, menuItemId, data) =>
    handleResponse(apiClient.put(`/restaurants/${restaurantId}/menu/${menuItemId}`, data)),

  // Столы
  getAvailableTables: (restaurantId, reservationStart) =>
    handleResponse(
      apiClient.get(`/restaurants/${restaurantId}/tables/available`, {
        params: { reservation_start: reservationStart },
      })
    ),
  addTable: (restaurantId, data) =>
    handleResponse(apiClient.post(`/restaurants/${restaurantId}/tables/new`, data)),
  deleteTable: (restaurantId, tableNumber) =>
    handleResponse(apiClient.delete(`/restaurants/${restaurantId}/tables/${tableNumber}`)),

  // Бронирования
  createReservation: (restaurantId, userId, data) =>
    handleResponse(
      apiClient.post(`/restaurants/${restaurantId}/${userId}/tables/booking`, data)
    ),
  getReservations: (userId) =>
    handleResponse(apiClient.get(`/reservations/${userId}`)),
  deleteReservation: (restaurantId, userId, reservationId) =>
    handleResponse(
      apiClient.delete(
        `/restaurants/${restaurantId}/${userId}/tables/booking/${reservationId}`
      )
    ),

  // Корзина
  getCart: (userId) => handleResponse(apiClient.get(`/cart/${userId}`)),
  addToCart: (userId, data) =>
    handleResponse(apiClient.post(`/cart/${userId}`, data)),
  removeFromCart: (userId, menuItemId) =>
    handleResponse(apiClient.delete(`/cart/${userId}/${menuItemId}`)),
  clearCart: (userId) => handleResponse(apiClient.delete(`/cart/${userId}`)),

  // Пользователи
  getUsers: () => handleResponse(apiClient.get('/users')),
  createUser: (data) => handleResponse(apiClient.post('/user', data)),
  deleteUser: (userId) => handleResponse(apiClient.delete(`/user/${userId}`)),

  // Заказы
  getOrders: (userId) => handleResponse(apiClient.get(`/orders/${userId}`)),
  createOrder: (userId, data) =>
    handleResponse(apiClient.post(`/orders/${userId}`, data)),
  updateOrderStatus: (userId, orderId, data) =>
    handleResponse(apiClient.put(`/orders/${userId}/${orderId}`, data)),
  deleteOrder: (userId, orderId) =>
    handleResponse(apiClient.delete(`/orders/${userId}/${orderId}`)),
  addOrderItem: (userId, orderId, data) =>
    handleResponse(apiClient.post(`/orders/${userId}/${orderId}/items`, data)),
  removeOrderItem: (userId, orderId, menuItemId) =>
    handleResponse(apiClient.delete(`/orders/${userId}/${orderId}/items/${menuItemId}`)),
};

export default api;