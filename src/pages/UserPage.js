import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from '../config/databaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/loader.css';
import '../styles/user-page.css';

const UserPage = () => {
    const [patientData, setPatientData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('general');
    const [isEditing, setIsEditing] = useState(false);

    const navigate = useNavigate();
    const storedPatientId = localStorage.getItem('patient_id');

    useEffect(() => {
        fetchPatientData();
        fetchAppointments();
    }, []);

    const fetchPatientData = async () => {
        const {data, error} = await supabase
            .from('patients')
            .select('first_name, last_name, date_of_birth, gender, email, phone_number, address')
            .eq('patient_id', storedPatientId)
            .single();

        if (error) {
            console.error('Помилка завантаження даних:', error.message);
            alert('Не вдалося завантажити дані пацієнта.');
        } else {
            setPatientData(data);
        }
    };

    const fetchAppointments = async () => {
        const {data, error} = await supabase
            .from('times')
            .select('doctor_id, date')
            .eq('patient', storedPatientId);

        if (error) {
            console.error('Помилка завантаження записів:', error.message);
            return;
        }

        const appointmentsWithNames = await Promise.all(
            data.map(async (appointment) => {
                const {data: doctorData} = await supabase
                    .from('doctors')
                    .select('first_name, last_name')
                    .eq('doctor_id', appointment.doctor_id)
                    .single();

                return {
                    ...appointment,
                    doctor_name: `${doctorData.first_name} ${doctorData.last_name}`,
                };
            })
        );

        setAppointments(appointmentsWithNames);
    };

    const handleTabChange = (tab) => setActiveTab(tab);

    const handleChange = (field, value) => {
        setPatientData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveChanges = async () => {
        const {error} = await supabase
            .from('patients')
            .update({
                first_name: patientData.first_name,
                last_name: patientData.last_name,
                date_of_birth: patientData.date_of_birth,
                gender: patientData.gender,
                email: patientData.email,
                phone_number: patientData.phone_number,
                address: patientData.address
            })
            .eq('patient_id', storedPatientId);

        if (error) {
            alert("Помилка збереження");
            console.error(error);
        } else {
            alert("Дані оновлено");
        }
    };

    const handleBookSession = () => navigate('/all-therapists');

    return (
        <>
            <Header/>
            <main>
                {patientData ? (
                    <div>

                        <div className="mydict-doc">
                            <div className="lol">
                                <label>
                                    <input
                                        type="radio"
                                        name="radio"
                                        checked={activeTab === 'general'}
                                        onChange={() => handleTabChange('general')}
                                    />
                                    <span>Мої дані</span>
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="radio"
                                        checked={activeTab === 'appointments'}
                                        onChange={() => handleTabChange('appointments')}
                                    />
                                    <span>Мої записи</span>
                                </label>
                            </div>

                            <div className="edit-btn-container">
                                <button
                                    className="edit-btn"
                                    onClick={() => {
                                        if (isEditing) saveChanges();
                                        setIsEditing(!isEditing);
                                    }}
                                >
                                    {isEditing ? "Зберегти" : "Редагувати"}
                                </button>
                            </div>
                        </div>

                        {/* ------------------- ВКЛАДКА: Мої дані ------------------- */}
                        {activeTab === 'general' && (
                            <div className="card-doc">

                                <section className="section-doc">
                                    <h2 className="section-title">Особиста інформація</h2>

                                    <p className="info-item">
                                        <span className="info-label">Ім'я:</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={patientData.first_name}
                                                onChange={(e) => handleChange("first_name", e.target.value)}
                                            />
                                        ) : patientData.first_name}
                                    </p>

                                    <p className="info-item">
                                        <span className="info-label">Прізвище:</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={patientData.last_name}
                                                onChange={(e) => handleChange("last_name", e.target.value)}
                                            />
                                        ) : patientData.last_name}
                                    </p>

                                    <p className="info-item">
                                        <span className="info-label">Дата народження:</span>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={patientData.date_of_birth}
                                                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                                            />
                                        ) : patientData.date_of_birth}
                                    </p>

                                    <p className="info-item">
                                        <span className="info-label">Стать:</span>
                                        {isEditing ? (
                                            <select
                                                value={patientData.gender}
                                                onChange={(e) => handleChange("gender", e.target.value)}
                                            >
                                                <option value="male">Чоловік</option>
                                                <option value="female">Жінка</option>
                                                <option value="another">Інша</option>
                                            </select>
                                        ) : patientData.gender}
                                    </p>
                                </section>

                                <section className="section-doc">
                                    <h2 className="section-title">Контактні дані</h2>

                                    <p className="info-item">
                                        <span className="info-label">Email:</span>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={patientData.email}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                            />
                                        ) : patientData.email}
                                    </p>

                                    <p className="info-item">
                                        <span className="info-label">Телефон:</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={patientData.phone_number}
                                                onChange={(e) => handleChange("phone_number", e.target.value)}
                                            />
                                        ) : patientData.phone_number}
                                    </p>

                                    <p className="info-item">
                                        <span className="info-label">Адреса:</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={patientData.address}
                                                onChange={(e) => handleChange("address", e.target.value)}
                                            />
                                        ) : patientData.address}
                                    </p>

                                </section>

                            </div>
                        )}

                        {/* ------------------- ВКЛАДКА: Мої записи ------------------- */}
                        {activeTab === 'appointments' && (
                            <div className="app-section-content-doc">
                                <div className="card-two">
                                    <section className="section">
                                        <h2 className="section-title">Мої записи</h2>

                                        {appointments.length > 0 ? (
                                            appointments.map((appointment, index) => (
                                                <div key={index} className="appointment-item">
                                                    <p><span className="info-label">Спеціаліст:</span> {appointment.doctor_name}</p>
                                                    <p><span className="info-label">Дата і час:</span> {new Date(appointment.date).toLocaleString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div>
                                                <p>У вас немає записів.</p>
                                                <button className="book-session-btn" onClick={handleBookSession}>
                                                    Забронювати сеанс
                                                </button>
                                            </div>
                                        )}

                                    </section>
                                </div>
                            </div>
                        )}

                        <Footer/>

                    </div>
                ) : (
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
                )}
            </main>
        </>
    );
};

export default UserPage;
