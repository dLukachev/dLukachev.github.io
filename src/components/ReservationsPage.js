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
        return <p>Авторизация...</p>;
    }

    if (!user) {
        return <p>Пожалуйста, откройте приложение через Telegram для авторизации.</p>;
    }

    if (loading) {
        return <p>Загрузка данных...</p>;
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
            <h2>Бронирование столов в ресторане #{restaurantId}</h2>

            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Добавить новый стол</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="number"
                        name="table_number"
                        placeholder="Номер стола"
                        value={newTable.table_number}
                        onChange={handleNewTableChange}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="number"
                        name="capacity"
                        placeholder="Вместимость стола"
                        value={newTable.capacity}
                        onChange={handleNewTableChange}
                        style={{ padding: '5px' }}
                    />
                    <button
                        onClick={handleCreateTable}
                        disabled={isCreatingTable || !newTable.table_number || !newTable.capacity}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: isCreatingTable ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: isCreatingTable ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isCreatingTable ? 'Добавление...' : 'Добавить стол'}
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Создать бронирование</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select
                        name="table_number"
                        value={newReservation.table_number}
                        onChange={handleInputChange}
                        style={{ padding: '5px' }}
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
                        style={{ padding: '5px' }}
                    />
                    <button
                        onClick={handleCreateReservation}
                        disabled={isBooking || !newReservation.table_number || !newReservation.reservation_start}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: isBooking ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: isBooking ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isBooking ? 'Бронирование...' : 'Забронировать'}
                    </button>
                </div>
            </div>

            <h3>Мои бронирования</h3>
            {reservations.length === 0 ? (
                <p>У вас нет бронирований</p>
            ) : (
                <div>
                    {reservations.map((reservation) => (
                        <div
                            key={reservation.id}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <p>Ресторан ID: {reservation.restaurant_id}</p>
                                <p>Адрес ресторана: {reservation.restaurant_address}</p>
                                <p>Стол №: {reservation.table_number}</p>
                                <p>Время: {new Date(reservation.reservation_start).toLocaleString()} - {new Date(reservation.reservation_end).toLocaleString()}</p>
                                <p>Статус: {reservation.status}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteReservation(reservation.id)}
                                disabled={isDeletingReservation[reservation.id]}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: isDeletingReservation[reservation.id] ? '#ccc' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: isDeletingReservation[reservation.id] ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isDeletingReservation[reservation.id] ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <h3>Доступные столы</h3>
            {tables.length === 0 ? (
                <p>Столов нет</p>
            ) : (
                <div>
                    {tables.map((table) => (
                        <div
                            key={table.table_number}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <span>Стол #{table.table_number}</span>
                            <button
                                onClick={() => handleDeleteTable(table.table_number)}
                                disabled={isDeletingTable[table.table_number]}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: isDeletingTable[table.table_number] ? '#ccc' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: isDeletingTable[table.table_number] ? 'not-allowed' : 'pointer',
                                }}
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