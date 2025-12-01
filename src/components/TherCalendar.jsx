import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import '../styles/calendar.css';
import supabase from "../config/databaseClient";
import {ReactComponent as Frame} from '../assets/Frame.svg';

const TherCalendar = () => {
    const {id} = useParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
    const [sessionDates, setSessionDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [sessionTimes, setSessionTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [isPatient, setIsPatient] = useState(false);

    useEffect(() => {
        const status = localStorage.getItem('status');
        setIsPatient(status === 'patient');
    }, []);

    const monthNames = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];

    const isLeapYear = (year) => {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const generateCalendar = () => {
        const daysOfMonth = [
            31, 28 + (isLeapYear(currentYear) ? 1 : 0), 31, 30, 31, 30,
            31, 31, 30, 31, 30, 31
        ];

        const firstDay = new Date(currentYear, currentMonth);

        const days = [];
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }

        for (let day = 1; day <= daysOfMonth[currentMonth]; day++) {
            const selectedSessions = sessionDates.filter(session => new Date(session.date).getDate() === day);

            const isSessionDay = selectedSessions.some(session => !session.is_booked);

            const isBooked = selectedSessions.every(session => session.is_booked);

            days.push(
                <div
                    key={day}
                    className={`
                ${day === currentDate.getDate() && currentYear === currentDate.getFullYear() && currentMonth === currentDate.getMonth() ? 'current-date' : ''}
                ${isSessionDay ? 'rehearsal-date' : ''}
                ${isBooked ? 'booked-date' : ''}
            `}
                    style={{
                        pointerEvents: isBooked ? 'none' : 'auto',
                    }}
                    onClick={() => !isBooked && handleDayClick(day, isSessionDay)}
                >
                    {day}
                </div>
            );
        }

        return days;
    };


    useEffect(() => {
        console.log('Doctor ID:', id);
        const fetchSessionDates = async () => {
            setLoading(true);

            if (!id) {
                console.error('Doctor ID is undefined or missing');
                setLoading(false);
                return;
            }

            const startDate = new Date(currentYear, currentMonth, 1).toISOString();
            const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

            const {data, error} = await supabase
                .from('times')
                .select('date, is_booked')
                .eq('doctor_id', id)
                .gte('date', startDate)
                .lte('date', endDate);

            if (error) {
                console.error('Error fetching session dates:', error);
            } else {
                setSessionDates(data);
            }
            setLoading(false);
        };

        fetchSessionDates();
    }, [currentMonth, currentYear, id]);

    const handleDayClick = (day, isSessionDay) => {
        if (isSessionDay) {
            const selectedSessions = sessionDates.filter(session => new Date(session.date).getDate() === day);
            const availableSessions = selectedSessions.filter(session => !session.is_booked);

            setSelectedDate(day);
            const times = availableSessions.map(session => new Date(session.date).toLocaleTimeString());
            setSessionTimes(times);
            setSelectedTime(times.length === 1 ? times[0] : null);
            setShowSessionForm(true);
        } else {
            setShowSessionForm(false);
        }
    };

    const handleConfirmSession = async () => {
        const patientId = localStorage.getItem('patient_id');

        if (!patientId) {
            alert('Patient ID не знайдено!');
            return;
        }

        const selectedSession = sessionDates.find(session =>
            new Date(session.date).getDate() === selectedDate &&
            new Date(session.date).toLocaleTimeString() === selectedTime &&
            !session.is_booked
        );

        if (!selectedSession) {
            alert('Сеанс не знайдено або вже заброньований!');
            return;
        }

        const {error} = await supabase
            .from('times')
            .update({patient: patientId, is_booked: true})
            .eq('date', selectedSession.date)
            .eq('doctor_id', id);

        if (error) {
            console.error('Error booking session:', error);
            alert('Помилка під час бронювання.');
        } else {
            const patientEmail = localStorage.getItem("email");

            const { data: doctorData } = await supabase
                .from("doctors")
                .select("first_name, last_name")
                .eq("doctor_id", id)
                .single();

            await fetch("http://localhost:4000/api/send-booking-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: patientEmail,
                    therapistName: `${doctorData.first_name} ${doctorData.last_name}`,
                    date: `${selectedDate}.${currentMonth + 1}.${currentYear}`,
                    time: selectedTime
                })
            });

            alert("Сеанс підтверджено! Лист надіслано на вашу пошту.");

            setSessionDates(prevDates =>
                prevDates.map(session =>
                    session.date === selectedSession.date
                        ? {...session, is_booked: true}
                        : session
                )
            );
            setShowSessionForm(false);
        }
    };


    const changeMonth = (direction) => {
        setLoading(true);
        if (direction === 'prev') {
            setCurrentMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
            setCurrentYear(prevMonth => (prevMonth === 0 ? currentYear - 1 : currentYear));
        } else {
            setCurrentMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
            setCurrentYear(prevMonth => (prevMonth === 11 ? currentYear + 1 : currentYear));
        }
    };

    return (
        <div className="container">
            <Frame className="leafIcon"/>

            <div className="calendar">
                <div className="calendar-header">
                    <span className="month-picker">{currentYear}</span>
                    <div className="year-picker">
                        <span
                            id="pre-month"
                            style={{cursor: 'pointer'}}
                            onClick={() => changeMonth('prev')}
                        >
                            &lt;
                        </span>
                        <span
                            id="month"
                            style={{cursor: 'pointer', margin: '0 10px'}}
                        >
                            {monthNames[currentMonth]}
                        </span>
                        <span
                            id="next-month"
                            style={{cursor: 'pointer'}}
                            onClick={() => changeMonth('next')}
                        >
                            &gt;
                        </span>
                    </div>
                </div>
                <div className="calendar-body">
                    <div className="calendar-week-days">
                        <div>Нд</div>
                        <div>Пн</div>
                        <div>Вт</div>
                        <div>Ср</div>
                        <div>Чт</div>
                        <div>Пт</div>
                        <div>Сб</div>
                    </div>
                    <div className="calendar-days">
                        {loading ? <div>Loading...</div> : generateCalendar()}
                    </div>
                </div>

                {showSessionForm && (
                    <div className="session-form">
                        <h4>
                            Дата запису: {selectedDate}.{currentMonth + 1}.{currentYear}
                        </h4>
                        {sessionTimes.length > 1 ? (
                            sessionTimes.map((time, index) => (
                                <label key={index}>
                                    <input
                                        type="radio"
                                        value={time}
                                        checked={selectedTime === time}
                                        onChange={() => setSelectedTime(time)}
                                    />
                                    {time}
                                </label>
                            ))
                        ) : (
                            <p>{sessionTimes[0]}</p>
                        )}
                        {isPatient && (
                            <button className="confirmsession" onClick={handleConfirmSession}>
                                Підтвердити сеанс
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Frame className="leafIcon"/>
        </div>
    );
};

export default TherCalendar;

