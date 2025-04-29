import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

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
        return <p className="text-center text-gray-600">Авторизация...</p>;
    }

    if (!user) {
        return (
            <p className="text-center text-gray-600">
                Пожалуйста, откройте приложение через Telegram для авторизации.
            </p>
        );
    }

    if (loading) {
        return <p className="text-center text-gray-600">Загрузка данных...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4 max-w-md">
            <Link to="/">
                <button className="mb-4 px-4 py-2 bg-gray-200 text-black rounded-lg shadow-md hover:bg-gray-300 transition">
                    Назад
                </button>
            </Link>
            <h2 className="text-xl font-bold text-black mb-4">Бронирование столов в ресторане #{restaurantId}</h2>
            <div className="p-3 bg-white rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-bold text-black mb-2">Добавить новый стол</h3>
                <div className="space-y-2">
                    <input
                        type="number"
                        name="table_number"
                        placeholder="Номер стола"
                        value={newTable.table_number}
                        onChange={handleNewTableChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="capacity"
                        placeholder="Вместимость стола"
                        value={newTable.capacity}
                        onChange={handleNewTableChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCreateTable}
                        disabled={isCreatingTable || !newTable.table_number || !newTable.capacity}
                        className={`w-full px-4 py-3 rounded-lg text-white shadow-md ${
                            isCreatingTable ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        } transition`}
                    >
                        {isCreatingTable ? 'Добавление...' : 'Добавить стол'}
                    </button>
                </div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-bold text-black mb-2">Создать бронирование</h3>
                <div className="space-y-2">
                    <select
                        name="table_number"
                        value={newReservation.table_number}
                        onChange={handleInputChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCreateReservation}
                        disabled={isBooking || !newReservation.table_number || !newReservation.reservation_start}
                        className={`w-full px-4 py-3 rounded-lg text-white shadow-md ${
                            isBooking ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        } transition`}
                    >
                        {isBooking ? 'Бронирование...' : 'Забронировать'}
                    </button>
                </div>
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Мои бронирования</h3>
            {reservations.length === 0 ? (
                <p className="text-gray-600 text-center">У вас нет бронирований</p>
            ) : (
                <div className="space-y-4">
                    {reservations.map((reservation) => (
                        <div
                            key={reservation.id}
                            className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
                        >
                            <div className="space-y-1">
                                <p className="text-black font-medium">Ресторан ID: {reservation.restaurant_id}</p>
                                <p className="text-sm text-gray-600">Адрес: {reservation.restaurant_address}</p>
                                <p className="text-sm text-gray-600">Стол №: {reservation.table_number}</p>
                                <p className="text-sm text-gray-600">
                                    Время: {new Date(reservation.reservation_start).toLocaleString()} -{' '}
                                    {new Date(reservation.reservation_end).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">Статус: {reservation.status}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteReservation(reservation.id)}
                                disabled={isDeletingReservation[reservation.id]}
                                className={`px-3 py-1 rounded-md text-white shadow-md ${
                                    isDeletingReservation[reservation.id]
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-pink-500 hover:bg-pink-600'
                                } transition`}
                            >
                                {isDeletingReservation[reservation.id] ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <h3 className="text-lg font-bold text-black mb-2 mt-4">Доступные столы</h3>
            {tables.length === 0 ? (
                <p className="text-gray-600 text-center">Столов нет</p>
            ) : (
                <div className="space-y-4">
                    {tables.map((table) => (
                        <div
                            key={table.table_number}
                            className="p-3 bg-white rounded-lg shadow-md flex justify-between items-center"
                        >
                            <span className="text-black font-medium">Стол #{table.table_number}</span>
                            <button
                                onClick={() => handleDeleteTable(table.table_number)}
                                disabled={isDeletingTable[table.table_number]}
                                className={`px-3 py-1 rounded-md text-white shadow-md ${
                                    isDeletingTable[table.table_number]
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-pink-500 hover:bg-pink-600'
                                } transition`}
                            >
                                {isDeletingTable[table.table_number] ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReservationsPage;