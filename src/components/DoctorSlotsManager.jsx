import React, { useEffect, useState } from 'react';
import supabase from '../config/databaseClient';

const DoctorSlotsManager = ({ doctorId }) => {
    const [slotDate, setSlotDate] = useState('');
    const [slotTime, setSlotTime] = useState('');
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSlots = async () => {
        if (!doctorId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
            .from('times')
            .select('id, doctor_id, date, is_booked, patient')
            .eq('doctor_id', Number(doctorId))
            .gte('date', nowIso)
            .order('date', { ascending: true });

        if (error) {
            console.error('Помилка завантаження слотів:', error);
            setSlots([]);
        } else {
            setSlots(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchSlots();
    }, [doctorId]);

    const handleAddSlot = async () => {
        if (!doctorId) {
            alert('Не знайдено ID спеціаліста.');
            return;
        }

        if (!slotDate || !slotTime) {
            alert('Оберіть дату і час.');
            return;
        }

        const slotDateTime = `${slotDate}T${slotTime}:00`;
        const selectedDate = new Date(slotDateTime);
        const now = new Date();

        if (selectedDate <= now) {
            alert('Не можна додати слот у минулому.');
            return;
        }

        const { data: existingSlot, error: existingError } = await supabase
            .from('times')
            .select('date')
            .eq('doctor_id', Number(doctorId))
            .eq('date', slotDateTime)
            .maybeSingle();

        if (existingError) {
            console.error('Помилка перевірки існуючого слота:', existingError);
            alert(`Не вдалося перевірити слот: ${existingError.message}`);
            return;
        }

        if (existingSlot) {
            alert('Такий слот уже існує.');
            return;
        }

        const { data: lastSlot, error: lastSlotError } = await supabase
            .from('times')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (lastSlotError) {
            console.error('Помилка отримання останнього id слота:', lastSlotError);
            alert(`Не вдалося отримати id нового слота: ${lastSlotError.message}`);
            return;
        }

        const nextSlotId = lastSlot && lastSlot[0]
            ? lastSlot[0].id + 1
            : 1;

        const { data: insertedSlot, error: insertError } = await supabase
            .from('times')
            .insert([
                {
                    id: nextSlotId,
                    doctor_id: Number(doctorId),
                    date: slotDateTime,
                    is_booked: false,
                    patient: null
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error('Помилка додавання слота:', insertError);
            alert(`Не вдалося додати слот: ${insertError.message}`);
            return;
        }

        console.log('Слот успішно додано:', insertedSlot);

        setSlotDate('');
        setSlotTime('');
        await fetchSlots();
        alert('Вільний слот успішно додано.');
    };

    const handleDeleteSlot = async (slot) => {
        if (slot.is_booked) {
            alert('Не можна видалити слот, який уже заброньований.');
            return;
        }

        const confirmed = window.confirm('Видалити цей вільний слот?');
        if (!confirmed) return;

        const { error } = await supabase
            .from('times')
            .delete()
            .eq('doctor_id', Number(doctorId))
            .eq('date', slot.date);

        if (error) {
            console.error('Помилка видалення слота:', error);
            alert(`Не вдалося видалити слот: ${error.message}`);
            return;
        }

        await fetchSlots();
    };

    const formatDate = (dateValue) =>
        new Date(dateValue).toLocaleDateString('uk-UA');

    const formatTime = (dateValue) =>
        new Date(dateValue).toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });

    return (
        <div className="availability-manager">
            <h2 className="section-title">Мої вільні дати та час</h2>

            <div className="availability-form">
                <div className="availability-field">
                    <label>Дата</label>
                    <input
                        type="date"
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                    />
                </div>

                <div className="availability-field">
                    <label>Час</label>
                    <input
                        type="time"
                        value={slotTime}
                        onChange={(e) => setSlotTime(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="edit-btn add-slot-btn"
                    onClick={handleAddSlot}
                >
                    Додати слот
                </button>
            </div>

            <div className="availability-list">
                <h3 className="availability-subtitle">Доступні та заброньовані слоти</h3>

                {loading ? (
                    <p>Завантаження слотів...</p>
                ) : slots.length === 0 ? (
                    <p>Поки що жодного слота не додано.</p>
                ) : (
                    slots.map((slot, index) => (
                        <div
                            key={`${slot.date}-${index}`}
                            className={`availability-item ${slot.is_booked ? 'booked-slot' : 'free-slot'}`}
                        >
                            <div className="availability-info">
                                <p>
                                    <strong>Дата:</strong> {formatDate(slot.date)}
                                </p>
                                <p>
                                    <strong>Час:</strong> {formatTime(slot.date)}
                                </p>
                                <p>
                                    <strong>Статус:</strong>{' '}
                                    {slot.is_booked ? 'Заброньовано' : 'Вільний'}
                                </p>
                            </div>

                            {!slot.is_booked && (
                                <button
                                    type="button"
                                    className="delete-slot-btn"
                                    onClick={() => handleDeleteSlot(slot)}
                                >
                                    Видалити
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DoctorSlotsManager;