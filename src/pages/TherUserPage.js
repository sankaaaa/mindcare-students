import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import supabase from '../config/databaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/loader.css';
import '../styles/user-page.css';
import Appointments from "../components/Appointments";

const TherUserPage = () => {
    const {doctor_id} = useParams();
    const [doctorData, setDoctorData] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const navigate = useNavigate();
    const storedDoctorId = localStorage.getItem('doctor_id');

    useEffect(() => {
        const fetchDoctorData = async () => {

            if (!storedDoctorId) {
                console.error('Doctor ID не знайдено в localStorage');
                alert('Не вдалося завантажити дані лікаря.');
                return;
            }

            const {data, error} = await supabase
                .from('doctors')
                .select('first_name, last_name, specialization, experience, email, phone_number, ' +
                    'meet_fomat, city, doc_sex, doc_date, doc_session, doc_rev, doc_lang, doc_education, doc_way, doc_photo')
                .eq('doctor_id', storedDoctorId)
                .single();

            if (error) {
                console.error('Помилка завантаження даних:', error.message);
                alert('Не вдалося завантажити дані лікаря.');
            } else {
                setDoctorData(data);
            }
        };

        fetchDoctorData();
    }, [doctor_id, navigate]);


    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <Header/>
            <main>
                {doctorData ? (
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
                                    <span>Загальна інформація</span>
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

                            {activeTab === 'general' && (
                                <div className="card-doc">
                                    <section id="gen-ttl" className="section-doc">
                                        <h2 className="section-title">Загальна інформація</h2>
                                        <p className="info-item"><span
                                            className="info-label">Ім'я:</span> {doctorData.first_name}</p>
                                        <p className="info-item"><span
                                            className="info-label">Прізвище:</span> {doctorData.last_name}</p>
                                        <p className="info-item"><span
                                            className="info-label">Кваліфікація:</span> {doctorData.specialization}</p>
                                        <p className="info-item"><span
                                            className="info-label">Досвід роботи:</span> {doctorData.experience} років
                                        </p>
                                        <p className="info-item"><span
                                            className="info-label">Стать:</span> {doctorData.doc_sex}</p>
                                        <p className="info-item"><span
                                            className="info-label">Дата народження:</span> {doctorData.doc_date}</p>

                                    </section>

                                    <section className="section-doc">
                                        <img src={doctorData.doc_photo} alt={'text'} className="doc-photo"/>
                                    </section>

                                    <section className="section-doc">
                                        <h2 className="section-title">Контактні дані</h2>
                                        <p className="info-item"><span
                                            className="info-label">Email:</span> {doctorData.email}</p>
                                        <p className="info-item"><span
                                            className="info-label">Телефон:</span> {doctorData.phone_number}</p>
                                        <p className="info-item"><span
                                            className="info-label">Формат зустрічі:</span> {doctorData.meet_fomat}</p>
                                        <p className="info-item"><span
                                            className="info-label">Місто:</span> {doctorData.city}</p>
                                    </section>

                                    <section className="section-doc">
                                        <h2 className="section-title">Професійна інформація</h2>
                                        <p className="info-item"><span
                                            className="info-label">Сесії:</span> {doctorData.doc_session}</p>
                                        <p className="info-item"><span
                                            className="info-label">Рев'ю:</span> {doctorData.doc_rev}</p>
                                        <p className="info-item"><span
                                            className="info-label">Мови:</span> {doctorData.doc_lang}</p>
                                    </section>

                                    <section className="section-doc">
                                        <h2 className="section-title">Освіта</h2>
                                        <p className="info-item"><span
                                            className="info-label">Освіта:</span> {doctorData.doc_education}</p>
                                    </section>

                                    <section className="section-doc">
                                        <h2 className="section-title">Додаткова інформація</h2>
                                        <p className="info-item"><span
                                            className="info-label">Шлях:</span> {doctorData.doc_way}</p>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'appointments' && (
                                <div className="app-section-content-doc">
                                    <Appointments doctorId={storedDoctorId}/>
                                </div>
                            )}

                        </div>
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

export default TherUserPage;
