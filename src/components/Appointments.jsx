import React, {useEffect, useState} from 'react';
import supabase from '../config/databaseClient';

const Appointments = ({doctorId}) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!doctorId || isNaN(Number(doctorId))) {
                console.error('неправильний doctorId:', doctorId);
                return;
            }

            try {
                const {data: timesData, error: timesError} = await supabase
                    .from('times')
                    .select('patient, date')
                    .eq('doctor_id', Number(doctorId))
                    .not('patient', 'is', null);

                if (timesError) throw timesError;

                const patientsIds = timesData.map((t) => t.patient);

                if (patientsIds.length === 0) {
                    setAppointments([]);
                    setLoading(false);
                    return;
                }

                const {data: patientsData, error: patientsError} = await supabase
                    .from('patients')
                    .select('patient_id, first_name, last_name, email')
                    .in('patient_id', patientsIds);

                if (patientsError) throw patientsError;

                const appointmentsWithNames = timesData.map((appointment) => {
                    const patient = patientsData.find((p) =>
                        p.patient_id === appointment.patient
                    );
                    return {
                        ...appointment,
                        patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'не визначено',
                        patientEmail: patient ? patient.email : null,
                    };
                });

                setAppointments(appointmentsWithNames);
            } catch (err) {
                console.error('помилка:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [doctorId]);

    const handleCancelByDoctor = async (appointment) => {
        try {
            // 1) Зняти бронь
            const {error: updateError} = await supabase
                .from('times')
                .update({patient: null, is_booked: false})
                .eq('doctor_id', Number(doctorId))
                .eq('date', appointment.date);

            if (updateError) throw updateError;

            // 2) Отримати дані пацієнта (якщо ще не всі є)
            let patientData = null;
            if (!appointment.patientEmail) {
                const {data} = await supabase
                    .from('patients')
                    .select('first_name, last_name, email')
                    .eq('patient_id', appointment.patient)
                    .single();
                patientData = data;
            } else {
                patientData = {
                    first_name: appointment.patientName?.split(' ')[0] || '',
                    last_name: appointment.patientName?.split(' ')[1] || '',
                    email: appointment.patientEmail
                };
            }

            // 3) Отримати дані лікаря
            const {data: doctorData} = await supabase
                .from('doctors')
                .select('first_name, last_name, email')
                .eq('doctor_id', Number(doctorId))
                .single();

            const dateObj = new Date(appointment.date);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString();

            // 4) Лист пацієнту про скасування
            await fetch("http://localhost:4000/send-cancel-email", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: patientData.email,
                    therapistName: `${doctorData.first_name} ${doctorData.last_name}`,
                    date: dateStr,
                    time: timeStr
                })
            });

            // 5) Лист лікарю (підтвердження, що запис скасовано)
            await fetch("http://localhost:4000/send-therapist-cancel", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: doctorData.email,
                    patientName: `${patientData.first_name} ${patientData.last_name}`,
                    date: dateStr,
                    time: timeStr
                })
            });

            // 6) Оновити локальний список
            setAppointments(prev =>
                prev.filter(a => !(a.patient === appointment.patient && a.date === appointment.date))
            );
            alert('Запис скасовано. Пацієнтові надіслано повідомлення.');
        } catch (err) {
            console.error('Error cancelling appointment:', err);
            alert('Не вдалося скасувати запис.');
        }
    };

    if (loading) return (
        <div className="banter-loader">
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
            <div className="banter-loader__box"></div>
        </div>
    );

    return (
        <div>
            {appointments.length > 0 ? (
                appointments.map((appointment, index) => (
                    <div key={index} className="appointment-item">
                        <p>Пацієнт: {appointment.patientName}</p>
                        <p>Дата запису: {new Date(appointment.date).toLocaleString()}</p>
                        <button
                            className="cancel-btn"
                            onClick={() => handleCancelByDoctor(appointment)}
                        >
                            Скасувати
                        </button>
                    </div>
                ))
            ) : (
                <div className="appointment-item">
                    <p>Записів немає.</p>
                </div>
            )}
        </div>
    );
};

export default Appointments;
