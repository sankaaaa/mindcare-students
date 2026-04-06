import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import '../styles/calendar.css';
import supabase from "../config/databaseClient";
import {ReactComponent as Frame} from '../assets/Frame.svg';

const TherCalendar = () => {
    const { id } = useParams();
    const [currentDate] = useState(new Date());
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
        const status = sessionStorage.getItem("status");
        setIsPatient(status === "patient");
    }, []);

    const monthNames = [
        "Січень",
        "Лютий",
        "Березень",
        "Квітень",
        "Травень",
        "Червень",
        "Липень",
        "Серпень",
        "Вересень",
        "Жовтень",
        "Листопад",
        "Грудень",
    ];

    const isLeapYear = (year) => {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const formatSessionTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isPastSession = (sessionDateString) => {
        const sessionDate = new Date(sessionDateString);
        const now = new Date();
        return sessionDate < now;
    };

    const cleanupOldSlots = async () => {
        if (!id) return;

        const nowIso = new Date().toISOString();

        const { error } = await supabase
            .from("times")
            .delete()
            .eq("doctor_id", id)
            .lt("date", nowIso);

        if (error) {
            console.error("Помилка видалення старих слотів:", error);
        }
    };

    const generateCalendar = () => {
        const daysOfMonth = [
            31,
            28 + (isLeapYear(currentYear) ? 1 : 0),
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31,
        ];

        const firstDay = new Date(currentYear, currentMonth, 1);

        const days = [];
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }

        for (let day = 1; day <= daysOfMonth[currentMonth]; day++) {
            const selectedSessions = sessionDates.filter((session) => {
                const sessionDate = new Date(session.date);
                return (
                    sessionDate.getDate() === day &&
                    sessionDate.getMonth() === currentMonth &&
                    sessionDate.getFullYear() === currentYear &&
                    !isPastSession(session.date)
                );
            });

            const isSessionDay = selectedSessions.some(
                (session) => !session.is_booked
            );

            const isBooked =
                selectedSessions.length > 0 &&
                selectedSessions.every((session) => session.is_booked);

            const currentCellDate = new Date(currentYear, currentMonth, day);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const isPastDay = currentCellDate < todayStart;

            days.push(
                <div
                    key={day}
                    className={`
                        ${
                        day === currentDate.getDate() &&
                        currentYear === currentDate.getFullYear() &&
                        currentMonth === currentDate.getMonth()
                            ? "current-date"
                            : ""
                    }
                        ${isSessionDay ? "rehearsal-date" : ""}
                        ${isBooked ? "booked-date" : ""}
                        ${isPastDay ? "past-date" : ""}
                    `}
                    style={{
                        pointerEvents: isBooked || isPastDay ? "none" : "auto",
                        opacity: isPastDay ? 0.4 : 1,
                    }}
                    onClick={() => !isBooked && !isPastDay && handleDayClick(day, isSessionDay)}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    useEffect(() => {
        const fetchSessionDates = async () => {
            setLoading(true);

            if (!id) {
                console.error("Doctor ID is undefined or missing");
                setLoading(false);
                return;
            }

            await cleanupOldSlots();

            const startDate = new Date(
                currentYear,
                currentMonth,
                1
            ).toISOString();

            const endDate = new Date(
                currentYear,
                currentMonth + 1,
                0,
                23,
                59,
                59
            ).toISOString();

            const { data, error } = await supabase
                .from("times")
                .select("date, is_booked")
                .eq("doctor_id", id)
                .gte("date", startDate)
                .lte("date", endDate);

            if (error) {
                console.error("Error fetching session dates:", error);
            } else {
                setSessionDates(data || []);
            }

            setLoading(false);
        };

        fetchSessionDates();
    }, [currentMonth, currentYear, id]);

    const handleDayClick = (day, isSessionDay) => {
        if (isSessionDay) {
            const selectedSessions = sessionDates.filter((session) => {
                const sessionDate = new Date(session.date);
                return (
                    sessionDate.getDate() === day &&
                    sessionDate.getMonth() === currentMonth &&
                    sessionDate.getFullYear() === currentYear
                );
            });

            const availableSessions = selectedSessions.filter(
                (session) => !session.is_booked && !isPastSession(session.date)
            );

            if (availableSessions.length === 0) {
                setShowSessionForm(false);
                setSelectedDate(null);
                setSessionTimes([]);
                setSelectedTime(null);
                alert("На цю дату вже немає доступних майбутніх слотів.");
                return;
            }

            setSelectedDate(day);

            const times = availableSessions.map((session) =>
                formatSessionTime(session.date)
            );

            setSessionTimes(times);
            setSelectedTime(times.length === 1 ? times[0] : null);
            setShowSessionForm(true);
        } else {
            setShowSessionForm(false);
            setSelectedDate(null);
            setSessionTimes([]);
            setSelectedTime(null);
        }
    };

    const handleConfirmSession = async () => {
        const patientId = sessionStorage.getItem("patient_id");

        if (!patientId) {
            alert("Patient ID не знайдено!");
            return;
        }

        const selectedSession = sessionDates.find(
            (session) =>
                new Date(session.date).getDate() === selectedDate &&
                new Date(session.date).getMonth() === currentMonth &&
                new Date(session.date).getFullYear() === currentYear &&
                formatSessionTime(session.date) === selectedTime &&
                !session.is_booked
        );

        if (!selectedSession) {
            alert("Сеанс не знайдено або вже заброньований!");
            return;
        }

        if (isPastSession(selectedSession.date)) {
            alert("Не можна записатися на дату або час, що вже минули.");
            return;
        }

        const { error: updateError } = await supabase
            .from("times")
            .update({ patient: patientId, is_booked: true })
            .eq("date", selectedSession.date)
            .eq("doctor_id", id);

        if (updateError) {
            console.error("Error booking session:", updateError);
            alert("Помилка під час бронювання.");
            return;
        }

        const { data: doctorData, error: docError } = await supabase
            .from("doctors")
            .select("first_name, last_name, email")
            .eq("doctor_id", id)
            .single();

        const { data: patientData, error: patError } = await supabase
            .from("patients")
            .select("first_name, last_name, email")
            .eq("patient_id", patientId)
            .single();

        if (docError || patError) {
            console.error("Помилка завантаження email:", docError || patError);
            alert(
                "Сеанс підтверджено, але сталася помилка при підготовці листів."
            );
        }

        const therapistName = doctorData
            ? `${doctorData.first_name} ${doctorData.last_name}`
            : "Ваш терапевт";
        const therapistEmail = doctorData?.email;
        const patientEmail = patientData?.email;
        const clientName = patientData
            ? `${patientData.first_name} ${patientData.last_name}`
            : "Пацієнт";

        const selectedSessionDateObj = new Date(selectedSession.date);
        const dateStr = selectedSessionDateObj.toLocaleDateString('uk-UA');
        const timeStr = formatSessionTime(selectedSession.date);

        try {
            if (patientEmail) {
                await fetch("http://localhost:4000/send-booking-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: patientEmail,
                        therapistName,
                        date: dateStr,
                        time: timeStr,
                    }),
                });
            }

            if (therapistEmail) {
                await fetch("http://localhost:4000/send-new-client-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: therapistEmail,
                        clientName,
                        date: dateStr,
                        time: timeStr,
                    }),
                });
            }

            alert("Сеанс підтверджено! Листи надіслано.");
        } catch (err) {
            console.error("Помилка при відправці листів:", err);
            alert(
                "Сеанс підтверджено, але сталася помилка при відправці листів. Перевірте пошту пізніше."
            );
        }

        setSessionDates((prevDates) =>
            prevDates.map((session) =>
                session.date === selectedSession.date
                    ? { ...session, is_booked: true }
                    : session
            )
        );

        setShowSessionForm(false);
        setSelectedDate(null);
        setSessionTimes([]);
        setSelectedTime(null);
    };

    const changeMonth = (direction) => {
        setLoading(true);

        if (direction === "prev") {
            setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
            setCurrentYear((prevYear) =>
                currentMonth === 0 ? prevYear - 1 : prevYear
            );
        } else {
            setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
            setCurrentYear((prevYear) =>
                currentMonth === 11 ? prevYear + 1 : prevYear
            );
        }
    };

    return (
        <div className="container">
            <Frame className="leafIcon" />

            <div className="calendar">
                <div className="calendar-header">
                    <span className="month-picker">{currentYear}</span>
                    <div className="year-picker">
                        <span
                            id="pre-month"
                            style={{ cursor: "pointer" }}
                            onClick={() => changeMonth("prev")}
                        >
                            &lt;
                        </span>
                        <span
                            id="month"
                            style={{ cursor: "pointer", margin: "0 10px" }}
                        >
                            {monthNames[currentMonth]}
                        </span>
                        <span
                            id="next-month"
                            style={{ cursor: "pointer" }}
                            onClick={() => changeMonth("next")}
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
                            <button
                                className="confirmsession"
                                onClick={handleConfirmSession}
                            >
                                Підтвердити сеанс
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Frame className="leafIcon" />
        </div>
    );
};

export default TherCalendar;