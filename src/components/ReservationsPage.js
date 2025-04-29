import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

function ReservationsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { restaurantId } = useParams();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [newTable, setNewTable] = useState({ table_number: '', capacity: '' });
  const [newReservation, setNewReservation] = useState({
    table_number: '',
    reservation_start: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [isDeletingReservation, setIsDeletingReservation] = useState({});
  const [isDeletingTable, setIsDeletingTable] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const tablesResponse = await api.getAvailableTables(restaurantId, newReservation.reservation_start);
        setTables(tablesResponse || []);

        const reservationsResponse = await api.getReservations(user.id);
        setReservations(reservationsResponse.reservations || []);

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId, newReservation.reservation_start, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewTableChange = (e) => {
    const { name, value } = e.target;
    setNewTable((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTable = async () => {
    setIsCreatingTable(true);
    try {
      const tableData = {
        table_number: parseInt(newTable.table_number),
        capacity: parseInt(newTable.capacity),
      };
      const response = await api.addTable(restaurantId, tableData);
      setTables((prev) => [...prev, { table_number: response.table.table_number, capacity: response.table.capacity }]);
      setNewTable({ table_number: '', capacity: '' });
      alert('Стол добавлен');
    } catch (error) {
      alert('Не удалось добавить стол: ' + error.message);
    } finally {
      setIsCreatingTable(false);
    }
  };

  const handleCreateReservation = async () => {
    setIsBooking(true);
    try {
      const reservationData = {
        table_number: parseInt(newReservation.table_number),
        reservation_start: new Date(newReservation.reservation_start).toISOString(),
      };
      const response = await api.createReservation(restaurantId, user.id, reservationData);
      setReservations((prev) => [...prev, response.reservation]);
      setNewReservation({ table_number: '', reservation_start: '' });
      alert('Бронирование создано: ' + response.message);
    } catch (error) {
      alert('Не удалось создать бронирование: ' + error.message);
    } finally {
      setIsBooking(false);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    setIsDeletingReservation((prev) => ({ ...prev, [reservationId]: true }));
    try {
      await api.deleteReservation(restaurantId, user.id, reservationId);
      setReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId));
      alert('Бронирование удалено');
    } catch (error) {
      alert('Не удалось удалить бронирование: ' + error.message);
    } finally {
      setIsDeletingReservation((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  const handleDeleteTable = async (tableNumber) => {
    setIsDeletingTable((prev) => ({ ...prev, [tableNumber]: true }));
    try {
      await api.deleteTable(restaurantId, tableNumber);
      setTables((prev) => prev.filter((table) => table.table_number !== tableNumber));
      alert('Стол удалён');
    } catch (error) {
      alert('Не удалось удалить стол: ' + error.message);
    } finally {
      setIsDeletingTable((prev) => ({ ...prev, [tableNumber]: false }));
    }
  };

  if (authLoading) {
    return <p className="text-center text-[var(--tg-theme-text-color)]">Авторизация...</p>;
  }

  if (!user) {
    return (
      <p className="text-center text-[var(--tg-theme-text-color)]">
        Пожалуйста, откройте приложение через Telegram для авторизации.
      </p>
    );
  }

  if (loading) {
    return <p className="text-center text-[var(--tg-theme-text-color)]">Загрузка данных...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[var(--tg-theme-text-color)]">Бронирование столов в ресторане #{restaurantId}</h2>
      {user.role === 'admin' && (
        <div className="mb-4 p-3 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Добавить новый стол</h3>
          <div className="space-y-2">
            <input
              type="number"
              name="table_number"
              placeholder="Номер стола"
              value={newTable.table_number}
              onChange={handleNewTableChange}
              className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
              style={{ borderColor: 'var(--tg-theme-hint-color)' }}
            />
            <input
              type="number"
              name="capacity"
              placeholder="Вместимость стола"
              value={newTable.capacity}
              onChange={handleNewTableChange}
              className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
              style={{ borderColor: 'var(--tg-theme-hint-color)' }}
            />
            <button
              onClick={handleCreateTable}
              disabled={isCreatingTable || !newTable.table_number || !newTable.capacity}
              className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
              style={{
                backgroundColor: isCreatingTable ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-button-color)',
                color: 'var(--tg-theme-button-text-color)',
              }}
            >
              {isCreatingTable ? 'Добавление...' : 'Добавить стол'}
            </button>
          </div>
        </div>
      )}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Создать бронирование</h3>
        <div className="space-y-2">
          <select
            name="table_number"
            value={newReservation.table_number}
            onChange={handleInputChange}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
            style={{ borderColor: 'var(--tg-theme-hint-color)' }}
          >
            <option value="">Выберите стол</option>
            {tables.map((table) => (
              <option key={table.table_number} value={table.table_number}>
                Стол #{table.table_number}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            name="reservation_start"
            value={newReservation.reservation_start}
            onChange={handleInputChange}
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-link-color)]"
            style={{ borderColor: 'var(--tg-theme-hint-color)' }}
          />
          <button
            onClick={handleCreateReservation}
            disabled={isBooking || !newReservation.table_number || !newReservation.reservation_start}
            className="w-full px-4 py-2 rounded-lg shadow-md disabled:opacity-50"
            style={{
              backgroundColor: isBooking ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-button-color)',
              color: 'var(--tg-theme-button-text-color)',
            }}
          >
            {isBooking ? 'Бронирование...' : 'Забронировать'}
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2 text-[var(--tg-theme-text-color)]">Мои бронирования</h3>
      {reservations.length === 0 ? (
        <p className="text-[var(--tg-theme-hint-color)] text-center">У вас нет бронирований</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="space-y-1">
                <p className="font-bold text-[var(--tg-theme-text-color)]">Ресторан ID: {reservation.restaurant_id}</p>
                <p className="text-sm text-[var(--tg-theme-hint-color)]">Адрес: {reservation.restaurant_address}</p>
                <p className="text-sm text-[var(--tg-theme-hint-color)]">Стол №: {reservation.table_number}</p>
                <p className="text-sm text-[var(--tg-theme-hint-color)]">
                  Время: {new Date(reservation.reservation_start).toLocaleString()} -{' '}
                  {new Date(reservation.reservation_end).toLocaleString()}
                </p>
                <p className="text-sm text-[var(--tg-theme-hint-color)]">Статус: {reservation.status}</p>
              </div>
              <button
                onClick={() => handleDeleteReservation(reservation.id)}
                disabled={isDeletingReservation[reservation.id]}
                className="p-2 rounded-md disabled:opacity-50"
                style={{
                  backgroundColor: isDeletingReservation[reservation.id] ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-destructive-color, #dc3545)',
                  color: 'var(--tg-theme-button-text-color)',
                }}
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <h3 className="text-lg font-bold mb-2 mt-4 text-[var(--tg-theme-text-color)]">Доступные столы</h3>
      {tables.length === 0 ? (
        <p className="text-[var(--tg-theme-hint-color)] text-center">Столов нет</p>
      ) : (
        <div className="space-y-4">
          {tables.map((table) => (
            <div
              key={table.table_number}
              className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
            >
              <span className="font-bold text-[var(--tg-theme-text-color)]">Стол #{table.table_number}</span>
              {user.role === 'admin' && (
                <button
                  onClick={() => handleDeleteTable(table.table_number)}
                  disabled={isDeletingTable[table.table_number]}
                  className="p-2 rounded-md disabled:opacity-50"
                  style={{
                    backgroundColor: isDeletingTable[table.table_number] ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-destructive-color, #dc3545)',
                    color: 'var(--tg-theme-button-text-color)',
                  }}
                >
                  <FaTrash size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReservationsPage;