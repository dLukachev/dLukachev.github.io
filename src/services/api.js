import axios from 'axios';

   const apiClient = axios.create({
     baseURL: 'https://backend-rest-hrya.onrender.com',
     headers: {
       'Content-Type': 'application/json',
     },
   });

   const handleResponse = async (request) => {
     try {
       const response = await request;
       return response.data;
     } catch (error) {
       if (error.response) {
         const errorMessage = error.response.data.error || error.response.data.message || 'Неизвестная ошибка сервера';
         throw new Error(errorMessage);
       } else if (error.request) {
         throw new Error('Нет ответа от сервера');
       } else {
         throw new Error('Ошибка при отправке запроса: ' + error.message);
       }
     }
   };

   const api = {
    getRestaurants: (params = {}) => {
      console.log('getRestaurants called with params:', params);
      return handleResponse(apiClient.get('/restaurants', { params }));
    },
    validateInitData: (data) => handleResponse(apiClient.post('/validate-init-data', data)),
    addRestaurant: (data) => handleResponse(apiClient.post('/restaurants', data)),
    deleteRestaurant: (restaurantId) =>
      handleResponse(apiClient.delete(`/restaurants/${restaurantId}`)),
    getMenu: (restaurantId) =>
      handleResponse(apiClient.get(`/restaurants/${restaurantId}/menu`)),
    addMenuItem: (restaurantId, data) =>
      handleResponse(apiClient.post(`/restaurants/${restaurantId}/menu`, data)),
    updateMenuItem: (restaurantId, menuItemId, data) =>
      handleResponse(apiClient.put(`/restaurants/${restaurantId}/menu/${menuItemId}`, data)),
    deleteMenuItem: (restaurantId, menuItemId) => // Новый метод
      handleResponse(apiClient.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`)),
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
    getCart: (userId) => handleResponse(apiClient.get(`/cart/${userId}`)),
    addToCart: (userId, data) =>
      handleResponse(apiClient.post(`/cart/${userId}`, data)),
    removeFromCart: (userId, menuItemId) =>
      handleResponse(apiClient.delete(`/cart/${userId}/${menuItemId}`)),
    clearCart: (userId) => handleResponse(apiClient.delete(`/cart/${userId}`)),
    getUsers: () => handleResponse(apiClient.get('/users')),
    createUser: (data) => handleResponse(apiClient.post('/user', data)),
    deleteUser: (userId) => handleResponse(apiClient.delete(`/user/${userId}`)),
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
